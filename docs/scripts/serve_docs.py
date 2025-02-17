#!/usr/bin/env python3
import os
import sys
import subprocess
import re
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from .fix_links import find_links, fix_link
from .add_anchors import get_header_changes
from .create_templates import find_missing_files, create_missing_files

class DocIssues:
    def __init__(self):
        self.files_needing_links: Dict[Path, List[Tuple[str, str]]] = {}
        self.files_needing_anchors: Dict[Path, List[Tuple[str, str]]] = {}
        self.files_missing: Dict[Path, List[str]] = {}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def apply_fixes_to_file(file_path: Path, docs_dir: Path, fixes_links: Optional[List[Tuple[str, str]]] = None, 
                       fixes_anchors: Optional[List[Tuple[str, str]]] = None) -> bool:
    """Apply fixes to a single file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        if fixes_links:
            logger.debug(f"Applying {len(fixes_links)} link fixes to {file_path}")
            for old, new in fixes_links:
                logger.debug(f"  Link fix: {old} -> {new}")
                content = content.replace(old, new)
        
        if fixes_anchors:
            logger.debug(f"Applying {len(fixes_anchors)} anchor fixes to {file_path}")
            for old, new in fixes_anchors:
                logger.debug(f"  Anchor fix: {old} -> {new}")
                content = content.replace(old, new)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            logger.info(f"Updated {file_path.relative_to(docs_dir)}")
        else:
            logger.debug(f"No changes needed for {file_path}")
        
        return True
    except Exception as e:
        logger.error(f"Error applying fixes to {file_path}: {str(e)}")
        return False

def scan_documentation_issues(docs_dir: Path) -> DocIssues:
    """Scan documentation for all types of issues"""
    issues = DocIssues()
    
    # Scan for missing files first
    issues.files_missing = find_missing_files(docs_dir)
    
    # Scan for link and anchor issues
    for file in docs_dir.rglob('*.md'):
        try:
            content = file.read_text(encoding='utf-8')
            
            # Check for link fixes
            links = find_links(content)
            if links:
                changes = []
                for link, _, _ in links:
                    old, new = fix_link(link, file, docs_dir)
                    if old != new:
                        changes.append((old, new))
                if changes:
                    issues.files_needing_links[file] = changes

            # Check for anchor fixes
            changes = get_header_changes(content)
            if changes:
                issues.files_needing_anchors[file] = changes
                
        except Exception as e:
            logger.error(f"Error scanning {file}: {str(e)}")
            
    return issues
    
def fix_relative_links(content: str, base_path: str) -> str:
    """Convert absolute /src/ links to relative links."""
    pattern = r'\/src\/([^"\')\s]+)'
    
    def replace_link(match):
        path = match.group(1)
        return os.path.relpath(path, base_path)
        
    return re.sub(pattern, replace_link, content)

def handle_documentation_fixes(docs_dir: Path, issues: DocIssues) -> None:
    """Handle all documentation fixes based on user input"""
    if not any([issues.files_needing_links, issues.files_needing_anchors, issues.files_missing]):
        print("No documentation issues found.")
        return

    # Handle link fixes
    if issues.files_needing_links:
        print(f"\nFound {len(issues.files_needing_links)} files needing link fixes")
        print("How would you like to handle link fixes?")
        print("1. Apply all link fixes automatically")
        print("2. Review and apply link fixes file by file")
        print("3. Skip link fixes")
        mode = input("Enter your choice (1-3): ")

        if mode == "1":
            for file_path in issues.files_needing_links:
                apply_fixes_to_file(file_path, docs_dir, fixes_links=issues.files_needing_links[file_path])
        elif mode == "2":
            for file_path in sorted(issues.files_needing_links.keys()):
                print(f"\nFile: {file_path.relative_to(docs_dir)}")
                print("Link fixes needed:")
                for old, new in issues.files_needing_links[file_path]:
                    print(f"  Old: {old}")
                    print(f"  New: {new}")
                if input(f"\nApply link fixes to this file? [y/N]: ").lower() == 'y':
                    apply_fixes_to_file(file_path, docs_dir, fixes_links=issues.files_needing_links[file_path])

    # Handle anchor fixes
    if issues.files_needing_anchors:
        print(f"\nFound {len(issues.files_needing_anchors)} files needing anchor fixes")
        print("How would you like to handle anchor fixes?")
        print("1. Apply all anchor fixes automatically")
        print("2. Review and apply anchor fixes file by file")
        print("3. Skip anchor fixes")
        mode = input("Enter your choice (1-3): ")

        if mode == "1":
            for file_path in issues.files_needing_anchors:
                apply_fixes_to_file(file_path, docs_dir, fixes_anchors=issues.files_needing_anchors[file_path])
        elif mode == "2":
            for file_path in sorted(issues.files_needing_anchors.keys()):
                print(f"\nFile: {file_path.relative_to(docs_dir)}")
                print("Anchor fixes needed:")
                for old, new in issues.files_needing_anchors[file_path]:
                    print(f"  Old: {old}")
                    print(f"  New: {new}")
                if input(f"\nApply anchor fixes to this file? [y/N]: ").lower() == 'y':
                    apply_fixes_to_file(file_path, docs_dir, fixes_anchors=issues.files_needing_anchors[file_path])

    # Handle missing files
    if issues.files_missing:
        print(f"\nFound {len(issues.files_missing)} files with missing references")
        print("How would you like to handle missing files?")
        print("1. Create all missing files automatically")
        print("2. Review and create missing files one by one")
        print("3. Skip creating missing files")
        mode = input("Enter your choice (1-3): ")

        if mode == "1":
            create_missing_files(docs_dir, issues.files_missing)
        elif mode == "2":
            for file_path, missing in issues.files_missing.items():
                print(f"\nFile {file_path.relative_to(docs_dir)} references missing files:")
                for missing_file in missing:
                    print(f"  - {missing_file}")
                if input(f"\nCreate missing files for this reference? [y/N]: ").lower() == 'y':
                    create_missing_files(docs_dir, {file_path: missing})

def main():
    """Main entry point"""
    logging.basicConfig(level=logging.INFO)
    
    try:
        root_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        logger.info(f"Project root directory: {root_dir}")
        
        os.chdir(root_dir)
        
        config_file = root_dir / "mkdocs.yml"
        if not config_file.exists():
            logger.error(f"mkdocs.yml not found at {config_file}")
            sys.exit(1)
        
        docs_dir = root_dir / "src"
        logger.info(f"Documentation directory: {docs_dir}")

        print("\nChecking for documentation issues...")
        response = input("Would you like to scan for potential documentation issues? [Y/n] ").lower()

        if response != 'n':
            issues = scan_documentation_issues(docs_dir)
            handle_documentation_fixes(docs_dir, issues)

        # Run mkdocs serve
        logger.info("Starting mkdocs serve...")
        subprocess.run(
            ["poetry", "run", "mkdocs", "serve", "-f", str(config_file)],
            check=True
        )
        
    except subprocess.CalledProcessError as e:
        logger.error(f"MkDocs error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
