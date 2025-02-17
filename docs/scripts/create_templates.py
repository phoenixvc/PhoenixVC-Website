#!/usr/bin/env python3
import os
import sys
import logging
from pathlib import Path
from typing import Dict, Set, List
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_template(template_name: str) -> str:
    """Load template content from file."""
    template_path = Path(__file__).parent / "templates" / f"{template_name}.md"
    try:
        return template_path.read_text(encoding='utf-8')
    except Exception as e:
        logger.error(f"Error loading template {template_name}: {str(e)}")
        return ""

def determine_template_type(file_path: str) -> str:
    """Determine the appropriate template type based on the file path."""
    path_lower = file_path.lower()
    
    if "components" in path_lower:
        return "component"
    elif "tokens" in path_lower:
        return "token"
    elif "changelog" in path_lower:
        return "changelog"
    else:
        return "guide"

def create_template_content(file_path: str, template_type: str) -> str:
    """Create content based on template type and file path."""
    template = load_template(template_type)
    if not template:
        return ""
        
    title = Path(file_path).stem.replace('-', ' ').title()
    
    if template_type == "component":
        component_name = title.replace(' ', '')
        component_path = str(Path(file_path).parent.name)
        return template.format(
            title=title,
            component_name=component_name,
            component_path=component_path
        )
    
    elif template_type == "token":
        token_type = title.lower()
        return template.format(
            title=title,
            token_type=token_type
        )
    
    elif template_type == "changelog":
        return template.format(
            date=datetime.now().strftime("%Y-%m-%d")
        )
    
    else:  # guide
        return template.format(
            title=title,
            description=f"Guide for {title.lower()}"
        )

def extract_markdown_links(content: str) -> Set[str]:
    """Extract all markdown links from content."""
    links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
    return {link for _, link in links if not link.startswith(('http://', 'https://', '#', 'mailto:'))}

def find_missing_files(docs_dir: Path) -> Dict[Path, List[str]]:
    """Scan markdown files and return a dictionary of source files and their missing referenced files."""
    missing_files = {}
    
    for md_file in docs_dir.rglob('*.md'):
        try:
            content = md_file.read_text(encoding='utf-8')
            links = extract_markdown_links(content)
            
            file_missing_links = []
            for link in links:
                target_path = (docs_dir / link.lstrip('/')) if link.startswith('/') else (md_file.parent / link)
                target_path = target_path.resolve()
                
                if not target_path.exists():
                    file_missing_links.append(link)
            
            if file_missing_links:
                missing_files[md_file] = file_missing_links
                
        except Exception as e:
            logger.error(f"Error processing {md_file}: {str(e)}")
    
    return missing_files

def create_missing_files(docs_dir: Path, missing_files: Dict[Path, List[str]]) -> None:
    """Create template files for missing documents."""
    all_missing = set()
    for links in missing_files.values():
        all_missing.update(links)
    
    for file_path in sorted(all_missing):
        try:
            full_path = docs_dir / file_path.lstrip('/')
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            if not full_path.exists():
                template_type = determine_template_type(str(file_path))
                content = create_template_content(str(file_path), template_type)
                if content:
                    full_path.write_text(content)
                    print(f"Created {template_type} template file: {file_path}")
                else:
                    logger.error(f"Failed to create content for {file_path}")
        except Exception as e:
            logger.error(f"Error creating {file_path}: {str(e)}")

def main():
    try:
        root_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        logger.info(f"Project root directory: {root_dir}")
        
        docs_dir = root_dir / "src"
        if not docs_dir.exists():
            logger.error(f"Documentation directory not found: {docs_dir}")
            sys.exit(1)
        
        print("\nScanning for missing files...")
        missing_files = find_missing_files(docs_dir)
        
        if not missing_files:
            print("No missing files found!")
            return
        
        print("\nMissing files report:")
        print("=====================")
        
        for source_file, missing_links in missing_files.items():
            print(f"\nIn {source_file.relative_to(docs_dir)}:")
            for link in missing_links:
                print(f"  - Missing: {link}")
        
        response = input("\nWould you like to create template files for missing documents? [y/N] ").lower()
        if response == 'y':
            create_missing_files(docs_dir, missing_files)
            print("\nTemplate creation completed!")
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()