#!/usr/bin/env python3
"""
Documentation Change Report Generator

Generates a comprehensive report of documentation changes in the repository.
Place this script in scripts/generate/doc_diff.py
"""

import os
import sys
from datetime import datetime
import subprocess
from pathlib import Path
import re

# Add repository root to Python path
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
sys.path.append(str(REPO_ROOT))

class DocReportGenerator:
    def __init__(self):
        self.git_root = self.get_git_root()
        self.docs_dir = self.git_root / 'docs'
        self.reports_dir = self.git_root / 'reports' / 'doc-changes'
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.is_new_repo = self.check_if_new_repo()

    @staticmethod
    def run_command(command, ignore_errors=False):
        """Run a shell command and return its output"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True,
                cwd=str(REPO_ROOT)
            )
            if not ignore_errors:
                result.check_returncode()
            return result.stdout
        except subprocess.CalledProcessError as e:
            if not ignore_errors:
                print(f"Warning: Command '{command}' returned: {e.stderr.strip()}")
            return ""

    def get_git_root(self):
        """Get the root directory of the git repository"""
        root = self.run_command("git rev-parse --show-toplevel").strip()
        return Path(root)

    def check_if_new_repo(self):
        """Check if this is a new repository without any commits"""
        result = self.run_command("git rev-parse --verify HEAD", ignore_errors=True)
        return bool(not result)

    def get_all_markdown_files(self, before_commit="HEAD"):
        """Get all markdown files in the repository at a specific commit"""
        if self.is_new_repo:
            return []
        
        files = self.run_command(f"git ls-tree -r --name-only {before_commit} -- docs/", ignore_errors=True)
        return [f for f in files.split('\n') if f and f.endswith('.md')]

    def get_current_markdown_files(self):
        """Get all current markdown files in the docs directory"""
        files = []
        for path in self.docs_dir.rglob("*.md"):
            files.append(str(path.relative_to(self.git_root)))
        return files

    def get_file_content(self, file_path, commit="HEAD"):
        """Get content of a file at a specific commit"""
        if self.is_new_repo:
            return ""
        return self.run_command(f"git show {commit}:{file_path}", ignore_errors=True)

    def generate_report(self):
        """Generate the documentation change report"""
        # Get timestamp and setup report file
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        report_file = self.reports_dir / f"doc_changes_report_{timestamp}.txt"
        
        # Get list of files before and after
        old_files = self.get_all_markdown_files("HEAD") if not self.is_new_repo else []
        current_files = self.get_current_markdown_files()
        
        with open(report_file, 'w', encoding='utf-8') as f:
            # Write header
            f.write("=" * 80 + "\n")
            f.write("DOCUMENTATION CHANGES REPORT\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("Repository: " + str(self.git_root.name) + "\n")
            if self.is_new_repo:
                f.write("Note: This appears to be a new repository without any commits.\n")
            f.write("=" * 80 + "\n\n")
            
            # Section 1: List of files changed
            f.write("1. FILES OVERVIEW\n")
            f.write("=" * 80 + "\n")
            
            # Files removed
            removed_files = set(old_files) - set(current_files)
            if removed_files:
                f.write("\nREMOVED FILES:\n")
                for file in sorted(removed_files):
                    f.write(f"- {file}\n")
            
            # Files added
            added_files = set(current_files) - set(old_files)
            if added_files:
                f.write("\nNEW FILES:\n")
                for file in sorted(added_files):
                    f.write(f"- {file}\n")
            
            # Files modified
            if not self.is_new_repo:
                modified_files = self.run_command("git diff --name-only HEAD -- docs/", ignore_errors=True).split('\n')
                modified_files = [f for f in modified_files if f and f.endswith('.md')]
                if modified_files:
                    f.write("\nMODIFIED FILES:\n")
                    for file in sorted(modified_files):
                        f.write(f"- {file}\n")
            
            # Section 2: Original content of removed/modified files
            if not self.is_new_repo:
                f.write("\n\n2. ORIGINAL CONTENT\n")
                f.write("=" * 80 + "\n")
                for file in sorted(removed_files | set(modified_files)):
                    f.write(f"\n--- {file} ---\n")
                    content = self.get_file_content(file)
                    f.write(content if content else "No previous content available\n")
            
            # Section 3: New content
            f.write("\n\n3. CURRENT CONTENT\n")
            f.write("=" * 80 + "\n")
            for file in sorted(current_files):
                file_path = self.git_root / file
                if file_path.exists():
                    f.write(f"\n--- {file} ---\n")
                    f.write(file_path.read_text(encoding='utf-8'))
            
            # Section 4: Detailed diff of modified files
            if not self.is_new_repo:
                f.write("\n\n4. DETAILED CHANGES\n")
                f.write("=" * 80 + "\n")
                
                # Stage all files to show new files in diff
                self.run_command("git add docs/")
                diff = self.run_command("git diff --cached -- docs/")
                f.write(diff)
                
                # Unstage changes to leave repository clean
                self.run_command("git reset")
        
        print(f"\nReport generated: {report_file}")
        return report_file

def main():
    """Main entry point"""
    generator = DocReportGenerator()
    generator.generate_report()

if __name__ == "__main__":
    main()