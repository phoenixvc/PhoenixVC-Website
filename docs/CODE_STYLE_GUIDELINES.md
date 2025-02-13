# Code Style Guidelines for Phoenix VC - Modernized

This document outlines the naming conventions, formatting rules, and overall code style practices for the Phoenix VC project to ensure consistency and maintainability.

## Naming Conventions

Our naming convention for Azure resources follows the pattern:
```plaintext
env_loc_resourcetype_projname[optionalidentifier]
```
**Abbreviations:**  
Refer to the [Azure Cloud Adoption Framework: Resource Abbreviations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations) for standard abbreviations.

**Elements Breakdown:**

- **Environment (env):**  
  Represents the environment where the resource is deployed.  
  **Examples:**  
  - `dev` (Development)  
  - `uat` (User Acceptance Testing)  
  - `prod` (Production)

- **Location (loc):**  
  Represents the Azure region or location where the resource is deployed. Use Azure region codes for consistency.  
  **Examples:**  
  - `euw` (West Europe)  
  - `eus` (East US)  
  - `saf` (South Africa North)

- **Resource Type (resourcetype):**  
  Abbreviation of the Azure resource type. Use short and consistent abbreviations for resource types.  
  **Examples:**  
  - `rg` (Resource Group)  
  - `vm` (Virtual Machine)  
  - `sql` (SQL Database)  
  - `sa` (Storage Account)  
  - `swa` (Static Web App)

- **Project Name (projname):**  
  Identifies the specific project or application associated with the resource.  
  **Example:**  
  - `phoenixvc`

- **Optional Identifier (optionalidentifier):**  
  Used for additional categorization or to distinguish between similar resources within a project.  
  **Examples:**  
  - Sequential numbers (e.g., `001`, `002`)  
  - Specific functionality (e.g., `frontend`, `backend`)
  
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
- Update external documentation (e.g., README.md, DEPLOYMENT.md, TROUBLESHOOTING.md) whenever significant changes occur.
- Maintain a consistent style across all documentation.

## Testing

- Ensure that code changes do not break existing functionality.
- Write and maintain tests (unit tests, integration tests, etc.) as appropriate.
- Follow best practices for test naming and organization.

## Consistency

- Follow the rules defined in this document as well as configuration files for ESLint, Stylelint, and Prettier.
- Consistent naming and formatting helps maintain the project over time.

For any questions or clarifications regarding code style, please reach out to the team.