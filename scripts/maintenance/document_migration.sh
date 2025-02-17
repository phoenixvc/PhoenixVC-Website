#!/bin/bash

# Create backup
timestamp=$(date +%Y%m%d_%H%M%S)
cp -r docs/ docs_backup_${timestamp}

# Create new directory structure
mkdir -p docs_new/{_includes,_templates,_data}
mkdir -p docs_new/assets/{shared,main,design,examples}
mkdir -p docs_new/main/{guides,meta,policies,reference}
mkdir -p docs_new/design/{components,getting-started,guidelines,tokens}

# Move and reorganize assets
# -- Shared assets
mv docs/assets/css docs_new/assets/shared/
mv docs/assets/js docs_new/assets/shared/
mv docs/assets/images docs_new/assets/shared/
mv docs/assets/videos docs_new/assets/shared/
mv docs/assets/previews docs_new/assets/examples/

# -- Main documentation files
mv docs/CHANGELOG.md docs_new/main/meta/
mv docs/FAQ.md docs_new/main/
mv docs/README.md docs_new/main/index.md
mv docs/SECURITY.md docs_new/main/policies/
mv docs/documentation-map.md docs_new/main/meta/
mv docs/documentation-roadmap.md docs_new/main/meta/
mv docs/naming-conventions.md docs_new/main/reference/

# -- Compliance and Security
mkdir -p docs_new/main/policies/compliance
mv docs/compliance/* docs_new/main/policies/compliance/

# -- Development and Deployment
mkdir -p docs_new/main/guides/{deployment,development,infrastructure}
mv docs/deployment/* docs_new/main/guides/deployment/
mv docs/development/* docs_new/main/guides/development/
mv docs/infrastructure/* docs_new/main/guides/infrastructure/

# -- Design System
# Merge design and design-system directories
mkdir -p docs_new/design/foundations
mv docs/design-system/foundations/* docs_new/design/foundations/
mv docs/design/components/* docs_new/design/components/
mv docs/design/tokens/* docs_new/design/tokens/
mv docs/design/guidelines/* docs_new/design/guidelines/
mv docs/design/getting-started/* docs_new/design/getting-started/

# -- References
mkdir -p docs_new/main/reference
mv docs/references/* docs_new/main/reference/

# -- Move mkdocs configuration
mv docs/mkdocs.yml docs_new/

# Clean up and finalize
rm -rf docs
mv docs_new docs

echo "Migration completed! Backup created at docs_backup_${timestamp}"
echo "Please review the new structure and verify all content has been properly migrated."
