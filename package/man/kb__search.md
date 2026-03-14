# kb search

Search the knowledge base

## Usage

```bash
aux4 kb search "<query>" [--folder <folder>]
```

## Variables

- `query` (required) - Search query (case-insensitive text match)
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Description

Searches all markdown entries (excluding index.md) for case-insensitive substring matches. Returns matching lines with surrounding context.

## Examples

```bash
aux4 kb search "networking"
```

```bash
aux4 kb search "error handling" --folder my-notes
```
