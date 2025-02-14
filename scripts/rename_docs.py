import os
import re
from pathlib import Path

def should_be_uppercase(filename):
    uppercase_files = {
        'readme.md',
        'changelog.md',
        'contributing.md',
        'license',
        'security.md'
    }
    return filename.lower() in uppercase_files

def convert_to_kebab_case(filename):
    name, ext = os.path.splitext(filename)
    if '_' in name:
        name = name.lower().replace('_', '-')
    name = re.sub('([a-z0-9])([A-Z])', r'\1-\2', name)
    name = name.lower()
    
    if name.startswith('adr-'):
        return name + ext
    
    if should_be_uppercase(filename):
        return name.upper() + ext
    
    return name + ext

def rename_files(directory):
    changes_made = False
    files_processed = 0
    files_renamed = 0
    errors = []

    print(f"Starting file renaming process in: {directory}")
    print("-" * 70)

    for root, dirs, files in os.walk(directory):
        rel_path = os.path.relpath(root, directory)
        for filename in files:
            if filename.endswith('.md'):
                files_processed += 1
                old_path = os.path.join(root, filename)
                new_filename = convert_to_kebab_case(filename)
                new_path = os.path.join(root, new_filename)
                
                # Show relative path in output
                display_path = os.path.join(rel_path, filename)
                display_new_path = os.path.join(rel_path, new_filename)
                
                if old_path != new_path:
                    try:
                        os.rename(old_path, new_path)
                        print(f"✓ Renamed: {display_path} -> {display_new_path}")
                        files_renamed += 1
                        changes_made = True
                    except FileExistsError:
                        error_msg = f"× Error: Cannot rename {display_path} - {display_new_path} already exists"
                        print(error_msg)
                        errors.append(error_msg)
                    except Exception as e:
                        error_msg = f"× Error processing {display_path}: {str(e)}"
                        print(error_msg)
                        errors.append(error_msg)

    print("\nSummary:")
    print("-" * 70)
    print(f"Total files processed: {files_processed}")
    print(f"Files renamed: {files_renamed}")
    print(f"Errors encountered: {len(errors)}")

    if not changes_made:
        print("\nNo files needed renaming - all files follow the naming convention.")
    
    if errors:
        print("\nErrors encountered:")
        for error in errors:
            print(error)

if __name__ == "__main__":
    # Get the script's directory
    script_dir = Path(__file__).parent.parent
    # Construct path to docs directory
    docs_path = script_dir / "docs"
    
    if not docs_path.exists():
        print(f"Error: Directory '{docs_path}' not found!")
    else:
        rename_files(str(docs_path))