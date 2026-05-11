# Instagram Follower Analysis

A tool to analyze your Instagram followers and identify who isn't following you back.

## Features

- 🔍 Find accounts you follow that don't follow you back
- 👥 Find accounts that follow you but you don't follow back  
- 📊 View detailed follower statistics
- 🌐 Web app interface for easy analysis
- 💻 CLI for command-line usage
- ✅ Supports multiple follower files

## ⚠️ IMPORTANT: Multiple Follower Files

Instagram exports your followers across **multiple JSON files**:
- `followers_1.json`
- `followers_2.json`
- `followers_3.json`
- ... (more if you have many followers)

**You MUST upload or place ALL `followers_*.json` files** along with `following.json` for accurate results.

If you only upload one followers file, you'll get incorrect results!

## Getting Your Instagram Data

1. Go to **Settings → Account → Download Your Information**
2. Select **Followers and Following**
3. Wait for Instagram to prepare your file (usually takes a few minutes)
4. Download the ZIP file
5. Extract it - you'll find a folder called `followers_and_following`
6. Inside are multiple `followers_*.json` files and one `following.json` file

## Web App Usage

### Setup
```bash
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### How to Use
1. Extract all files from your Instagram data download
2. Click "Upload Files" or drag-and-drop
3. Select **ALL** `followers_*.json` files and the `following.json` file
4. View your analysis

## CLI Usage

### Setup
```bash
npm install
npm run build
```

### Configure Data Location

Set environment variable to your Instagram data folder:

**Windows (PowerShell):**
```powershell
$env:IG_DATA_DIR = "C:\path\to\followers_and_following"
node dist/src/index.js
```

**Windows (Command Prompt):**
```cmd
set IG_DATA_DIR=C:\path\to\followers_and_following
node dist/src/index.js
```

**Mac/Linux:**
```bash
export IG_DATA_DIR=/path/to/followers_and_following
node dist/src/index.js
```

Or place your `followers_and_following` folder in one of these locations:
- `../followers_and_following` (parent directory)
- `~/Desktop/connections/followers_and_following`

The CLI will automatically load all `followers_*.json` files it finds.

## Testing

### Run tests with your data
```bash
cd __tests__
node test.js
```

### Compare CLI and Web App results
```bash
cd __tests__
node compare-versions.js
```

To test with your data, copy your actual Instagram files to `__tests__/` directory.

## How It Works

1. **Extract usernames** from followers and following data
2. **Normalize usernames** (lowercase, trim whitespace) for accurate comparison
3. **Find mismatches**:
   - **Not Following Back**: Accounts you follow but don't follow you
   - **Unfollowed Followers**: Accounts that follow you but you don't follow

## Development

```bash
npm run dev   # Start development server
npm run lint  # Run linter
```

## Build & Deploy

```bash
npm run build  # Build for production
npm start      # Start production server
```

## Troubleshooting

### Getting wrong "Not Following Back" count?
You're likely only uploading `followers_1.json`. Instagram splits followers across multiple files:
- Upload ALL `followers_*.json` files
- Also upload `following.json`
- The tool automatically merges all followers files

### Analysis shows 0 results?
- Check that you extracted the correct files from Instagram
- Verify you're uploading both `following.json` AND all `followers_*.json` files
- Try running the test suite to debug

### Different results between CLI and Web App?
Both should produce identical results. If they differ, please report a bug.

## Privacy

Your Instagram data is:
- ✅ Processed locally in your browser (web app)
- ✅ Processed locally on your machine (CLI)
- ❌ Never sent to any server
- ❌ Never stored anywhere

Your data is yours. This tool runs entirely on your device.

## License

MIT

