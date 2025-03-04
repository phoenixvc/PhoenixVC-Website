#!/bin/bash

# Define the root directory relative to the project workspace
PROJECT_ROOT="$(pwd)"  # Gets the current working directory
SIDEBAR_ROOT="$PROJECT_ROOT/apps/web/src/features/sidebar"

# Create the folder structure
mkdir -p "$SIDEBAR_ROOT/components"
mkdir -p "$SIDEBAR_ROOT/hooks"
mkdir -p "$SIDEBAR_ROOT/styles"
mkdir -p "$SIDEBAR_ROOT/utils"
mkdir -p "$SIDEBAR_ROOT/__tests__"

# Create the main Sidebar components
touch "$SIDEBAR_ROOT/components/Sidebar.tsx"
touch "$SIDEBAR_ROOT/components/SidebarItem.tsx"
touch "$SIDEBAR_ROOT/components/SidebarGroup.tsx"

# Create the custom hook
touch "$SIDEBAR_ROOT/hooks/useSidebarState.ts"

# Create the styles file
touch "$SIDEBAR_ROOT/styles/sidebar.module.css"

# Create the utility file
touch "$SIDEBAR_ROOT/utils/sidebarUtils.ts"

# Create the test files
touch "$SIDEBAR_ROOT/__tests__/Sidebar.test.tsx"
touch "$SIDEBAR_ROOT/__tests__/SidebarItem.test.tsx"
touch "$SIDEBAR_ROOT/__tests__/SidebarGroup.test.tsx"

# Create the index file
touch "$SIDEBAR_ROOT/index.ts"

# Print success message
echo "Sidebar folder structure and files created successfully at $SIDEBAR_ROOT"
