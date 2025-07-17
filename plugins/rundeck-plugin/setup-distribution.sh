#!/bin/bash

# Setup script for distributing the Rundeck scaffolder plugin

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_NAME="@internal/plugin-scaffolder-backend-module-rundeck"

echo "🚀 Setting up Rundeck Scaffolder Plugin for Distribution"
echo "Plugin directory: $PLUGIN_DIR"

# Function to prompt for user input
prompt_user() {
    local prompt_message="$1"
    local default_value="$2"
    local user_input
    
    if [ -n "$default_value" ]; then
        read -p "$prompt_message [$default_value]: " user_input
        echo "${user_input:-$default_value}"
    else
        read -p "$prompt_message: " user_input
        echo "$user_input"
    fi
}

# Choose distribution method
echo ""
echo "Choose your distribution method:"
echo "1) Private npm registry (recommended for organizations)"
echo "2) Git repository (best for source control)"
echo "3) Direct file distribution (for quick sharing)"
echo ""

DISTRIBUTION_METHOD=$(prompt_user "Enter your choice (1-3)" "2")

case $DISTRIBUTION_METHOD in
    1)
        echo ""
        echo "📦 Setting up for npm registry distribution..."
        
        # Get organization details
        ORG_NAME=$(prompt_user "Enter your organization name (e.g., 'mycompany')" "")
        REGISTRY_URL=$(prompt_user "Enter your npm registry URL" "https://registry.npmjs.org")
        
        # Update package.json
        echo "Updating package.json with organization scope..."
        
        # Create backup
        cp "$PLUGIN_DIR/package.json" "$PLUGIN_DIR/package.json.backup"
        
        # Update package name and registry
        sed -i.tmp "s|\"name\": \"@internal/plugin-scaffolder-backend-module-rundeck\"|\"name\": \"@$ORG_NAME/plugin-scaffolder-backend-module-rundeck\"|g" "$PLUGIN_DIR/package.json"
        
        # Add publishConfig if not exists
        if ! grep -q "publishConfig" "$PLUGIN_DIR/package.json"; then
            sed -i.tmp '/"license": "Apache-2.0",/a\
  "publishConfig": {\
    "registry": "'$REGISTRY_URL'",\
    "access": "restricted"\
  },' "$PLUGIN_DIR/package.json"
        fi
        
        rm "$PLUGIN_DIR/package.json.tmp"
        
        echo "✅ Package configured for npm registry distribution"
        echo ""
        echo "Next steps:"
        echo "1. Build the package: yarn build"
        echo "2. Publish to registry: npm publish"
        echo "3. Install in target instances: yarn add @$ORG_NAME/plugin-scaffolder-backend-module-rundeck"
        ;;
        
    2)
        echo ""
        echo "📂 Setting up for Git repository distribution..."
        
        REPO_NAME=$(prompt_user "Enter repository name" "backstage-rundeck-plugin")
        REPO_URL=$(prompt_user "Enter repository URL (optional)" "")
        
        # Create repository structure
        REPO_DIR="$PLUGIN_DIR/../../../$REPO_NAME"
        
        echo "Creating repository structure in: $REPO_DIR"
        mkdir -p "$REPO_DIR/packages/scaffolder-backend-module-rundeck"
        
        # Copy plugin files
        cp -r "$PLUGIN_DIR"/* "$REPO_DIR/packages/scaffolder-backend-module-rundeck/"
        
        # Create root package.json
        cat > "$REPO_DIR/package.json" << EOF
{
  "name": "$REPO_NAME",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@backstage/cli": "^0.30.0",
    "typescript": "~5.4.0"
  }
}
EOF
        
        # Create root README
        cat > "$REPO_DIR/README.md" << EOF
# Backstage Rundeck Plugin

This repository contains the Rundeck scaffolder plugin for Backstage.

## Installation

\`\`\`bash
yarn add git+https://github.com/your-org/$REPO_NAME.git
\`\`\`

See [DISTRIBUTION.md](./packages/scaffolder-backend-module-rundeck/DISTRIBUTION.md) for detailed installation instructions.
EOF
        
        # Initialize git if requested
        if [ -n "$REPO_URL" ]; then
            cd "$REPO_DIR"
            git init
            git add .
            git commit -m "Initial commit: Rundeck scaffolder plugin"
            git remote add origin "$REPO_URL"
            echo "Repository initialized with remote: $REPO_URL"
        fi
        
        echo "✅ Git repository structure created"
        echo ""
        echo "Next steps:"
        echo "1. cd $REPO_DIR"
        echo "2. yarn install"
        echo "3. yarn workspace @internal/plugin-scaffolder-backend-module-rundeck build"
        if [ -n "$REPO_URL" ]; then
            echo "4. git push -u origin main"
        else
            echo "4. Set up your git remote and push"
        fi
        echo "5. Install in target instances: yarn add git+$REPO_URL"
        ;;
        
    3)
        echo ""
        echo "📁 Setting up for direct file distribution..."
        
        # Build and pack
        cd "$PLUGIN_DIR"
        echo "Building plugin..."
        yarn build
        
        echo "Creating distribution package..."
        yarn pack
        
        PACKAGE_FILE="$PLUGIN_DIR/package.tgz"
        
        echo "✅ Distribution package created: $PACKAGE_FILE"
        echo ""
        echo "Next steps:"
        echo "1. Share the package file: $PACKAGE_FILE"
        echo "2. Install in target instances: yarn add file:./path/to/package.tgz"
        echo "3. Or upload to file server and install: yarn add https://your-server.com/path/to/package.tgz"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📖 For detailed installation instructions, see: $PLUGIN_DIR/DISTRIBUTION.md"
echo "🎉 Setup complete!"