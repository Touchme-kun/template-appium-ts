/**
 * BrowserStack Cucumber Configuration
 * BDD test execution on BrowserStack cloud
 */

import type { Options, Capabilities } from '@wdio/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { rootDir } from './wdio.conf';
import { browser } from '@wdio/globals';

// Load environment variables
dotenv.config();

// Build name with timestamp
const buildName = `BDD-${process.env.BUILD_NUMBER || new Date().toISOString().split('T')[0]}`;

console.log(`🥒 BrowserStack BDD Configuration Loading...`);
console.log(`🏷️  Tags: ${process.env.CUCUMBER_TAGS || '(all scenarios)'}`);

/**
 * Get tag expression from environment
 */
const getTagExpression = (): string => {
  return process.env.CUCUMBER_TAGS || '';
};

// BrowserStack capabilities for Android devices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const androidCapabilities: any[] = [
  {
    platformName: `Android`,
    'bstack:options': {
      deviceName: process.env.DEVICE_NAME || 'Samsung Galaxy S23',
      osVersion: '13.0',
      projectName: 'Mobile Automation Framework - BDD',
      buildName: buildName,
      sessionName: `Android BDD Tests - ${process.env.DEVICE_NAME || 'Samsung Galaxy S23'}`,
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
      idleTimeout: 300,
    },
    'appium:app': process.env.BROWSERSTACK_APP_ID || 'bs://your-app-id',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:automationName': 'UiAutomator2',
  },
];

// BrowserStack capabilities for iOS devices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iosCapabilities: any[] = [
  {
    'bstack:options': {
      deviceName: process.env.DEVICE_NAME || 'iPhone 15 Pro',
      osVersion: '17',
      projectName: 'Mobile Automation Framework - BDD',
      buildName: buildName,
      sessionName: `iOS BDD Tests - ${process.env.DEVICE_NAME || 'iPhone 15 Pro'}`,
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
      idleTimeout: 300,
    },
    'appium:app': process.env.BROWSERSTACK_IOS_APP_ID || 'bs://your-ios-app-id',
    'appium:autoAcceptAlerts': true,
    'appium:noReset': false,
    'appium:automationName': 'XCUITest',
  },
];

// Select capabilities based on platform
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCapabilities = (): any[] => {
  // Read platform at runtime, not at config load time
  const platform = process.env.BROWSERSTACK_PLATFORM || 'android';
  console.log(`🚀 Using platform: ${platform}`);
  
  switch (platform.toLowerCase()) {
    case 'ios':
      return iosCapabilities;
    case 'android':
      return androidCapabilities;
    case 'all':
      return [...androidCapabilities, ...iosCapabilities];
    default:
      return androidCapabilities;
  }
};

export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  tsConfigPath: path.join(rootDir, 'tsconfig.json'),

  //
  // ====================
  // BrowserStack Credentials
  // ====================
  user: process.env.BROWSERSTACK_USER || process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_KEY || process.env.BROWSERSTACK_ACCESS_KEY,

  //
  // ====================
  // BrowserStack Hostname
  // ====================
  hostname: 'hub.browserstack.com',

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [path.join(rootDir, 'tests/features/**/*.feature')],
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 5,
  capabilities: getCapabilities(),

  //
  // ===================
  // Test Configurations
  // ===================
  logLevel: (process.env.LOG_LEVEL as Options.WebDriverLogTypes) || 'info',
  bail: 0,
  baseUrl: process.env.BASE_URL || '',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  //
  // =================
  // Cucumber Framework
  // =================
  framework: 'cucumber',
  cucumberOpts: {
    require: [
      path.join(rootDir, 'tests/features/step-definitions/**/*.ts'),
      path.join(rootDir, 'tests/features/support/**/*.ts'),
    ],
    backtrace: false,
    requireModule: [],
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    tagExpression: getTagExpression(),
    timeout: 120000,
    ignoreUndefinedDefinitions: false,
    name: [],
  },

  //
  // =========
  // Reporters
  // =========
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.join(rootDir, 'allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: true,
        addConsoleLogs: true,
      },
    ],
  ],

  //
  // ========
  // Services
  // ========
  services: [
    [
      'browserstack',
      {
        // Only specify app path if uploading a new app (not using existing bs:// ID)
        // If BROWSERSTACK_APP_ID is set, the app is already uploaded and specified in capabilities
        ...(process.env.BROWSERSTACK_APP_PATH ? { app: process.env.BROWSERSTACK_APP_PATH } : {}),
        browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
        opts: {
          localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
          forceLocal: false,
        },
        testObservability: true,
        testObservabilityOptions: {
          projectName: 'Mobile Automation Framework - BDD',
          buildName: buildName,
        },
      },
    ],
  ],

  //
  // ===================
  // BrowserStack Hooks
  // ===================
  onPrepare: function () {
    const platform = process.env.BROWSERSTACK_PLATFORM || 'android';
    console.log('\n🥒 Starting BrowserStack BDD Tests');
    console.log('=====================================');
    console.log(`Platform: ${platform}`);
    console.log(`Build: ${buildName}`);
    console.log(`Tags: ${getTagExpression() || '(all scenarios)'}`);
    console.log('=====================================\n');
  },

  before: async function (_capabilities, specs) {
    console.log('BrowserStack BDD session starting...');
    await browser.executeScript(
      'browserstack_executor: {"action": "setSessionName", "arguments": {"name": "BDD - ' + specs[0] + '"}}',
      []
    );
  },

  afterScenario: async function (world, result) {
    // Mark scenario status in BrowserStack
    const status = result.passed ? 'passed' : 'failed';
    const scenarioName = world.pickle?.name || 'Unknown Scenario';

    try {
      await browser.executeScript(
        `browserstack_executor: {"action": "annotate", "arguments": {"data": "Scenario: ${scenarioName} - ${status}", "level": "${result.passed ? 'info' : 'error'}"}}`,
        []
      );

      // Take screenshot on failure
      if (!result.passed) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = `bdd_${scenarioName.replace(/\s+/g, '_')}_${timestamp}`;
        await browser.saveScreenshot(`./reports/screenshots/${screenshotName}.png`);
      }
    } catch (e) {
      console.log('Failed to annotate BrowserStack:', e);
    }
  },

  after: async function (result) {
    // Set final session status
    const status = result === 0 ? 'passed' : 'failed';
    try {
      await browser.executeScript(
        `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "${status}", "reason": "BDD test execution ${status}"}}`,
        []
      );
    } catch (e) {
      console.log('Failed to set session status:', e);
    }
  },

  onComplete: function (exitCode, _config, _capabilities, results) {
    console.log('\n=====================================');
    console.log('🥒 BrowserStack BDD Tests Complete');
    console.log(`Build: ${buildName}`);
    console.log(`Exit Code: ${exitCode}`);
    if (results) {
      console.log(`Passed: ${results.passed || 0}`);
      console.log(`Failed: ${results.failed || 0}`);
    }
    console.log('View results at: https://app-automate.browserstack.com/dashboard');
    console.log('=====================================\n');
  },
};

export default config;
