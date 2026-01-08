/**
 * Allure Report Utilities
 * Scripts for managing Allure reports, history, and trend data
 */

import * as fs from 'fs';
import * as path from 'path';

const ALLURE_RESULTS_DIR = path.resolve(process.cwd(), 'allure-results');
const ALLURE_REPORT_DIR = path.resolve(process.cwd(), 'allure-report');
const ALLURE_HISTORY_DIR = path.join(ALLURE_REPORT_DIR, 'history');
const CATEGORIES_FILE = path.join(ALLURE_RESULTS_DIR, 'categories.json');

/**
 * Copy history from previous report to preserve trends
 */
function preserveHistory(): void {
  const historySourceDir = ALLURE_HISTORY_DIR;
  const historyTargetDir = path.join(ALLURE_RESULTS_DIR, 'history');

  if (fs.existsSync(historySourceDir)) {
    console.log('Preserving Allure history from previous report...');

    // Create target directory if it doesn't exist
    if (!fs.existsSync(historyTargetDir)) {
      fs.mkdirSync(historyTargetDir, { recursive: true });
    }

    // Copy history files
    const historyFiles = fs.readdirSync(historySourceDir);
    historyFiles.forEach((file) => {
      const sourcePath = path.join(historySourceDir, file);
      const targetPath = path.join(historyTargetDir, file);

      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`  Copied: ${file}`);
      }
    });

    console.log('History preserved successfully.');
  } else {
    console.log('No previous history found. Starting fresh.');
  }
}

/**
 * Ensure categories.json exists in allure-results
 */
function ensureCategories(): void {
  const defaultCategories = [
    {
      name: 'Timeout Failures',
      description: 'Tests that failed due to timeout issues',
      messageRegex: '.*[Tt]imed?\\s?out.*|.*[Tt]imeout.*',
      matchedStatuses: ['failed', 'broken'],
    },
    {
      name: 'Element Not Found',
      description: 'Tests that failed because an element could not be found',
      messageRegex: '.*element.*not.*found.*|.*no such element.*|.*unable to locate.*',
      matchedStatuses: ['failed', 'broken'],
    },
    {
      name: 'Assertion Failures',
      description: 'Tests that failed on assertion/expectation',
      messageRegex: '.*[Ee]xpect.*|.*[Aa]ssert.*',
      matchedStatuses: ['failed'],
    },
    {
      name: 'Network Failures',
      description: 'Tests that failed due to network issues',
      messageRegex: '.*[Nn]etwork.*|.*[Cc]onnection.*refused.*',
      matchedStatuses: ['failed', 'broken'],
    },
    {
      name: 'Skipped Tests',
      description: 'Tests that were skipped intentionally',
      matchedStatuses: ['skipped'],
    },
  ];

  if (!fs.existsSync(CATEGORIES_FILE)) {
    console.log('Creating default categories.json...');
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2), 'utf8');
    console.log('categories.json created.');
  } else {
    console.log('categories.json already exists.');
  }
}

/**
 * Clean old result files but preserve history
 */
function cleanResults(): void {
  if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
    fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
    return;
  }

  console.log('Cleaning old Allure results...');

  const files = fs.readdirSync(ALLURE_RESULTS_DIR);
  files.forEach((file) => {
    const filePath = path.join(ALLURE_RESULTS_DIR, file);
    const stat = fs.statSync(filePath);

    // Skip history directory and categories.json
    if (file === 'history' || file === 'categories.json' || file.endsWith('.template')) {
      return;
    }

    if (stat.isFile()) {
      fs.unlinkSync(filePath);
    } else if (stat.isDirectory() && file !== 'history') {
      fs.rmSync(filePath, { recursive: true });
    }
  });

  console.log('Old results cleaned.');
}

/**
 * Generate executor.json for CI/CD information
 */
function generateExecutorInfo(): void {
  const executorInfo = {
    name: process.env.CI_RUNNER_NAME || 'Local Runner',
    type: process.env.CI ? 'jenkins' : 'local',
    buildName: process.env.BUILD_NAME || process.env.GITHUB_RUN_ID || `Local-${Date.now()}`,
    buildUrl: process.env.BUILD_URL || process.env.GITHUB_SERVER_URL || '',
    reportUrl: '',
    reportName: 'Allure Report',
  };

  const executorPath = path.join(ALLURE_RESULTS_DIR, 'executor.json');
  fs.writeFileSync(executorPath, JSON.stringify(executorInfo, null, 2), 'utf8');
  console.log('executor.json generated.');
}

/**
 * Main execution based on command line argument
 */
const command = process.argv[2];

switch (command) {
  case 'preserve-history':
    preserveHistory();
    break;
  case 'ensure-categories':
    ensureCategories();
    break;
  case 'clean':
    cleanResults();
    break;
  case 'executor':
    generateExecutorInfo();
    break;
  case 'prepare':
    // Run all preparation steps
    preserveHistory();
    cleanResults();
    ensureCategories();
    generateExecutorInfo();
    break;
  default:
    console.log('Available commands:');
    console.log('  preserve-history  - Copy history from previous report');
    console.log('  ensure-categories - Create categories.json if missing');
    console.log('  clean             - Clean old results (preserves history)');
    console.log('  executor          - Generate executor.json');
    console.log('  prepare           - Run all preparation steps');
}
