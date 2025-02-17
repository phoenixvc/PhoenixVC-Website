import logging
from pathlib import Path
import re
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

def get_header_changes(content: str) -> List[Tuple[str, str]]:
    """Find headers that need anchor updates or additions"""
    changes = []
    processed_headers = set()  # Track what we've already processed
    
    # Pattern matches both headerless and old-style anchors
    headers = re.finditer(
        r'^(#{1,6})\s+([^{\n]+?)(?:\s*\{#([\w-]+)\})?\s*$',
        content,
        re.MULTILINE
    )
    
    for match in headers:
        level = match.group(1)
        text = match.group(2).strip()
        existing_anchor = match.group(3)  # Will be None if no anchor exists
        
        # Create a unique identifier for this header
        header_id = f"{level}_{text}"
        
        # Skip if we've already processed this header
        if header_id in processed_headers:
            logger.debug(f"Skipping duplicate header: {header_id}")
            continue
            
        processed_headers.add(header_id)
        
        old = match.group(0)
        if existing_anchor:
            # Convert old {#anchor} to new {: #anchor} format
            new = f"{level} {text} {{: #{existing_anchor}}}"
            logger.debug(f"Converting existing anchor: {old} -> {new}")
        else:
            # Add new anchor
            anchor = text.lower().replace(' ', '-')
            anchor = re.sub(r'[^\w\-]', '', anchor)
            new = f"{level} {text} {{: #{anchor}}}"
            logger.debug(f"Adding new anchor: {old} -> {new}")
        
        # Only add if it's actually different
        if old != new:
            changes.append((old, new))
    
    return changes

def add_missing_anchors(docs_dir: Path):
    """Add missing anchors to markdown headers with confirmation prompts"""
    logger.info("Scanning for headers without anchors...")
    files_to_update: Dict[Path, List[tuple]] = {}
    
    # Collect all files needing updates
    for md_file in docs_dir.rglob("*.md"):
        logger.debug(f"Processing file: {md_file}")
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        changes = get_header_changes(content)
        if changes:
            logger.debug(f"Found {len(changes)} changes in {md_file}")
            for old, new in changes:
                logger.debug(f"  Change: {old.strip()} -> {new.strip()}")
            files_to_update[md_file] = changes
    
    if not files_to_update:
        logger.info("No files need anchor updates")
        return
    
    # Display changes in a simple format
    print("\nProposed changes:")
    for file_path, changes in files_to_update.items():
        print(f"\nFile: {file_path.relative_to(docs_dir)}")
        for old, new in changes:
            print(f"  {old.strip()} -> {new.strip()}")
    
    response = input("\nApply these changes? [y/N]: ").lower()
    if response != 'y':
        logger.info("Operation cancelled")
        return
    
    # Apply changes
    for file_path, changes in files_to_update.items():
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in changes:
            content = content.replace(old, new)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            print(f"Updated {file_path.relative_to(docs_dir)}")
    
    logger.info("Completed adding missing anchors")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    docs_dir = Path("docs")
    add_missing_anchors(docs_dir)
