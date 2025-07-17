# Distribution Guide for Rundeck Scaffolder Plugin

This guide explains how to distribute and install the Rundeck scaffolder plugin across multiple Backstage instances.

## Distribution Methods

### Method 1: Private npm Registry (Recommended for Organizations)

This is the most professional approach for organizations with multiple Backstage instances.

#### Step 1: Set up a private npm registry

**Option A: Using npm Enterprise/GitHub Packages**
```bash
# Configure npm to use GitHub Packages
npm config set @your-org:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_GITHUB_TOKEN
```

**Option B: Using Artifactory/Nexus**
```bash
# Configure npm to use your private registry
npm config set @your-org:registry https://your-artifactory.com/artifactory/api/npm/npm-local/
```

#### Step 2: Update package.json for your organization

```bash
cd /Users/jroberts/work/backstage-dev/backstage/plugins/scaffolder-backend-module-rundeck
```

Update the package name in `package.json`:
```json
{
  "name": "@your-org/plugin-scaffolder-backend-module-rundeck",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://your-registry-url.com",
    "access": "restricted"
  }
}
```

#### Step 3: Publish to your registry

```bash
# Build the package
yarn build

# Publish to your private registry
npm publish
```

#### Step 4: Install in other Backstage instances

```bash
# In your target Backstage instance
yarn add @your-org/plugin-scaffolder-backend-module-rundeck
```

### Method 2: Git Repository (Best for Source Control)

This method keeps the plugin in source control and allows version tracking.

#### Step 1: Create a new Git repository

```bash
# Create a new directory for your plugin repository
mkdir backstage-rundeck-plugin
cd backstage-rundeck-plugin

# Initialize git repository
git init
```

#### Step 2: Copy plugin files to new repository

```bash
# Copy the plugin files
cp -r /Users/jroberts/work/backstage-dev/backstage/plugins/scaffolder-backend-module-rundeck/* .

# Create a proper repository structure
mkdir -p packages/scaffolder-backend-module-rundeck
mv src package.json README.md DISTRIBUTION.md packages/scaffolder-backend-module-rundeck/

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "backstage-rundeck-plugin-monorepo",
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

# Create README for the repository
cat > README.md << 'EOF'
# Backstage Rundeck Plugin

This repository contains the Rundeck scaffolder plugin for Backstage.

## Installation

```bash
yarn add git+https://github.com/your-org/backstage-rundeck-plugin.git
```

See [DISTRIBUTION.md](./packages/scaffolder-backend-module-rundeck/DISTRIBUTION.md) for detailed installation instructions.
EOF
```

#### Step 3: Set up the repository

```bash
# Install dependencies
yarn install

# Build the plugin
yarn workspace @internal/plugin-scaffolder-backend-module-rundeck build

# Commit to git
git add .
git commit -m "Initial commit: Rundeck scaffolder plugin"

# Add remote and push (replace with your repository URL)
git remote add origin https://github.com/your-org/backstage-rundeck-plugin.git
git push -u origin main
```

#### Step 4: Install in other Backstage instances

```bash
# Install directly from git
yarn add git+https://github.com/your-org/backstage-rundeck-plugin.git

# Or install a specific version/branch
yarn add git+https://github.com/your-org/backstage-rundeck-plugin.git#v1.0.0
```

### Method 3: Direct File Distribution

This method is suitable for quick sharing or testing.

#### Step 1: Create distribution package

```bash
cd /Users/jroberts/work/backstage-dev/backstage/plugins/scaffolder-backend-module-rundeck

# Create the distribution package
yarn pack
```

#### Step 2: Share the package file

Share the generated `package.tgz` file with your team through:
- Email attachment
- Shared network drive
- Internal file sharing system
- Cloud storage (S3, Google Drive, etc.)

#### Step 3: Install in other Backstage instances

```bash
# Install from local file
yarn add file:./path/to/package.tgz

# Or install from URL
yarn add https://your-file-server.com/path/to/package.tgz
```

## Installation in Target Backstage Instances

Once you've chosen a distribution method, follow these steps to install the plugin in your target Backstage instances:

### Step 1: Install the package

Choose one of the installation methods above based on your distribution choice.

### Step 2: Configure your backend

Add the plugin to your backend in `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

// Import the Rundeck plugin
import scaffolderModuleRundeck from '@internal/plugin-scaffolder-backend-module-rundeck';
// or if you changed the package name:
// import scaffolderModuleRundeck from '@your-org/plugin-scaffolder-backend-module-rundeck';

const backend = createBackend();

// Add all your other plugins...
backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-techdocs-backend'));

// Add the Rundeck plugin
backend.add(scaffolderModuleRundeck);

backend.start();
```

### Step 3: Configure Rundeck credentials

Add Rundeck configuration to your `app-config.yaml`:

```yaml
rundeck:
  url: https://your-rundeck-instance.com
  apiToken: ${RUNDECK_API_TOKEN}
```

Set the environment variable:
```bash
export RUNDECK_API_TOKEN=your-rundeck-api-token
```

### Step 4: Use in scaffolder templates

Create or update your scaffolder templates to use the Rundeck action:

```yaml
# template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: deploy-with-rundeck
  title: Deploy Application with Rundeck
spec:
  parameters:
    - title: Deployment Configuration
      properties:
        jobId:
          title: Rundeck Job ID
          type: string
          description: The ID of the Rundeck job to execute
        environment:
          title: Environment
          type: string
          enum: ['dev', 'staging', 'prod']
        version:
          title: Version
          type: string
          description: Application version to deploy
  steps:
    - id: deploy
      name: Deploy Application
      action: rundeck:job:execute
      input:
        jobId: ${{ parameters.jobId }}
        projectName: "deployment-project"
        parameters:
          environment: ${{ parameters.environment }}
          version: ${{ parameters.version }}
        waitForJob: true
```

### Step 5: Test the installation

1. Restart your Backstage backend
2. Navigate to the Scaffolder in your Backstage UI
3. Create a new component using a template that includes the Rundeck action
4. Verify the job executes successfully in Rundeck

## Troubleshooting

### Common Issues

**Plugin not found after installation**
- Verify the package name in your import statement matches the installed package
- Check that you've added the plugin to your backend configuration
- Restart your Backstage backend

**Rundeck API connection issues**
- Verify your Rundeck URL and API token are correct
- Check that the Rundeck instance is accessible from your Backstage backend
- Verify the API token has necessary permissions

**Build errors**
- Ensure you're using compatible versions of Backstage dependencies
- Run `yarn install` to ensure all dependencies are properly installed

### Version Compatibility

This plugin is compatible with:
- Backstage 1.19+
- Node.js 18+
- Rundeck API v40+

## Updating the Plugin

### For npm registry distribution:
```bash
# Update version in package.json
npm version patch  # or minor, major
yarn build
npm publish
```

### For git repository distribution:
```bash
# Update version and commit changes
git add .
git commit -m "Update plugin to v1.0.1"
git tag v1.0.1
git push origin main --tags
```

### Installing updates in target instances:
```bash
# For npm packages
yarn upgrade @your-org/plugin-scaffolder-backend-module-rundeck

# For git repositories
yarn upgrade
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Rundeck API documentation
3. Consult Backstage plugin development documentation
4. Check your organization's internal documentation