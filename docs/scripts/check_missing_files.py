import re
from pathlib import Path
from typing import Set, Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_markdown_links(content: str) -> Set[str]:
    """Extract all markdown links from content."""
    # Match [text](link) pattern, capture only the link part
    links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
    return {link for _, link in links if not link.startswith(('http://', 'https://', '#', 'mailto:'))}

def check_missing_files(root_dir: Path) -> Dict[Path, List[str]]:
    """
    Scan markdown files and return a dictionary of source files and their missing referenced files.
    """
    missing_files = {}
    
    # Scan all .md files
    for md_file in root_dir.rglob('*.md'):
        try:
            content = md_file.read_text(encoding='utf-8')
            links = extract_markdown_links(content)
            
            # Check each link
            file_missing_links = []
            for link in links:
                # Resolve the link path relative to the current file
                if link.startswith('/'):
                    target_path = root_dir / link.lstrip('/')
                else:
                    target_path = md_file.parent / link
                
                # Normalize the path
                target_path = target_path.resolve()
                
                # Check if file exists
                if not target_path.exists():
                    file_missing_links.append(link)
            
            if file_missing_links:
                missing_files[md_file] = file_missing_links
                
        except Exception as e:
            logger.error(f"Error processing {md_file}: {str(e)}")
    
    return missing_files

def main():
    # Get the root directory (assuming script is run from project root)
    root_dir = Path('src')
    
    if not root_dir.exists():
        logger.error(f"Directory {root_dir} does not exist!")
        return
    
    logger.info(f"Scanning for missing files in {root_dir}...")
    missing_files = check_missing_files(root_dir)
    
    if not missing_files:
        print("No missing files found!")
        return
    
    print("\nMissing files report:")
    print("=====================")
    
    for source_file, missing_links in missing_files.items():
        print(f"\nIn {source_file.relative_to(root_dir)}:")
        for link in missing_links:
            print(f"  - Missing: {link}")
    
    # Create a list of unique missing files
    all_missing = set()
    for links in missing_files.values():
        all_missing.update(links)
    
    print("\nSummary of unique files to create:")
    print("================================")
    for file in sorted(all_missing):
        print(f"- {file}")

if __name__ == "__main__":
    main()
