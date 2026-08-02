# Mermaid Validator

[![CI](https://github.com/nickblantz/mermaid-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/nickblantz/mermaid-validator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A focused command-line tool for validating Mermaid syntax without rendering.
It accepts a Mermaid file, a Markdown file, or stdin and returns an exit status
that coding agents and automation can act on.

## Requirements

Node.js 22.13 or newer.

## Install from source

```sh
git clone https://github.com/nickblantz/mermaid-validator.git
cd mermaid-validator
npm ci
npm link
```

This installs the `mermaid-validate` command globally for the current Node.js
installation.

## Docker

Build the image:

```sh
docker build -t mermaid-validator .
```

Pipe a diagram through stdin:

```sh
printf 'flowchart LR\n  A --> B\n' | docker run --rm -i mermaid-validator
```

To validate a file, mount its directory read-only. The container reads files
relative to `/work`:

```sh
docker run --rm -v "$PWD:/work:ro" mermaid-validator architecture.mmd
docker run --rm -v "$PWD:/work:ro" mermaid-validator README.md
```

The image runs as an unprivileged user and has the same output and exit-status
contract as the local command.

## Usage

```text
mermaid-validate [FILE]
```

Omit `FILE` to read from stdin. Run `mermaid-validate --help` for the command
summary.

Validate a Mermaid file:

```sh
mermaid-validate architecture.mmd
```

Validate every Mermaid code fence in a Markdown file:

```sh
mermaid-validate README.md
```

Read a Mermaid diagram from stdin:

```sh
printf 'flowchart LR\n  A --> B\n' | mermaid-validate
```

Within a local checkout, the same command can be run without linking:

```sh
npm exec mermaid-validate -- architecture.mmd
```

### Input handling

| Input | Behavior |
| --- | --- |
| `.md`, `.markdown`, `.mdown`, or `.mkd` file | Validates every fenced block whose language is `mermaid` |
| Any other file | Validates the entire file as one Mermaid diagram |
| Stdin containing a Mermaid fence | Treats stdin as Markdown |
| Other stdin | Validates stdin as one Mermaid diagram |

A Markdown file with no Mermaid blocks is valid and reports zero diagrams.
Mermaid fences may use backticks or tildes.

### Exit statuses

| Status | Meaning |
| --- | --- |
| `0` | Every discovered diagram is valid |
| `1` | Mermaid syntax or a Mermaid code fence is invalid |
| `2` | Arguments are invalid or a file cannot be read |

Validation errors are written to stderr and include the input name and the
starting line of the affected Mermaid block.

## Design

The tool calls Mermaid's own parser so validation follows the installed
Mermaid version. Mermaid sanitizes labels during parsing and expects a DOM, so
the CLI supplies a minimal jsdom window before loading Mermaid. It does not
render diagrams or launch a browser.

The CLI intentionally accepts at most one file and has no configuration file,
rendering options, or output formats.

## Development

Install the locked dependencies and run the test suite:

```sh
npm ci
npm test
```

Before opening a pull request, verify the package contents as well:

```sh
npm pack --dry-run
```

Contributions should remain focused on reliable Mermaid syntax validation.
Bug reports should include the input, actual output, expected output, Node.js
version, and operating system.
