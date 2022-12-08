# hashnode-assets-backup

Hashnode backup posts to GitHub but assets are linked to cdn.hashnode.com, this action will download the assets and add them to the repo

## Inputs

### `output_path`

## Example usage

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
        uses: niradler/hashnode-assets-backup@v0.1
        with:
          output_path: 'assets'
          pattern: '**.md'
          files: ${{ env.CHANGED_FILES }}
      - uses: EndBug/add-and-commit@v9
        with:
          add: 'assets'
          author_name: Backup Bot
          author_email: backup@bot.com
          message: 'Commit files'

```


![Demo](https://cdn.hashnode.com/res/hashnode/image/upload/v1642373588890/GV9w3XVCL.png align="left")