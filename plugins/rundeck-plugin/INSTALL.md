# Installation Guide

This guide provides step-by-step instructions for installing and configuring the Rundeck Backstage Plugin.

## Prerequisites

- Backstage instance (version 1.19+)
- Access to a Rundeck instance with API enabled
- Rundeck API token with appropriate permissions
- Node.js 18+ and Yarn

## Step-by-Step Installation

### 1. Add the Plugin Dependency

Add the plugin to your backend package dependencies by editing `packages/backend/package.json`:

```json
{
  "dependencies": {
    "@internal/plugin-scaffolder-backend-module-rundeck": "git+https://github.com/justynroberts/backstage-rundeck-plugin.git"
  }
}
```

### 2. Register the Plugin Module

Import and register the module in your backend by editing `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other backend.add() statements

// Add Rundeck scaffolder actions
backend.add(import('@internal/plugin-scaffolder-backend-module-rundeck'));

backend.start();
```

### 3. Configure Rundeck Connection

Add Rundeck configuration to your `app-config.yaml`:

```yaml
rundeck:
  url: ${RUNDECK_API_URL}
  apiToken: ${RUNDECK_API_TOKEN}
```

### 4. Set Environment Variables

Create a `.env` file in your Backstage root directory:

```bash
# Rundeck Configuration
RUNDECK_API_URL=https://your-rundeck-instance.com
RUNDECK_API_TOKEN=your-rundeck-api-token
```

### 5. Install Dependencies

```bash
yarn install
```

### 6. Build and Start

```bash
yarn start
```

### 7. Verify Installation

Check the backend logs for:

```
[scaffolder] Starting scaffolder with the following actions enabled rundeck:job:execute, ...
```

## Troubleshooting

### Plugin Not Loading

1. Check backend logs for import errors
2. Verify the import statement in backend index.ts
3. Run `yarn install` to ensure plugin is downloaded

### Configuration Issues

1. Verify environment variables are set
2. Check app-config.yaml syntax
3. Test Rundeck connectivity manually

## Security

- Never commit API tokens to version control
- Use environment variables for sensitive configuration
- Use minimum required permissions for API tokens