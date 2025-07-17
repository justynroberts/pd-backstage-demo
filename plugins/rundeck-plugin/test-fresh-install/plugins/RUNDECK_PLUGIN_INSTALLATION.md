# Rundeck Scaffolder Plugin Installation Guide

This guide explains how to install and configure the Rundeck scaffolder backend module for Backstage.

## ⚠️ Current Status

The Rundeck plugin repository contains source code but doesn't include built artifacts in the npm package. You need to ensure the source files are available for Backstage to build.

## Overview

The Rundeck scaffolder plugin adds custom actions to Backstage's scaffolder that allow templates to interact with Rundeck jobs. This enables automation workflows to trigger Rundeck jobs as part of the software templating process.

## Prerequisites

- Backstage instance (version 1.20+)
- Access to a Rundeck instance with API enabled
- Rundeck API token with appropriate permissions

## Installation Steps

### 1. Add the Plugin Dependency

Add the Rundeck plugin to your backend package dependencies. Edit `packages/backend/package.json`:

```json
{
  "dependencies": {
    // ... other dependencies
    "@internal/plugin-scaffolder-backend-module-rundeck": "git+https://github.com/justynroberts/backstage-rundeck-plugin.git"
  }
}
```

**Note**: The plugin source needs to be cloned and its `src` directory copied to `node_modules/@internal/plugin-scaffolder-backend-module-rundeck/` after installation for Backstage to build it properly.

### 2. Register the Plugin Module

Import and register the module in your backend by editing `packages/backend/src/index.ts`:

```typescript
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// ... other backend.add() statements

// Add the Rundeck scaffolder actions
backend.add(import('@internal/plugin-scaffolder-backend-module-rundeck'));

backend.start();
```

### 3. Configure Environment Variables

The plugin requires the following environment variables:

```bash
export RUNDECK_API_URL="https://your-rundeck-instance.com"
export RUNDECK_API_TOKEN="your-rundeck-api-token"
```

You can add these to:
- Your `.env` file (for local development)
- Your deployment configuration (for production)
- A startup script (like `start.sh`)

### 4. Install Dependencies

Run yarn install from the root of your Backstage project:

```bash
yarn install
```

### 5. Verify Installation

Start your Backstage instance:

```bash
yarn start
```

The Rundeck actions should now be available in your scaffolder templates.

## Using Rundeck Actions in Templates

Once installed, you can use Rundeck actions in your scaffolder templates. Here's an example:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: example-with-rundeck
  title: Example Template with Rundeck
spec:
  steps:
    - id: trigger-rundeck-job
      name: Trigger Rundeck Job
      action: rundeck:job:run
      input:
        jobId: ${{ parameters.rundeckJobId }}
        options:
          param1: ${{ parameters.someValue }}
          param2: ${{ parameters.anotherValue }}
```

## Available Actions

The specific actions available depend on the plugin implementation. Common actions include:

- `rundeck:job:run` - Trigger a Rundeck job
- `rundeck:job:status` - Check job execution status
- `rundeck:project:list` - List available projects

Check the plugin documentation for a complete list of available actions and their parameters.

## Troubleshooting

### Plugin not loading

1. Ensure the module is imported in `packages/backend/src/index.ts`
2. Check that the dependency is listed in `packages/backend/package.json`
3. Verify environment variables are set correctly
4. Check backend logs for any error messages

### Actions not appearing in scaffolder

1. Restart your Backstage instance after installation
2. Check that the plugin successfully registered by looking for startup logs
3. Ensure your template yaml syntax is correct

### API connection issues

1. Verify `RUNDECK_API_URL` is correct and accessible
2. Confirm `RUNDECK_API_TOKEN` has necessary permissions
3. Check network connectivity between Backstage and Rundeck

## Security Considerations

- Store API tokens securely using environment variables or secret management
- Use tokens with minimal required permissions
- Consider network security between Backstage and Rundeck instances
- Regularly rotate API tokens

## Support

For issues specific to this plugin, check:
- Plugin repository: https://github.com/justynroberts/backstage-rundeck-plugin
- Backstage community Discord
- Rundeck documentation for API details