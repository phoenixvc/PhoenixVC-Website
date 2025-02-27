# .devcontainer/scripts/post-create.sh
#!/bin/bash
set -e

# Print commands for debugging
set -x

# Create cache directory if it doesn't exist
mkdir -p ${PWD}/.cache

# Update package lists and install tools
sudo apt-get update
sudo apt-get install -y tree libcairo2-dev  # Added libcairo2-dev here

# Configure poetry
poetry config virtualenvs.in-project true

# Install dependencies
echo "Installing Python dependencies with Poetry..."
poetry install

echo "Installing Node.js dependencies..."
npm install

echo "Installing additional Python tools..."
pip install ruff

echo "Setup complete!"
