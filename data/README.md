# Data Directory

This directory stores project submissions as JSON files.

## Setup

Create `projects.json` with an empty array:

```json
[]
```

## Permissions

Make sure the directory is writable:

```bash
chmod 755 data/
chmod 644 data/projects.json
```

## Note

The `projects.json` file is gitignored to prevent committing user data to the repository.
