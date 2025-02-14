📄 /docs/development/development-setup.md

# Development Environment Setup

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Environments](#development-environments)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development Workflow](#development-workflow)
- [Advanced Debugging](#advanced-debugging)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites

### Required Software
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git (v2.30 or higher)
- Docker (v20.x or higher)
- VS Code (recommended)
- Azure CLI (latest version)

### System Requirements
- Memory: 8GB RAM (minimum), 16GB (recommended)
- Storage: 50GB free space
- OS: Windows 10/11, macOS 10.15+, or Linux
- Modern multi-core processor

### Additional Tools
- **CommitLint & Husky**:  
  Our project uses [commitlint](../../.github/commitlint.config.js) to enforce commit message conventions and Husky for pre-commit hooks. When you commit, commitlint will validate that your messages follow our [Conventional Commits](../contributing.md#commit-message-conventions).
- **Azure CLI Setup**:  
  To deploy to Azure or interact with services, ensure you run:
  ```bash
  az login
  az account set --subscription <your-subscription-id>
  ```
  This will authenticate and set your default subscription for CLI operations.

## Development Environments

### 1. GitHub Codespaces (Recommended)

Access your development environment directly in the browser:
1. Navigate to the repository
2. Click "Code" > "Open with Codespaces"
3. Select "New codespace"

**Connect via VS Code:**
1. Install GitHub Codespaces extension
2. Press `Ctrl/Cmd + Shift + P`
3. Select "Codespaces: Connect to Codespace"

### 2. Local Setup

#### Windows (with WSL2)
```powershell
# Install WSL2
wsl --install

# Install prerequisites in WSL2
sudo apt update && sudo apt upgrade
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### macOS
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install node docker
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
sudo apt install docker.io
```

## Initial Setup

### 1. Repository Setup
```bash
# Clone repository
git clone https://github.com/[YourUsername]/phoenixvc-modernized.git
cd phoenixvc-modernized

# Install dependencies
npm install

# Setup git hooks (Husky + commitlint)
npm run prepare
```

### 2. Development Tools Setup

#### VS Code Extensions
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-tslint-plugin
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension eamodio.gitlens
```

#### VS Code Settings
Create or update `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

#### EditorConfig
Create `.editorconfig` in project root:
```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 4
trim_trailing_whitespace = true

[*.{json,yml,yaml,md}]
indent_size = 2
```

## Environment Configuration

### 1. Environment Variables
```bash
# Copy environment template
cp .env.example .env
```

### 2. Required Variables
```plaintext
# API Configuration
API_URL=http://localhost:3000
API_KEY=your_api_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phoenixvc
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
AUTH_SECRET=your_secret_key
AUTH_PROVIDER=azure
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

## Database Setup

### 1. Start Database Container
By default, we use `docker-compose.yml` located at the repository root to run PostgreSQL:

```bash
# Spin up PostgreSQL
docker-compose up -d db

# Check container status
docker-compose ps

# If you need to adjust ports or environment variables,
# edit docker-compose.yml in the root of this repo.
```

> **Local vs. Production Docker**:  
> For local development, we rely on `docker-compose.yml`. If you’re deploying to a production or staging environment, see [docker-workflow.md](../../infrastructure/docker-workflow.md) for details on advanced or different Docker configurations.

### 2. Database Migration
```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Development Workflow

### Running the Application
```bash
# Start development server
npm run dev

# Run on a specific port
npm run dev -- -p 3001
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/Feature.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Storybook Development
```bash
# Start Storybook server
npm run storybook

# Build Storybook static site
npm run build-storybook
```

## Advanced Debugging
If you want to debug with more verbose output:
```bash
# Enable debug logs
DEBUG=app:* npm run dev

# Debug a specific module
DEBUG=app:auth npm run dev
```

VS Code also provides an integrated debugger—if your project includes a `.vscode/launch.json`, you can set breakpoints, inspect variables, and step through code.

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Unix/macOS
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Unix/macOS
taskkill /PID <PID> /F  # Windows
```

#### 2. Database Connection Issues
```bash
# Check database container logs
docker-compose logs db

# Restart database container
docker-compose restart db
```

#### 3. Node Module Issues
```bash
# Clear npm cache and reinstall
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

#### 4. Node Version Mismatch
```bash
# Using nvm
nvm install 18
nvm use 18
```

### Future E2E Testing
> **TODO**: If or when we adopt Cypress, Playwright, or another E2E tool, we’ll add docs for spinning up ephemeral containers or staging environments for integration tests.

## Additional Resources
- [Code Style Guide](code-style.md)
- [Contributing Guide](../contributing.md)
- [Deployment Guide](../../deployment/deployment.md)
- [Infrastructure Docs](../../infrastructure/readme.md)
- [Troubleshooting Guide](../../deployment/troubleshooting.md)