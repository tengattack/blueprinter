'use strict'

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const parse = require('comment-parser')

function readFileAsync(path, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

function globReadDirAsync(pattern, opts) {
  return new Promise((resolve, reject) => {
    glob(pattern, opts, (err, files) => {
      if (err) return reject(err)
      return resolve(files)
    })
  })
}

function writeAsync(ws, chunk, encoding) {
  return new Promise((resolve, reject) => {
    ws.write(chunk, encoding, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function getGroupTitle(name, str) {
  name = name.trim()
  if (name) {
    return name
  }
  if (str.startsWith('# ')) {
    return str.match(/# (.*)/)[1]
  }
}

async function main(dir, opts) {
  const pattern = opts.pattern || '**/*.js'
  const files = await globReadDirAsync(pattern, {
    cwd: dir,
    root: dir,
    nodir: true,
    ignore: [ 'node_modules/**/*' ],
  })

  const apis = {
    entry: '',
    dataStructures: [],
    groups: {},
    contents: [],
  }
  for (const file of files) {
    const data = await readFileAsync(path.join(dir, file), 'utf8')
    const comments = parse(data, {
      trim: false,
      join: true,
    })
    let group
    for (const comment of comments) {
      for (const tag of comment.tags) {
        if (tag.tag === 'apib') {
          switch (tag.type) {
          case 'entry':
            apis.entry = tag.description
            break
          case 'group':
            group = getGroupTitle(tag.name, tag.description)
            if (!group) {
              throw new Error('No found group title')
            }
            const description = tag.description.trim()
            if (apis.groups[group]) {
              if (description) {
                apis.groups[group][0] = tag.description
              }
            } else {
              apis.groups[group] = [ tag.description ]
            }
            break
          case 'ds':
          case 'data structures':
            apis.dataStructures.push(tag.description)
            break
          default:
            if (group) {
              apis.groups[group].push(tag.description)
            } else {
              apis.contents.push(tag.description)
            }
          }
        }
      }
    }
  }

  const ws = fs.createWriteStream(opts.outputFile)
  // output
  await writeAsync(ws, 'FORMAT: 1A\n')
  if (apis.entry) {
    await writeAsync(ws, apis.entry)
  }
  for (let k in apis.groups) {
    const groups = apis.groups[k]
    for (let i = 0; i < groups.length; i++) {
      await writeAsync(ws, groups[i])
    }
  }
  for (let i = 0; i < apis.contents.length; i++) {
    await writeAsync(ws, apis.contents[i])
  }
  if (apis.dataStructures.length > 0) {
    await writeAsync(ws, '# Data Structures\n\n')
    for (let i = 0; i < apis.dataStructures.length; i++) {
      await writeAsync(ws, apis.dataStructures[i])
    }
  }
  ws.close()
}

if (process.argv.length <= 3) {
  console.log('Blueprinter v1.0.1\n'
    + '  blueprinter project_path [pattern] output_file\n'
    + '\nParams:\n'
    + '  pattern: Match pattern. Default: **/*.js'
  )
  process.exit(1)
}

const projectPath = process.argv[2]
const opts = {}
if (process.argv.length > 4) {
  opts.pattern = process.argv[3]
  opts.outputFile = process.argv[4]
} else {
  opts.outputFile = process.argv[3]
}

main(projectPath, opts).catch(console.error)
