#!/bin/bash

# Name: tree-gitignore
# Description: Show tree structure while respecting .gitignore rules

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if required commands exist
if ! command_exists tree; then
    echo "Error: 'tree' command is not installed"
    echo "Please install it first:"
    echo "  - For Ubuntu/Debian: sudo apt-get install tree"
    echo "  - For MacOS: brew install tree"
    echo "  - For CentOS/RHEL: sudo yum install tree"
    exit 1
fi

if ! command_exists git; then
    echo "Error: 'git' command is not installed"
    exit 1
fi

# Check if current directory is a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not a git repository"
    exit 1
fi

# Get list of tracked files and untracked files not ignored by git
files=$(git ls-files && git ls-files --others --exclude-standard)

if [ -z "$files" ]; then
    echo "No files found in git repository"
    exit 0
fi

# Create a temporary file
temp_file=$(mktemp)

# Write the list of files to the temporary file
echo "$files" > "$temp_file"

# Parse additional arguments
tree_args=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -L|-l|--level)
            tree_args="$tree_args -L $2"
            shift 2
            ;;
        -d|--dirs-only)
            tree_args="$tree_args -d"
            shift
            ;;
        -h|--help)
            echo "Usage: tree-gitignore [OPTIONS]"
            echo "Show tree structure while respecting .gitignore rules"
            echo ""
            echo "Options:"
            echo "  -L, --level N    Descend only N levels deep"
            echo "  -d, --dirs-only  Show only directories"
            echo "  -h, --help       Show this help message"
            rm "$temp_file"
            exit 0
            ;;
        *)
            tree_args="$tree_args $1"
            shift
            ;;
    esac
done

# Run tree command with the file list
# shellcheck disable=SC2086
tree $tree_args --fromfile "$temp_file"

# Clean up
rm "$temp_file"
