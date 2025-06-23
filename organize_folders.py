#!/usr/bin/env python3
"""
Multi-Folder File Organizer
Organizes files in various folders (Downloads, Desktop, Documents, etc.) by file type
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
import platform
import argparse

class FolderOrganizer:
    def __init__(self):
        self.system = platform.system()
        self.home_dir = Path.home()
        self.log_file = self.home_dir / "file_organizer_log.json"
        self.operations_log = []

        # File type mappings
        self.file_types = {
            'Images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.webp', '.ico', '.heic'],
            'Documents': ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.xls', '.xlsx', '.ppt', '.pptx', '.csv'],
            'Videos': ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp'],
            'Audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
            'Archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'],
            'Applications': ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage'],
            'Code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go'],
            'Fonts': ['.ttf', '.otf', '.woff', '.woff2'],
        }

        # Default folders for different systems
        self.default_folders = self._get_default_folders()

    def _get_default_folders(self):
        """Get default folders based on operating system"""
        if self.system == "Windows":
            return {
                '1': self.home_dir / "Downloads",
                '2': self.home_dir / "Desktop",
                '3': self.home_dir / "Documents",
                '4': self.home_dir / "Pictures",
                '5': self.home_dir / "Videos",
                '6': self.home_dir / "Music"
            }
        elif self.system == "Darwin":  # macOS
            return {
                '1': self.home_dir / "Downloads",
                '2': self.home_dir / "Desktop",
                '3': self.home_dir / "Documents",
                '4': self.home_dir / "Pictures",
                '5': self.home_dir / "Movies",
                '6': self.home_dir / "Music"
            }
        else:  # Linux
            return {
                '1': self.home_dir / "Downloads",
                '2': self.home_dir / "Desktop",
                '3': self.home_dir / "Documents",
                '4': self.home_dir / "Pictures",
                '5': self.home_dir / "Videos",
                '6': self.home_dir / "Music"
            }

    def get_file_category(self, file_path):
        """Determine the category of a file based on its extension"""
        extension = file_path.suffix.lower()
        for category, extensions in self.file_types.items():
            if extension in extensions:
                return category
        return 'Others'

    def create_category_folder(self, base_path, category):
        """Create a category folder if it doesn't exist"""
        category_path = base_path / category
        category_path.mkdir(exist_ok=True)
        return category_path

    def move_file_safely(self, source, destination, dry_run=False):
        """Move file safely, handling duplicates"""
        if dry_run:
            print(f"[DRY RUN] Would move: {source} → {destination}")
            return True

        try:
            # Handle duplicate files
            if destination.exists():
                base_name = destination.stem
                extension = destination.suffix
                counter = 1
                while destination.exists():
                    new_name = f"{base_name}_{counter}{extension}"
                    destination = destination.parent / new_name
                    counter += 1

            shutil.move(str(source), str(destination))

            # Log the operation
            operation = {
                'timestamp': datetime.now().isoformat(),
                'action': 'move',
                'source': str(source),
                'destination': str(destination),
                'category': self.get_file_category(source)
            }
            self.operations_log.append(operation)

            print(f"✓ Moved: {source.name} → {destination.parent.name}/{destination.name}")
            return True

        except Exception as e:
            print(f"✗ Error moving {source.name}: {e}")
            return False

    def organize_folder(self, folder_path, dry_run=False):
        """Organize files in the specified folder"""
        folder_path = Path(folder_path)

        if not folder_path.exists():
            print(f"Error: Folder '{folder_path}' does not exist!")
            return False

        if not folder_path.is_dir():
            print(f"Error: '{folder_path}' is not a directory!")
            return False

        print(f"\n{'[DRY RUN] ' if dry_run else ''}Organizing folder: {folder_path}")
        print("-" * 50)

        files_moved = 0
        files_processed = 0

        # Get all files in the folder (not subdirectories)
        files = [f for f in folder_path.iterdir() if f.is_file()]

        if not files:
            print("No files found to organize.")
            return True

        for file_path in files:
            files_processed += 1
            category = self.get_file_category(file_path)

            # Skip hidden files and system files
            if file_path.name.startswith('.') or file_path.name.startswith('~'):
                continue

            # Create category folder
            category_folder = self.create_category_folder(folder_path, category)
            destination = category_folder / file_path.name

            # Move the file
            if self.move_file_safely(file_path, destination, dry_run):
                files_moved += 1

        print(f"\n{'[DRY RUN] ' if dry_run else ''}Summary:")
        print(f"Files processed: {files_processed}")
        print(f"Files moved: {files_moved}")

        # Save log
        if not dry_run and self.operations_log:
            self.save_log()

        return True

    def save_log(self):
        """Save operations log to file"""
        try:
            existing_log = []
            if self.log_file.exists():
                with open(self.log_file, 'r') as f:
                    existing_log = json.load(f)

            existing_log.extend(self.operations_log)

            with open(self.log_file, 'w') as f:
                json.dump(existing_log, f, indent=2)

            print(f"Operations logged to: {self.log_file}")
        except Exception as e:
            print(f"Warning: Could not save log: {e}")

    def show_recent_operations(self):
        """Show recent file operations"""
        if not self.log_file.exists():
            print("No operations log found.")
            return

        try:
            with open(self.log_file, 'r') as f:
                all_operations = json.load(f)

            if not all_operations:
                print("No operations found in log.")
                return

            print("\n" + "="*60)
            print("                RECENT OPERATIONS")
            print("="*60)

            # Show last 10 operations
            recent_ops = all_operations[-10:]
            for i, op in enumerate(recent_ops, 1):
                timestamp = datetime.fromisoformat(op['timestamp']).strftime("%Y-%m-%d %H:%M:%S")
                source_name = Path(op['source']).name
                dest_folder = Path(op['destination']).parent.name
                print(f"{i:2}. [{timestamp}] {source_name} → {dest_folder}/ ({op['category']})")

            print("="*60)

        except Exception as e:
            print(f"Error reading operations log: {e}")

    def undo_last_operation(self):
        """Undo the last file operation"""
        if not self.log_file.exists():
            print("No operations log found.")
            return False

        try:
            with open(self.log_file, 'r') as f:
                all_operations = json.load(f)

            if not all_operations:
                print("No operations to undo.")
                return False

            last_op = all_operations[-1]
            source = Path(last_op['destination'])
            destination = Path(last_op['source'])

            if not source.exists():
                print(f"Error: File {source} no longer exists!")
                return False

            # Move file back
            shutil.move(str(source), str(destination))
            print(f"✓ Undone: {source.name} moved back to {destination.parent}")

            # Remove from log
            all_operations.pop()
            with open(self.log_file, 'w') as f:
                json.dump(all_operations, f, indent=2)

            return True

        except Exception as e:
            print(f"Error undoing operation: {e}")
            return False

    def show_menu(self):
        """Display the main menu"""
        print("\n" + "="*50)
        print("         MULTI-FOLDER FILE ORGANIZER")
        print("="*50)
        print("Select a folder to organize:")
        print()

        for key, path in self.default_folders.items():
            folder_name = path.name
            exists = "✓" if path.exists() else "✗"
            print(f"{key}. {folder_name:<12} {exists} ({path})")

        print("7. Custom folder path")
        print("8. Show recent operations")
        print("9. Undo last operation")
        print("h. Help")
        print("0. Exit")
        print("-" * 50)

    def show_help(self):
        """Show help information"""
        print("\n" + "="*50)
        print("                    HELP")
        print("="*50)
        print("This tool organizes files by moving them into category folders:")
        print()
        for category, extensions in self.file_types.items():
            print(f"{category:<12}: {', '.join(extensions[:5])}")
            if len(extensions) > 5:
                print(f"{'':12}  (and {len(extensions)-5} more)")
        print()
        print("Features:")
        print("• Safe file moving with duplicate handling")
        print("• Dry-run mode (use --dry-run flag)")
        print("• Operation logging")
        print("• Cross-platform support")
        print("="*50)

def main():
    parser = argparse.ArgumentParser(description='Organize files in folders by type')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without moving files')
    parser.add_argument('--folder', type=str, help='Specify folder path directly')
    args = parser.parse_args()

    organizer = FolderOrganizer()

    # Direct folder organization
    if args.folder:
        organizer.organize_folder(args.folder, args.dry_run)
        return

    # Interactive mode
    while True:
        organizer.show_menu()
        choice = input("\nEnter your choice (0-9): ").strip()

        if choice == '0':
            print("Goodbye!")
            break
        elif choice in organizer.default_folders:
            folder_path = organizer.default_folders[choice]
            organizer.organize_folder(folder_path, args.dry_run)
        elif choice == '7':
            custom_path = input("Enter custom folder path: ").strip()
            if custom_path:
                organizer.organize_folder(custom_path, args.dry_run)
        elif choice == '8':
            organizer.show_recent_operations()
        elif choice == '9':
            if organizer.undo_last_operation():
                print("Last operation undone successfully!")
            else:
                print("Could not undo last operation.")
        elif choice.lower() == 'h':
            organizer.show_help()
        else:
            print("Invalid choice! Please try again.")

        if choice != '0':
            input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
