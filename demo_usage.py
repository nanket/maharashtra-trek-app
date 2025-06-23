#!/usr/bin/env python3
"""
Demo script showing how to use the FolderOrganizer programmatically
"""

from organize_folders import FolderOrganizer
from pathlib import Path
import tempfile
import os

def create_demo_files():
    """Create some demo files for testing"""
    # Create a temporary directory for demo
    demo_dir = Path.home() / "file_organizer_demo"
    demo_dir.mkdir(exist_ok=True)
    
    # Create sample files
    demo_files = [
        "document.pdf",
        "photo.jpg",
        "video.mp4",
        "song.mp3",
        "archive.zip",
        "presentation.pptx",
        "screenshot.png",
        "code.py",
        "font.ttf",
        "random.txt"
    ]
    
    print(f"Creating demo files in: {demo_dir}")
    for filename in demo_files:
        file_path = demo_dir / filename
        file_path.write_text(f"This is a demo {filename} file.")
        print(f"Created: {filename}")
    
    return demo_dir

def run_demo():
    """Run a demonstration of the file organizer"""
    print("="*60)
    print("           FILE ORGANIZER DEMONSTRATION")
    print("="*60)
    
    # Create demo files
    demo_dir = create_demo_files()
    
    print(f"\nDemo folder created at: {demo_dir}")
    print("\nFiles before organization:")
    for file in demo_dir.iterdir():
        if file.is_file():
            print(f"  - {file.name}")
    
    # Initialize organizer
    organizer = FolderOrganizer()
    
    print("\n" + "-"*50)
    print("Running DRY-RUN first (preview mode):")
    print("-"*50)
    
    # Run dry-run first
    organizer.organize_folder(demo_dir, dry_run=True)
    
    # Ask user if they want to proceed
    response = input("\nDo you want to proceed with actual organization? (y/n): ")
    
    if response.lower() == 'y':
        print("\n" + "-"*50)
        print("Running ACTUAL organization:")
        print("-"*50)
        
        # Run actual organization
        organizer.organize_folder(demo_dir, dry_run=False)
        
        print(f"\nFiles after organization:")
        for item in demo_dir.iterdir():
            if item.is_dir():
                print(f"\n📁 {item.name}/")
                for file in item.iterdir():
                    if file.is_file():
                        print(f"  - {file.name}")
    
    print(f"\nDemo completed! You can find the demo folder at: {demo_dir}")
    print("You can delete it when you're done exploring.")

if __name__ == "__main__":
    run_demo()
