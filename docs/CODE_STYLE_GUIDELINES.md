# Code Style Guidelines for Phoenix VC - Modernized

This document outlines the naming conventions, formatting rules, and overall code style practices for the Phoenix VC project to ensure consistency and maintainability.

## Naming Conventions

Our naming convention for Azure resources follows the pattern:
```
[env]-[region]-[resourcetype]-projectname
```
**Examples:**
- **Static Web App:**  
  For a production deployment in West Europe:  
  `prod-euw-swa-phoenixvc`  
  For South Africa North (if using BYOF):  
  `prod-saf-swa-phoenixvc`
- **Resource Group:**  
  For West Europe:  
  `prod-euw-rg-phoenixvc`  
  For South Africa North:  
  `prod-saf-rg-phoenixvc`
- **Budget Resource:**  
  For West Europe:  
  `prod-euw-rg-phoenixvc-budget`  
  For South Africa North:  
  `prod-saf-rg-phoenixvc-budget`

## Formatting and Indentation

- **Indentation:**  
  Use **4 spaces** per level. Do not mix tabs and spaces.
- **Braces and Object Syntax:**  
  Follow Bicep and JSON standards. In Bicep, object properties are defined on separate lines without commas.

## Documentation & Comments

- Provide clear inline comments where necessary.
- Update external documentation (e.g., README, DEPLOYMENT.md, TROUBLESHOOTING.md) whenever significant changes occur.
- Maintain a consistent style across all documentation.

## Testing

- Ensure that code changes do not break existing functionality.
- Write and maintain tests (unit tests, integration tests, etc.) as appropriate.
- Follow best practices for test naming and organization.

## Consistency

- Follow the rules defined in this document as well as configuration files for ESLint, Stylelint, and Prettier.
- Consistent naming and formatting helps maintain the project over time.

For any questions or clarifications regarding code style, please reach out to the team.
