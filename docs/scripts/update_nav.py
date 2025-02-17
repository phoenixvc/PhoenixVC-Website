#!/usr/bin/env python3
import os
from pathlib import Path
import yaml
from typing import Dict, List, Any

def get_nav_structure(docs_dir: Path) -> Dict[str, Any]:
    """Generate navigation structure from directory layout."""
    nav = {}
    
    for md_file in sorted(docs_dir.rglob('*.md')):
        rel_path = md_file.relative_to(docs_dir)
        parts = list(rel_path.parts)
        
        # Skip README.md files as they're handled specially
        if parts[-1] == 'README.md':
            continue
            
        current = nav
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
            
        # Add the file
        name = parts[-1].replace('.md', '').replace('-', ' ').title()
        current[name] = str(rel_path)
        
    return nav

def update_mkdocs_nav(config_file: Path, docs_dir: Path):
    """Update mkdocs.yml nav configuration."""
    with config_file.open() as f:
        config = yaml.safe_load(f)
        
    nav = get_nav_structure(docs_dir)
    
    # Update nav in config
    config['nav'] = nav
    
    # Write updated config
    with config_file.open('w') as f:
        yaml.dump(config, f, allow_unicode=True, sort_keys=False)

if __name__ == '__main__':
    root_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    config_file = root_dir / "mkdocs.yml"
    docs_dir = root_dir / "src"
    
    update_mkdocs_nav(config_file, docs_dir)