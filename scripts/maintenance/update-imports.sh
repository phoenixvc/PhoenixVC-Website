#!/bin/bash
# update-imports.sh
# This script updates relative import/export paths to include a ".js" extension.
# It recursively processes files with .ts, .tsx, .js, and .jsx extensions.

# Check that Perl is installed
if ! command -v perl > /dev/null; then
  echo "Perl is not installed. Please install Perl to run this script."
  exit 1
fi

# Find all relevant source files
files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \))

echo "Updating import/export paths in the following files:"
echo "$files"

# Process each file
for file in $files; do
  echo "Processing $file"
  # The regex looks for lines with "from" or "export ... from" and captures the relative path.
  # It appends ".js" if the path does not already end with .js.
  perl -i -pe 's/(from\s+["'\''])(\.[^"'\''\s]+?)(?<!\.js)(["'\''])/$1$2.js$3/g' "$file"
done

echo "Relative import/export paths updated to include .js extension."
