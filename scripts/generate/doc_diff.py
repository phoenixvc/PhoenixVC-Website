#!/usr/bin/env python3
"""
Documentation Change Report Generator

Generates a comprehensive report of documentation changes in the repository.
Place this script in scripts/generate/doc_diff.py

Usage:
    python3 doc_diff.py [--base COMMIT] [--head COMMIT]

If not provided, --base defaults to the HEAD of the main branch (origin/main) 
and --head defaults to the current branch's HEAD.
"""

import os
import sys
import argparse
from datetime import datetime
import subprocess
from pathlib import Path

# Add repository root to Python path
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
sys.path.append(str(REPO_ROOT))


class DocReportGenerator:
    def __init__(self, base_commit=None, head_commit=None):
        self.git_root = self.get_git_root()
        self.docs_dir = self.git_root / 'docs'
        self.reports_dir = self.git_root / 'reports' / 'doc-changes'
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        self.is_new_repo = self.check_if_new_repo()
        self.base_commit = base_commit or self.get_main_commit()
        self.head_commit = head_commit or self.get_current_commit()

    @staticmethod
    def run_command(command, ignore_errors=False):
        """Run a shell command and return its output."""
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
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            if not ignore_errors:
                print(f"Warning: Command '{command}' returned: {e.stderr.strip()}")
            return ""

    def get_git_root(self):
        """Get the root directory of the git repository."""
        root = self.run_command("git rev-parse --show-toplevel")
        return Path(root)

    def check_if_new_repo(self):
        """Check if this is a new repository without any commits."""
        result = self.run_command("git rev-parse --verify HEAD", ignore_errors=True)
        return not bool(result)

    def get_current_commit(self):
        """Get the current branch's HEAD commit."""
        return self.run_command("git rev-parse HEAD")

    def get_main_commit(self):
        """Get the HEAD commit of the main branch (assumes 'origin/main')."""
        main_commit = self.run_command("git rev-parse origin/main", ignore_errors=True)
        if not main_commit:
            # Fallback: try main locally
            main_commit = self.run_command("git rev-parse main", ignore_errors=True)
        return main_commit

    def get_all_markdown_files(self, commit):
        """Get all markdown files in the repository at a specific commit."""
        if self.is_new_repo:
            return []
        files = self.run_command(f"git ls-tree -r --name-only {commit} -- docs/", ignore_errors=True)
        return [f for f in files.split('\n') if f and f.endswith('.md')]

    def get_current_markdown_files(self):
        """Get all current markdown files in the docs directory."""
        return [str(p.relative_to(self.git_root)) for p in self.docs_dir.rglob("*.md")]

    def get_file_content(self, file_path, commit):
        """Get content of a file at a specific commit."""
        if self.is_new_repo:
            return ""
        return self.run_command(f"git show {commit}:{file_path}", ignore_errors=True)

    def generate_report(self):
        """Generate the documentation change report."""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        report_file = self.reports_dir / f"doc_changes_report_{timestamp}.txt"
        
        old_files = set(self.get_all_markdown_files(self.base_commit))
        current_files = set(self.get_current_markdown_files())
        
        with open(report_file, 'w', encoding='utf-8') as f:
            # Header
            f.write("=" * 80 + "\n")
            f.write("DOCUMENTATION CHANGES REPORT\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Repository: {self.git_root.name}\n")
            if self.is_new_repo:
                f.write("Note: This is a new repository with no previous commits.\n")
            f.write("=" * 80 + "\n\n")
            
            # Section 1: Files Overview
            f.write("1. FILES OVERVIEW\n")
            f.write("=" * 80 + "\n")
            
            removed_files = old_files - current_files
            if removed_files:
                f.write("\nREMOVED FILES:\n")
                for file in sorted(removed_files):
                    f.write(f"- {file}\n")
            
            added_files = current_files - old_files
            if added_files:
                f.write("\nNEW FILES:\n")
                for file in sorted(added_files):
                    f.write(f"- {file}\n")
            
            # Modified files (using git diff)
            if not self.is_new_repo:
                diff_files = self.run_command(f"git diff --name-only {self.base_commit} {self.head_commit} -- docs/", ignore_errors=True)
                modified_files = [f for f in diff_files.split('\n') if f and f.endswith('.md')]
                if modified_files:
                    f.write("\nMODIFIED FILES:\n")
                    for file in sorted(modified_files):
                        f.write(f"- {file}\n")
            
            # Section 2: Original Content of Removed/Modified Files
            if not self.is_new_repo:
                f.write("\n\n2. ORIGINAL CONTENT (from base commit)\n")
                f.write("=" * 80 + "\n")
                for file in sorted(removed_files | set(modified_files)):
                    f.write(f"\n--- {file} ---\n")
                    content = self.get_file_content(file, self.base_commit)
                    f.write(content if content else "No previous content available\n")
            
            # Section 3: Current Content
            f.write("\n\n3. CURRENT CONTENT\n")
            f.write("=" * 80 + "\n")
            for file in sorted(current_files):
                file_path = self.git_root / file
                if file_path.exists():
                    f.write(f"\n--- {file} ---\n")
                    f.write(file_path.read_text(encoding='utf-8'))
            
            # Section 4: Detailed Diff
            if not self.is_new_repo:
                f.write("\n\n4. DETAILED DIFF (between base and head commits)\n")
                f.write("=" * 80 + "\n")
                diff = self.run_command(f"git diff {self.base_commit} {self.head_commit} -- docs/", ignore_errors=True)
                f.write(diff)
        
        print(f"\nReport generated: {report_file}")
        return report_file

def main():
    parser = argparse.ArgumentParser(description="Generate a documentation change report for the repository.")
    parser.add_argument("--base", type=str, default=None, help="Base commit for diff (default: HEAD of main branch)")
    parser.add_argument("--head", type=str, default=None, help="Head commit for diff (default: current HEAD)")
    args = parser.parse_args()
    
    generator = DocReportGenerator(base_commit=args.base, head_commit=args.head)
    report_file = generator.generate_report()
    print(f"Documentation change report saved to: {report_file}")

if __name__ == "__main__":
    main()
