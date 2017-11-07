# blueprinter

A tool for generating API Blueprint document.

## Installation

```shell
$ npm i -g blueprinter-cli
$ blueprinter project_path [pattern] output_file
```

## Usage

### Write comments in source code

```js

// entry

/**
 * @apib {entry}
 *
 * # An Example HTTP API
 *
 * This is an example http api.
 *
 */

// group entry

/**
 * @apib {group} group_api
 *
 * # Group A Group API
 *
 * This is a group api.
 *
 */

// group content

/**
 * @apib {group} group_api
 *
 */

// data structures

/**
 * @apib {data structures}
 *
 * ## ResponseData
 * - `id`: `1` (number) - response id
 *
 */

// general

/**
 * @apib
 *
 * ## A Sample API [/api/sample]
 *
 * ### Get Response [GET]
 *
 * + Response 200 (application/json)
 *
 *     + Attributes
 *
 *         + `data` (ResponseData) - indicates response data
             and more description text
 *
 */

```

### Generate apib file

```shell
$ blueprinter '/usr/local/lib/node_modules/blueprinter' '**/*.md' example.apib
```

## License

MIT

