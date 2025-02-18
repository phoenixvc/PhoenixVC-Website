#!/usr/bin/env python3
import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import argparse

logger = logging.getLogger(__name__)

def find_links(content: str) -> List[Tuple[str, int, int]]:
    """Find all markdown links in content"""
    links = []
    for match in re.finditer(r'\]\((\.\.\/)*([^)]+)\)', content):
        links.append((match.group(0), match.start(), match.end()))
    return links

def fix_link(match: str, current_file: Path, docs_dir: Path) -> Tuple[str, str]:
    """
    Calculate the proper relative path for a link
    
    Args:
        match: Original link text
        current_file: Path object of the current markdown file
        docs_dir: Root directory of documentation
    
    Returns:
        Tuple of (original link, fixed link)
    """
    link_pattern = r'\]\((\.\.\/)*([^)]+)\)'
    link_match = re.match(link_pattern, match)
    if not link_match:
        return match, match

    link = link_match.group(2)
    if link.startswith('http'):
        return match, match
    
    try:
        target = (current_file.parent / link).resolve()
        if not target.exists() and not link.startswith('#'):
            logger.warning(f"Target file does not exist: {target}")
            return match, match
        
        rel_path = os.path.relpath(target, current_file.parent)
        return match, f']({rel_path})'
    except Exception as e:
        logger.error(f"Error processing link {link}: {str(e)}")
        return match, match

def fix_relative_links(docs_dir: str) -> None:
    """Fix relative links in markdown files with confirmation prompts"""
    docs_path = Path(docs_dir)
    if not docs_path.exists():
        logger.error(f"Documentation directory does not exist: {docs_dir}")
        return

    logger.info("Scanning for relative links to fix...")
    files_to_update: Dict[Path, List[Tuple[str, str]]] = {}

    # First pass: collect all files needing updates
    for file in docs_path.rglob('*.md'):
        try:
            content = file.read_text(encoding='utf-8')
            links = find_links(content)
            
            if links:
                changes = []
                for link, _, _ in links:
                    old, new = fix_link(link, file, docs_path)
                    if old != new:
                        changes.append((old, new))
                
                if changes:
                    files_to_update[file] = changes
        except Exception as e:
            logger.error(f"Error processing file {file}: {str(e)}")
            continue

    if not files_to_update:
        logger.info("No files need link updates")
        return

    # Display summary and get confirmation
    print("\nFiles needing link updates:")
    for file_path, changes in files_to_update.items():
        print(f"\n{file_path.relative_to(docs_path)}:")
        for old, new in changes:
            print(f"  Old: {old}")
            print(f"  New: {new}")

    response = input("\nWould you like to proceed with these changes? [y/N]: ").lower()
    
    if response != 'y':
        logger.info("Operation cancelled by user")
        return

    # Second pass: apply confirmed changes
    for file_path, changes in files_to_update.items():
        try:
            content = file_path.read_text(encoding='utf-8')
            
            print(f"\nUpdating {file_path.relative_to(docs_path)}")
            print("Changes to be made:")
            for old, new in changes:
                print(f"  {old} -> {new}")
            
            response = input("Proceed with this file? [y/N]: ").lower()
            
            if response == 'y':
                for old, new in changes:
                    content = content.replace(old, new)
                file_path.write_text(content, encoding='utf-8')
                print(f"Updated {file_path.relative_to(docs_path)}")
            else:
                print(f"Skipped {file_path.relative_to(docs_path)}")
        
        except Exception as e:
            logger.error(f"Error updating file {file_path}: {str(e)}")
            continue

    logger.info("Completed fixing relative links")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fix relative links in markdown files')
    parser.add_argument('--docs-dir', default='docs', help='Documentation directory path')
    args = parser.parse_args()
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    fix_relative_links(args.docs_dir)
