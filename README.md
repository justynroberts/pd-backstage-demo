# Backstage Demo with PagerDuty and Rundeck Integration

This repository contains a complete Backstage instance with integrated PagerDuty and Rundeck plugins. It's designed as an all-in-one distributable demo that can be set up and running with minimal commands.

## Features

- **PagerDuty Integration**: Service synchronization, incident management, and service creation
- **Rundeck Integration**: Job execution through scaffolder templates with optional wait functionality
- **All-in-One Setup**: No external plugin dependencies - everything is included

## Prerequisites

### macOS Setup

1. **Node.js** (version 20 or 22)
   ```sh
   # Using Homebrew
   brew install node@20
   # Or using nvm
   nvm install 20
   nvm use 20
   ```

2. **Yarn** (version 4.4.1)
   ```sh
   # Enable Corepack (included with Node.js 16+)
   corepack enable
   ```

3. **Git**
   ```sh
   # Using Homebrew
   brew install git
   ```

## Quick Start

1. **Clone the repository**
   ```sh
   git clone https://github.com/justynroberts/pd-backstage-demo.git
   cd pd-backstage-demo
   ```

2. **Install dependencies and build everything**
   ```sh
   yarn install
   yarn build:all
   ```

## Register App in PagerDuty
Follow [the steps in the plugin's official documentation](https://pagerduty.github.io/backstage-plugin-docs/getting-started/pagerduty/#register-an-application-for-scoped-oauth-recommended) to make register the App. Copy and store the value for Client Id and Secret.

## Get a GitHub Personal Access Token

> You'll need to connect to your Git provider. The default template in this repo uses GitHub.

Generate a Personal Access Token (PAT) by following the instructions in GitHub's [official documentation](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). Copy and store the PAT's value.

Or you can use the supplied one - There is always the danger of getting an error that a repo already exists.

## Required Environment Variables

Set the following environment variables before running the application:

```sh
# Required for PagerDuty integration
export PAGERDUTY_CLIENT_ID="CLIENT_ID_FOR_REGISTERED_APP"
export PAGERDUTY_CLIENT_SECRET="CLIENT_SECRET_FOR_REGISTERED_APP"

# Required for Rundeck integration
export RUNDECK_API_TOKEN="YOUR_RUNDECK_API_TOKEN"
export RUNDECK_API_URL="https://YOURSERVER.runbook.pagerduty.cloud"

# Optional PagerDuty configuration (defaults shown)
export PAGERDUTY_SUBDOMAIN="YOUR_DOMAIN" 
export PAGERDUTY_REGION="US"

# Required for Scaffolder plugin (if demoing project creation)
export GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
```

## Running the Application

3. **Start the application**
   ```sh
   yarn start
   ```

   **For Node.js 20+:** Use the following command due to backend compatibility:
   ```sh
   NODE_OPTIONS=--no-node-snapshot yarn start
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:7007

## Included Scaffolder Actions

The Rundeck plugin provides the following scaffolder action:

- **`rundeck:job:execute`**: Execute Rundeck jobs with optional parameters and wait functionality

Notes:
| Service | Status |
|---------|--------|
| Service Sync | Working |
| Create NodeJS app with PD Service | Working |
| AWS Cloud Application Runs RBA Job (And returns log data) | Working |

Edit local files in examples/template/content to suit your own JobIDs, task naming etc










