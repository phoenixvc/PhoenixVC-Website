📄 /docs/development/dev-containers.md

---
layout: default
title: "Dev Containers Setup"
description: "Guide to setting up Dev Containers for Phoenix VC development."
---

# Dev Containers Setup

This guide explains how to set up and use Dev Containers for the Phoenix VC project.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Remote - Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Steps to Set Up

1. Clone the repository:
   ```bash
   git clone https://github.com/justaghost/PhoenixVC-Modernized.git
   cd PhoenixVC-Modernized
   ```

2. Open the project in Visual Studio Code:
   ```bash
   code .
   ```

3. Open the Command Palette (Ctrl+Shift+P) and select:
   ```
   Remote-Containers: Reopen in Container
   ```

4. Wait for the container to build and start. Once it's ready, your development environment will be fully set up inside the container.

## Customizing the Dev Container

To customize the Dev Container, edit the `.devcontainer/devcontainer.json` file. For example, you can add extensions or change the base image.

### Example `devcontainer.json`:
```json
{
  "name": "Phoenix VC Dev Container",
  "image": "mcr.microsoft.com/vscode/devcontainers/base:ubuntu",
  "extensions": [
    "ms-python.python",
    "dbaeumer.vscode-eslint"
  ],
  "settings": {
    "terminal.integrated.shell.linux": "/bin/bash"
  }
}
```

## Troubleshooting

If you encounter any issues, try the following:

- Ensure Docker is running.
- Check the logs for errors: `View > Output > Dev Containers`.
- Rebuild the container:  
  Open the Command Palette and select:
  ```
  Remote-Containers: Rebuild Container
  ```

For further assistance, refer to the [Dev Containers documentation](https://code.visualstudio.com/docs/remote/containers).

---
