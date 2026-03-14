# kb update

Update an existing knowledge entry

## Usage

```bash
aux4 kb update "<topic>" [--content <content>] [--file <file>] [--folder <folder>]
```

## Variables

- `topic` (required) - Topic title
- `--content` - New markdown content
- `--file` - Path to a markdown file to use as content
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Examples

```bash
aux4 kb update "Docker Networking" --content "# Docker Networking\n\nUpdated content."
```
