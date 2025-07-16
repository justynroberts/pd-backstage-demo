# backstage-demos
This repository contains a Backstage instance configured with the PagerDuty plugin for Backstage that can be used for demos.

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

## Getting Started

1. **Clone the repository**
   ```sh
   git clone <YOUR_REPO_URL>
   cd backstage-demo
   ```

2. **Install dependencies**
   ```sh
   yarn install
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
export RUNDECK_API_URL="https://YOURDSERVER.runbook.pagerduty.cloud"

# Optional PagerDuty configuration (defaults shown)
export PAGERDUTY_SUBDOMAIN="pdt-justyn"
export PAGERDUTY_REGION="US"

# Required for Scaffolder plugin (if demoing project creation)
export GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"
```

## Running the Application

```sh
yarn start
```

**For Node.js 20+:** Use the following command due to backend compatibility:
```sh
NODE_OPTIONS=--no-node-snapshot yarn start
```

The application will start:
- Frontend: http://localhost:3000

Notes:
| Service | Status |
|---------|--------|
| Service Sync | Working |
| Create NodeJS app with PD Service | Working |
| AWS Cloud Application Runs RBA Job (And returns log data) | Working |

Edit local files in examples/template/content to suit your own JobIDs, task naming etc










