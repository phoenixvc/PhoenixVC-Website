📄 `/README.md`  
**Version:** 1.0.4 | Last Updated: 2025-02-15

# Phoenix VC - Website
**Status:** Production  
**Maintainer:** Hans Jurgens Smit  
**Location:** Bela Bela, South Africa

> Empowering innovation through strategic investments and visionary partnerships

[![Build Status](https://img.shields.io/github/workflow/status/JustAGhosT/PhoenixVC-Modernized/Deploy%20Azure%20Static%20Web%20App)](https://github.com/JustAGhosT/PhoenixVC-Modernized/actions)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue)](https://github.com/JustAGhosT/PhoenixVC-Modernized/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red)](LICENSE)

Phoenix VC is a premier, proprietary venture capital firm dedicated to identifying and investing in transformative technologies. Our modernized website leverages cutting‐edge cloud technologies—including Azure Static Web Apps, Tailwind CSS, and Bicep templates—to deliver a seamless digital experience.

## Quick Links
- [📚 Documentation](docs/README.md)
- [🚀 Deployment Guide](docs/deployment/README.md)
- [💡 Contributing](docs/contributing.md)
- [🛡 Security](docs/SECURITY.md)
- [📜 Compliance](docs/compliance/README.md)
- [🏗 Infrastructure](docs/infrastructure/README.md)
- [❓ FAQ](docs/FAQ.md)

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| [Node.js](https://nodejs.org/) | ≥ 18.x | Runtime environment |
| [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) | ≥ 2.58.0 | Azure management |
| [Git](https://git-scm.com/) | ≥ 2.40.0 | Version control |
| [Python](https://www.python.org/downloads/) | ≥ 3.10 | Development tools (optional) |

## Repository Structure

```bash
📁 docs/                                 # Documentation (Jekyll pages)
├── 📄 CHANGELOG.md                      # Changelog for documentation updates
├── 📄 FAQ.md                            # Frequently Asked Questions
├── 📄 SECURITY.md                       # Security policies (remains at docs root)
├── 📁 compliance/                       # Compliance guidelines
│   ├── 📄 README.md                     # Overview of compliance docs
│   ├── 📄 azure-security-baseline.md    # Azure security baseline (placeholder)
│   ├── 📄 dns-policy-checklist.md       # DNS policy checklist
│   ├── 📄 policy-framework.md           # Enterprise policy framework
│   └── 📄 spn-audit-rotation.md         # SPN audit & rotation guidelines
├── 📄 contributing.md                   # How to contribute
├── 📁 deployment/                       # Deployment-related docs
│   ├── 📄 README.md                     # Deployment hub overview
│   ├── 📁 adrs/                         # Architectural Decision Records
│   │   ├── 📄 adr-001-credential-rotation.md
│   │   └── 📄 adr-002-disaster-recovery.md
│   ├── 📄 azure-environment-setup.md    # Azure environment setup
│   ├── 📄 configuration.md              # Environment & resource configuration
│   ├── 📄 deploy-script-reference.md    # Deployment scripts reference
│   ├── 📄 deployment-guide.md           # Step-by-step deployment guide
│   ├── 📄 operations.md                 # Day-to-day operations
│   ├── 📄 prerequisites.md              # Deployment prerequisites
│   ├── 📄 service-principals.md         # SPN best practices
│   └── 📄 troubleshooting.md            # Troubleshooting guide
├── 📁 development/                      # Development-specific docs
│   ├── 📄 README.md                     # Development overview
│   ├── 📄 code-style.md                 # Code style guidelines
│   └── 📄 development-setup.md          # Local development setup
├── 📄 documentation-map.md              # Visual map of all docs
├── 📄 documentation-roadmap.md          # Future documentation improvements
├── 📁 infrastructure/                   # Infrastructure-related docs
│   ├── 📄 README.md                     # Infrastructure overview
│   ├── 📄 architecture.md               # System architecture diagrams
│   ├── 📄 bicep-templates.md            # IaC templates
│   ├── 📄 disaster-recovery.md          # Disaster recovery plan
│   ├── 📄 docker-workflow.md            # Docker configuration workflow
│   ├── 📄 infrastructure.md             # General infrastructure documentation
│   └── 📄 monitoring.md                 # Monitoring & logging setup
├── 📄 naming-conventions.md             # Naming conventions for docs and code
└── 📁 references/                       # Technical references
    ├── 📄 azure-component-versions.md   # Component version reference
    └── 📄 network-topology.md           # Network topology diagrams
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

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start development server     |
| `npm run build` | Build production bundle      |
| `npm run lint`  | Lint code                    |
| `npm run test`  | Run test suite               |
| `npm run format`| Format code                  |

## Deployment

See [📄 Deployment Guide](docs/deployment/README.md) for detailed instructions.

**Quick Deploy:**
```bash
npm run build
npm run deploy:prod
```

## Support & Contact

- **Technical Support:** [support@phoenixvc.za](mailto:support@phoenixvc.za)
- **Slack Channel:** #phoenixvc-dev
- **Documentation:** [📚 Docs](docs/README.md)
- **Issues:** [GitHub Issues](https://github.com/JustAGhosT/PhoenixVC-Modernized/issues)

## License

**PROPRIETARY SOFTWARE**  
© 2024-2025 Phoenix VC. All Rights Reserved.

This software is the confidential and proprietary information of Phoenix VC.  
Unauthorized reproduction, distribution, or disclosure is strictly prohibited.

---

**Confidentiality Notice:** This document contains proprietary information.
