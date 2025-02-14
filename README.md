📄 `/README.md`  
**Version:** 1.0.0 | Last Updated: 2025-02-14

# Phoenix VC - Website
**Status:** Production  
**Maintainer:** Hans Jurgens Smit  
**Location:** Bela Bela, South Africa

> Empowering innovation through strategic investments and visionary partnerships

[![Build Status](https://img.shields.io/github/workflow/status/JustAGhosT/PhoenixVC-Modernized/Deploy%20Azure%20Static%20Web%20App)](https://github.com/JustAGhosT/PhoenixVC-Modernized/actions)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue)](https://github.com/JustAGhosT/PhoenixVC-Modernized/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

Phoenix VC is a premier, proprietary venture capital firm dedicated to identifying and investing in transformative technologies. Our modernized website leverages cutting-edge cloud technologies—including Azure Static Web Apps, Tailwind CSS, and Bicep templates—to deliver a seamless digital experience.

## Quick Links
- [📚 Documentation](docs/)
- [🚀 Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [💡 Contributing](docs/CONTRIBUTING.md)
- [❓ FAQ](docs/FAQ.md)
- [🔒 Security](docs/security/SECURITY.md)

## Prerequisites

| Requirement | Version | Purpose |
|------------|---------|----------|
| [Node.js](https://nodejs.org/) | ≥ 18.x | Runtime environment |
| [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) | ≥ 2.58.0 | Azure management |
| [Git](https://git-scm.com/) | ≥ 2.40.0 | Version control |
| [Python](https://www.python.org/downloads/) | ≥ 3.10 | Development tools (optional) |

## Repository Structure

```bash
📁 phoenixvc/
├── 📁 .github/
│   └── 📁 workflows/          # GitHub Actions CI/CD
├── 📁 docs/                   # Documentation
│   ├── 📁 deployment/         # Deployment guides
│   ├── 📁 security/          # Security policies
│   └── 📁 technical/         # Technical specs
├── 📁 infra/                 # Infrastructure as Code
│   ├── 📁 bicep/            # Bicep templates
│   └── 📁 policies/         # Azure policies
├── 📁 scripts/              # Utility scripts
├── 📁 src/                  # Source code
│   ├── 📁 api/             # Azure Functions
│   ├── 📁 components/      # React components
│   └── 📁 styles/         # CSS/Tailwind
├── 📄 .env.example         # Environment template
├── 📄 LICENSE             # Proprietary license
└── 📄 README.md           # This file
```

## Getting Started

1. **Clone Repository:**
   ```bash
   git clone https://github.com/JustAGhosT/PhoenixVC-Modernized.git
   cd PhoenixVC-Modernized
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   npm run prepare  # Sets up git hooks
   ```

4. **Start Development:**
   ```bash
   npm run dev      # Starts dev server
   npm run test     # Runs tests
   ```

## Development Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run lint` | Lint code |
| `npm run test` | Run test suite |
| `npm run format` | Format code |

## Deployment

See [📄 Deployment Guide](docs/deployment/DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
```bash
npm run build
npm run deploy:prod
```

## Support & Contact

- **Technical Support:** [support@phoenixvc.za](mailto:support@phoenixvc.za)
- **Slack Channel:** #phoenixvc-dev
- **Documentation:** [📚 Docs](docs/)
- **Issues:** [GitHub Issues](https://github.com/JustAGhosT/PhoenixVC-Modernized/issues)

## License

**PROPRIETARY SOFTWARE**  
© 2024-2025 Phoenix VC. All Rights Reserved.

This software is the confidential and proprietary information of Phoenix VC.
Unauthorized reproduction, distribution, or disclosure is strictly prohibited.

---

**Confidentiality Notice**: This document contains proprietary information.