import { config as baseConfig } from './wdio.conf';
import type { Options } from '@wdio/types';

/**
 * BrowserStack WebdriverIO Configuration
 * Extends base configuration for cloud testing on BrowserStack
 */

// Parse platform from command line args
const platformArg = process.argv.find((arg) => arg.startsWith('--platform='));
const platform = platformArg ? platformArg.split('=')[1] : 'android';

// Build name with timestamp
const buildName = `Build-${process.env.BUILD_NUMBER || new Date().toISOString().split('T')[0]}`;

// BrowserStack capabilities for Android devices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const androidCapabilities: any[] = [
  {
    platformName: 'Android',
    'bstack:options': {
      deviceName: process.env.DEVICE_NAME || 'Samsung Galaxy S23',
      platformVersion: '13.0',
      projectName: 'Mobile Automation Framework',
      buildName: buildName,
      sessionName: 'Android Smoke Tests',
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
  {
    platformName: 'Android',
    'bstack:options': {
      deviceName: 'Google Pixel 7',
      platformVersion: '13.0',
      projectName: 'Mobile Automation Framework',
      buildName: buildName,
      sessionName: 'Android Pixel Tests',
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
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
    platformName: 'iOS',
    'bstack:options': {
      deviceName: 'iPhone 15 Pro',
      platformVersion: '17',
      projectName: 'Mobile Automation Framework',
      buildName: buildName,
      sessionName: 'iOS iPhone 15 Pro Tests',
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
  {
    platformName: 'iOS',
    'bstack:options': {
      deviceName: 'iPhone 14',
      platformVersion: '16',
      projectName: 'Mobile Automation Framework',
      buildName: buildName,
      sessionName: 'iOS iPhone 14 Tests',
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
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
  switch (platform) {
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

export const config: Options.Testrunner = {
  ...baseConfig,

  //
  // ====================
  // BrowserStack Credentials
  // ====================
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  //
  // ====================
  // BrowserStack Hostname
  // ====================
  hostname: 'hub.browserstack.com',

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: ['./tests/specs/**/*.spec.ts'],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 5, // Parallel execution on BrowserStack
  capabilities: getCapabilities(),

  //
  // ========
  // Services
  // ========
  services: [
    [
      'browserstack',
      {
        // App upload configuration
        app: process.env.BROWSERSTACK_APP_PATH || './apps/android/app-release.apk',

        // Local testing
        browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
        opts: {
          localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
          forceLocal: false,
        },

        // Test observability
        testObservability: true,
        testObservabilityOptions: {
          projectName: 'Mobile Automation Framework',
          buildName: buildName,
        },
      },
    ],
  ],

  //
  // ===================
  // BrowserStack Hooks
  // ===================
  before: async function (_capabilities, specs) {
    console.log('BrowserStack test session starting...');
    console.log(`Build: ${buildName}`);
    console.log(`Platform: ${platform}`);

    // Add custom BrowserStack annotations
    await browser.executeScript('browserstack_executor: {"action": "setSessionName", "arguments": {"name": "' + specs[0] + '"}}', []);
  },

  afterTest: async function (test, _context, { passed }) {
    // Mark test status in BrowserStack
    const status = passed ? 'passed' : 'failed';

    try {
      await browser.executeScript(
        `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "${status}", "reason": ""}}`,
        []
      );
    } catch (e) {
      console.log('Failed to set BrowserStack session status:', e);
    }

    // Take screenshot on failure
    if (!passed) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `browserstack_${test.title.replace(/\s+/g, '_')}_${timestamp}`;

      try {
        await browser.saveScreenshot(`./reports/screenshots/${screenshotName}.png`);
      } catch (e) {
        console.log('Failed to capture screenshot:', e);
      }
    }
  },

  onComplete: function (exitCode) {
    console.log('========================================');
    console.log('BrowserStack Test Execution Complete');
    console.log(`Build: ${buildName}`);
    console.log(`Exit Code: ${exitCode}`);
    console.log('View results at: https://app-automate.browserstack.com/dashboard');
    console.log('========================================');
  },
};

export default config;
