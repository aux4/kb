# kb add

Add a new knowledge entry

## Usage

```bash
aux4 kb add "<topic>" [--content <content>] [--file <file>] [--tags <tags>] [--folder <folder>]
```

## Variables

- `topic` (required) - Topic title
- `--content` - Markdown content for the entry
- `--file` - Path to a markdown file to use as content
- `--tags` - Comma-separated tags for the entry
- `--folder` (default: `.knowledge`) - Knowledge base folder path

## Examples

```bash
aux4 kb add "Docker Networking" --content "# Docker Networking\n\nDocker uses bridge networks." --tags "docker,networking"
```

```bash
aux4 kb add "API Design" --file notes/api-design.md --tags "api,design"
```
