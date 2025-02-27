📄 /docs/development/development-setup.md

# Development Environment Setup {: #development-environment-setup}
## Table of Contents {: #table-of-contents}
- [Prerequisites](#prerequisites)
- [Development Environments](#development-environments)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development Workflow](#development-workflow)
- [Advanced Debugging](#advanced-debugging)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Prerequisites {: #prerequisites}
### Required Software {: #required-software}
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git (v2.30 or higher)
- Docker (v20.x or higher)
- VS Code (recommended)
- Azure CLI (latest version)

### System Requirements {: #system-requirements}
- Memory: 8GB RAM (minimum), 16GB (recommended)
- Storage: 50GB free space
- OS: Windows 10/11, macOS 10.15+, or Linux
- Modern multi-core processor

### Additional Tools {: #additional-tools}
- **CommitLint & Husky**:
  Our project uses [commitlint](./.github/commitlint.config.js) to enforce commit message conventions and Husky for pre-commit hooks. When you commit, commitlint will validate that your messages follow our [Conventional Commits](./contributing.md#commit-message-conventions).
- **Azure CLI Setup**:
  To deploy to Azure or interact with services, ensure you run:
  ```bash
  az login
  az account set --subscription <your-subscription-id>
  ```
  This will authenticate and set your default subscription for CLI operations.

## Development Environments {: #development-environments}
### 1. GitHub Codespaces (Recommended) {: #1-github-codespaces-recommended}
Access your development environment directly in the browser:
1. Navigate to the repository
2. Click "Code" > "Open with Codespaces"
3. Select "New codespace"

**Connect via VS Code:**
1. Install GitHub Codespaces extension
2. Press `Ctrl/Cmd + Shift + P`
3. Select "Codespaces: Connect to Codespace"

### 2. Local Setup {: #2-local-setup}
#### Windows (with WSL2) {: #windows-with-wsl2}
```powershell
# Install WSL2 {: #install-wsl2}
wsl --install

# Install prerequisites in WSL2 {: #install-prerequisites-in-wsl2}
sudo apt update && sudo apt upgrade
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### macOS {: #macos}
```bash
# Install Homebrew {: #install-homebrew}
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites {: #install-prerequisites}
brew install node docker
```

#### Linux (Ubuntu/Debian) {: #linux-ubuntudebian}
```bash
# Install Node.js and npm {: #install-nodejs-and-npm}
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker {: #install-docker}
sudo apt install docker.io
```

## Initial Setup {: #initial-setup}
### 1. Repository Setup {: #1-repository-setup}
```bash
# Clone repository {: #clone-repository}
git clone https://github.com/[YourUsername]/phoenixvc-modernized.git
cd phoenixvc-modernized

# Install dependencies {: #install-dependencies}
npm install

# Setup git hooks (Husky + commitlint) {: #setup-git-hooks-husky--commitlint}
npm run prepare
```

### 2. Development Tools Setup {: #2-development-tools-setup}
#### VS Code Extensions {: #vs-code-extensions}
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-tslint-plugin
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension eamodio.gitlens
```

#### VS Code Settings {: #vs-code-settings}
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

#### EditorConfig {: #editorconfig}
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

## Environment Configuration {: #environment-configuration}
### 1. Environment Variables {: #1-environment-variables}
```bash
# Copy environment template {: #copy-environment-template}
cp .env.example .env
```

### 2. Required Variables {: #2-required-variables}
```plaintext
# API Configuration {: #api-configuration}
API_URL=http://localhost:3000
API_KEY=your_api_key

# Database Configuration {: #database-configuration}
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phoenixvc
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication {: #authentication}
AUTH_SECRET=your_secret_key
AUTH_PROVIDER=azure
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

## Database Setup {: #database-setup}
### 1. Start Database Container {: #1-start-database-container}
By default, we use `docker-compose.yml` located at the repository root to run PostgreSQL:

```bash
# Spin up PostgreSQL {: #spin-up-postgresql}
docker-compose up -d db

# Check container status {: #check-container-status}
docker-compose ps

# If you need to adjust ports or environment variables, {: #if-you-need-to-adjust-ports-or-environment-variables}
# edit docker-compose.yml in the root of this repo. {: #edit-docker-composeyml-in-the-root-of-this-repo}
```

> **Local vs. Production Docker**:
> For local development, we rely on `docker-compose.yml`. If you’re deploying to a production or staging environment, see [docker-workflow.md](./infrastructure/docker-workflow.md) for details on advanced or different Docker configurations.

### 2. Database Migration {: #2-database-migration}
```bash
# Run migrations {: #run-migrations}
npm run db:migrate

# Seed initial data {: #seed-initial-data}
npm run db:seed
```

## Development Workflow {: #development-workflow}
### Running the Application {: #running-the-application}
```bash
# Start development server {: #start-development-server}
npm run dev

# Run on a specific port {: #run-on-a-specific-port}
npm run dev -- -p 3001
```

### Testing {: #testing}
```bash
# Run all tests {: #run-all-tests}
npm test

# Run specific test file {: #run-specific-test-file}
npm test -- src/components/Feature.test.tsx

# Run tests in watch mode {: #run-tests-in-watch-mode}
npm test -- --watch
```

### Code Quality {: #code-quality}
```bash
# Lint code {: #lint-code}
npm run lint

# Format code {: #format-code}
npm run format

# Type check {: #type-check}
npm run type-check
```

### Storybook Development {: #storybook-development}
```bash
# Start Storybook server {: #start-storybook-server}
npm run storybook

# Build Storybook static site {: #build-storybook-static-site}
npm run build-storybook
```

## Advanced Debugging {: #advanced-debugging}
If you want to debug with more verbose output:
```bash
# Enable debug logs {: #enable-debug-logs}
DEBUG=app:* npm run dev

# Debug a specific module {: #debug-a-specific-module}
DEBUG=app:auth npm run dev
```

VS Code also provides an integrated debugger—if your project includes a `.vscode/launch.json`, you can set breakpoints, inspect variables, and step through code.

## Troubleshooting {: #troubleshooting}
### Common Issues {: #common-issues}
#### 1. Port Already in Use {: #1-port-already-in-use}
```bash
# Find process using port {: #find-process-using-port}
lsof -i :3000  # Unix/macOS
netstat -ano | findstr :3000  # Windows

# Kill process {: #kill-process}
kill -9 <PID>  # Unix/macOS
taskkill /PID <PID> /F  # Windows
```

#### 2. Database Connection Issues {: #2-database-connection-issues}
```bash
# Check database container logs {: #check-database-container-logs}
docker-compose logs db

# Restart database container {: #restart-database-container}
docker-compose restart db
```

#### 3. Node Module Issues {: #3-node-module-issues}
```bash
# Clear npm cache and reinstall {: #clear-npm-cache-and-reinstall}
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

#### 4. Node Version Mismatch {: #4-node-version-mismatch}
```bash
# Using nvm {: #using-nvm}
nvm install 18
nvm use 18
```

### Future E2E Testing {: #future-e2e-testing}
> **TODO**: If or when we adopt Cypress, Playwright, or another E2E tool, we’ll add docs for spinning up ephemeral containers or staging environments for integration tests.

## Additional Resources {: #additional-resources}
- [Code Style Guide](./code-style.md)
- [Contributing Guide](./contributing.md)
- [Deployment Guide](./deployment/deployment.md)
- [Infrastructure Docs](./infrastructure/readme.md)
- [Troubleshooting Guide](./deployment/troubleshooting.md)
