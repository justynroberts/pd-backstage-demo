#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Ensures all @internal workspace plugins are properly built
 * This script verifies that dist directories exist and contain the expected files
 */

const INTERNAL_PLUGINS = [
  '@internal/plugin-scaffolder-backend-module-rundeck'
];

function checkPluginBuild(pluginName) {
  const pluginPath = path.join('node_modules', pluginName);
  const distPath = path.join(pluginPath, 'dist');
  const indexDtsPath = path.join(distPath, 'index.d.ts');
  const indexCjsPath = path.join(distPath, 'index.cjs.js');

  console.log(`Checking ${pluginName}...`);

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.log(`  ❌ Missing dist directory`);
    return false;
  }

  // Check if key files exist
  if (!fs.existsSync(indexDtsPath)) {
    console.log(`  ❌ Missing index.d.ts`);
    return false;
  }

  if (!fs.existsSync(indexCjsPath)) {
    console.log(`  ❌ Missing index.cjs.js`);
    return false;
  }

  // Check if files have content
  const dtsContent = fs.readFileSync(indexDtsPath, 'utf8');
  if (dtsContent.trim().length === 0) {
    console.log(`  ❌ Empty index.d.ts file`);
    return false;
  }

  console.log(`  ✅ Build verified`);
  return true;
}

function buildPlugin(pluginName) {
  console.log(`Building ${pluginName}...`);
  try {
    const pluginPath = path.join('node_modules', pluginName);
    execSync('yarn build', { 
      cwd: pluginPath, 
      stdio: 'inherit',
      timeout: 120000 // 2 minute timeout
    });
    console.log(`  ✅ Build completed`);
    return true;
  } catch (error) {
    console.error(`  ❌ Build failed:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Ensuring internal plugins are built...\n');
  
  let allGood = true;
  
  for (const plugin of INTERNAL_PLUGINS) {
    if (!checkPluginBuild(plugin)) {
      console.log(`🔨 Attempting to build ${plugin}...`);
      if (!buildPlugin(plugin)) {
        allGood = false;
        console.error(`💥 Failed to build ${plugin}`);
      } else {
        // Verify build was successful
        if (!checkPluginBuild(plugin)) {
          allGood = false;
          console.error(`💥 Build completed but verification failed for ${plugin}`);
        }
      }
    }
    console.log('');
  }
  
  if (allGood) {
    console.log('✅ All internal plugins are properly built!');
    process.exit(0);
  } else {
    console.error('❌ Some plugins failed to build properly');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}