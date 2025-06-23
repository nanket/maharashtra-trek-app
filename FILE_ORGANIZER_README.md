# Multi-Folder File Organizer

A comprehensive Python script that organizes files in various folders (Downloads, Desktop, Documents, etc.) by automatically sorting them into categorized subfolders based on file types.

## Features

- **Multi-folder support**: Organize Downloads, Desktop, Documents, Pictures, Videos, Music, or any custom folder
- **Smart categorization**: Automatically sorts files by type (Images, Documents, Videos, Audio, etc.)
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Safe operations**: Handles duplicate files by renaming them
- **Dry-run mode**: Preview changes before actually moving files
- **Operation logging**: Keeps track of all file movements
- **Undo functionality**: Reverse the last operation
- **Interactive menu**: Easy-to-use command-line interface

## File Categories

The organizer sorts files into these categories:

- **Images**: jpg, jpeg, png, gif, bmp, tiff, svg, webp, ico, heic
- **Documents**: pdf, doc, docx, txt, rtf, odt, xls, xlsx, ppt, pptx, csv
- **Videos**: mp4, avi, mkv, mov, wmv, flv, webm, m4v, 3gp
- **Audio**: mp3, wav, flac, aac, ogg, wma, m4a
- **Archives**: zip, rar, 7z, tar, gz, bz2, xz
- **Applications**: exe, msi, dmg, pkg, deb, rpm, appimage
- **Code**: py, js, html, css, java, cpp, c, php, rb, go
- **Fonts**: ttf, otf, woff, woff2
- **Others**: Any files that don't match the above categories

## Installation

1. **Download the files**:
   - `organize_folders.py` (main script)
   - `organize.bat` (Windows launcher)
   - `organize.sh` (macOS/Linux launcher)

2. **Make sure Python is installed**:
   - Python 3.6 or higher required
   - Download from [python.org](https://python.org) if needed

3. **Make the shell script executable** (macOS/Linux only):
   ```bash
   chmod +x organize.sh
   ```

## Usage

### Interactive Mode (Recommended)

**Windows:**
```cmd
organize.bat
```

**macOS/Linux:**
```bash
./organize.sh
```

**Direct Python:**
```bash
python organize_folders.py
```

This will show an interactive menu where you can:
1. Select Downloads folder
2. Select Desktop folder
3. Select Documents folder
4. Select Pictures folder
5. Select Videos folder
6. Select Music folder
7. Enter a custom folder path
8. View recent operations
9. Undo last operation
h. Show help
0. Exit

### Command Line Mode

**Organize a specific folder:**
```bash
python organize_folders.py --folder "/path/to/folder"
```

**Dry-run (preview only):**
```bash
python organize_folders.py --dry-run --folder "/path/to/folder"
```

**Interactive dry-run:**
```bash
python organize_folders.py --dry-run
```

## Examples

### Example 1: Organize Downloads folder
```
$ python organize_folders.py --folder ~/Downloads

Organizing folder: /Users/username/Downloads
--------------------------------------------------
✓ Moved: document.pdf → Documents/document.pdf
✓ Moved: photo.jpg → Images/photo.jpg
✓ Moved: video.mp4 → Videos/video.mp4
✓ Moved: song.mp3 → Audio/song.mp3

Summary:
Files processed: 4
Files moved: 4
```

### Example 2: Dry-run mode
```
$ python organize_folders.py --dry-run --folder ~/Desktop

[DRY RUN] Organizing folder: /Users/username/Desktop
--------------------------------------------------
[DRY RUN] Would move: presentation.pptx → Documents/presentation.pptx
[DRY RUN] Would move: screenshot.png → Images/screenshot.png

[DRY RUN] Summary:
Files processed: 2
Files moved: 2
```

## Safety Features

- **Duplicate handling**: If a file with the same name exists in the destination, it's renamed (e.g., `file_1.txt`)
- **Hidden file protection**: Hidden files (starting with `.`) are skipped
- **Logging**: All operations are logged to `~/file_organizer_log.json`
- **Undo**: You can undo the last operation through the menu
- **Dry-run**: Preview changes before making them

## Troubleshooting

### Permission Errors
If you get permission errors, try running with administrator/sudo privileges:

**Windows:**
```cmd
# Run Command Prompt as Administrator
organize.bat
```

**macOS/Linux:**
```bash
sudo ./organize.sh
```

### Python Not Found
Make sure Python is installed and in your PATH:
- Download from [python.org](https://python.org)
- On Windows, check "Add Python to PATH" during installation
- On macOS, you might need to use `python3` instead of `python`

### File Already Exists Errors
The script handles duplicates automatically by renaming them. If you still get errors, check folder permissions.

## Log File

Operations are logged to `~/file_organizer_log.json` with details including:
- Timestamp
- Source and destination paths
- File category
- Operation type

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
