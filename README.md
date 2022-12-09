# hashnode-assets-backup

Hashnode backup posts to GitHub but assets are linked to cdn.hashnode.com, this action will download the assets and add them to the repository.

all arguments are optional.

## Example usage

### Create your first backup

```yaml
on: 
  workflow_dispatch:
    inputs:
      output_path:
        description: "output folder"
        default: "assets"
      pattern:
        description: "files pattern"
        default: "**.md"
      posts_output_path:
        description: "posts folder"
        default: "posts"        
           

jobs:
  backup_hashnode:
    runs-on: ubuntu-latest
    name: Backup images from Hashnode md files
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Backup Hashnode
        id: backup
        uses: niradler/hashnode-assets-backup@v0.2
        with:
          output_path: ${{ github.event.inputs.output_path }}
          posts_output_path: ${{ github.event.inputs.posts_output_path }}
          pattern: ${{ github.event.inputs.pattern }}          
      - uses: EndBug/add-and-commit@v9
        with:
          add: 'assets'
          author_name: Backup Bot
          author_email: backup@bot.com
          message: 'Commit assets by workflow'
```

### Continues backup

```yaml
on:
  push:
    paths:
      - "**.md"

jobs:
  backup_hashnode:
    runs-on: ubuntu-latest
    name: Backup images from Hashnode md files
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v34
      - name: Changed files
        run: |
          echo "CHANGED_FILES=${{ steps.changed-files.outputs.all_changed_files }}" >> $GITHUB_ENV
      - name: Backup Hashnode
        id: backup
        uses: niradler/hashnode-assets-backup@v0.2
        with:
          output_path: 'assets'
          pattern: '**.md'
          files: ${{ env.CHANGED_FILES }}
          posts_output_path: 'posts'
      - uses: EndBug/add-and-commit@v9
        with:
          add: 'assets'
          author_name: Backup Bot
          author_email: backup@bot.com
          message: 'Commit files'
```

**to use the backup assets, replace the original link**

```md
![Demo](https://cdn.hashnode.com/res/hashnode/image/upload/v1642373588890/GV9w3XVCL.png align="left")
```

**to use the backup path**

```md
![Demo](/assets/res/hashnode/image/upload/v1642373588890/GV9w3XVCL.png?raw=true)
```
