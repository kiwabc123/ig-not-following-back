# Follower Lost

Instagram follower analysis tool for finding accounts you follow that do not follow you back.

## Requirements

- Node.js 18+
- Instagram export files:
  - `followers_1.json`
  - `following.json`

## Install

```bash
npm install
```

## Data Folder

The script auto-detects your export folder from common locations (including Desktop paths), or you can set it explicitly with `IG_DATA_DIR`.

PowerShell example:

```powershell
$env:IG_DATA_DIR = "C:\Users\<you>\Desktop\connections\followers_and_following"
npm run dev
```

## Run

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Run built output:

```bash
npm run start
```

## What it does

1. Reads follower and following data from Instagram export JSON files.
2. Compares usernames.
3. Prints accounts that are not following you back.

## Privacy

Keep Instagram export data out of version control. If you place export folders inside this repo, ensure they are listed in `.gitignore`.
