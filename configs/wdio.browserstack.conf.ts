import { config as baseConfig, rootDir } from './wdio.conf';
import { browser } from '@wdio/globals';
import type { Options, Capabilities } from '@wdio/types';
import * as path from 'path';

/**
 * BrowserStack WebdriverIO Configuration
 * Extends base configuration for cloud testing on BrowserStack
 */

// Build & project names (env‑driven with safe defaults)
const projectName = process.env.BROWSERSTACK_PROJECT_NAME || 'Mobile Automation Framework';
const buildName =
  process.env.BROWSERSTACK_BUILD_NAME ||
  `Build-${process.env.BUILD_NUMBER || new Date().toISOString().split('T')[0]}`;

const androidOsVersion = process.env.BROWSERSTACK_ANDROID_OS_VERSION || '13.0';
const iosOsVersion =
  process.env.BROWSERSTACK_IOS_OS_VERSION ||
  process.env.IOS_PLATFORM_VERSION ||
  '17';

// Device lists can be comma‑separated, fully controlled via env
const androidDevices = (process.env.BROWSERSTACK_ANDROID_DEVICES || process.env.DEVICE_NAME || '')
  .split(',')
  .map((d) => d.trim())
  .filter((d) => d.length > 0);

const iosDevices = (process.env.BROWSERSTACK_IOS_DEVICES || process.env.IOS_DEVICE_NAME || '')
  .split(',')
  .map((d) => d.trim())
  .filter((d) => d.length > 0);

// App IDs come only from env (no hardcoded bs:// placeholders)
const androidAppId = process.env.BROWSERSTACK_APP_ID;
const iosAppId = process.env.BROWSERSTACK_IOS_APP_ID;

// BrowserStack capabilities for Android devices (env‑driven)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const androidCapabilities: any[] = (androidDevices.length ? androidDevices : ['Android Device']).map(
  (deviceName: string) => ({
    platformName: 'Android',
    'bstack:options': {
      deviceName,
      osVersion: androidOsVersion,
      projectName,
      buildName,
      sessionName: `Android Tests - ${deviceName}`,
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: process.env.BROWSERSTACK_APPIUM_VERSION || '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
      idleTimeout: 300,
    },
    'appium:app': androidAppId,
    'appium:autoGrantPermissions': true,
    'appium:noReset': process.env.BROWSERSTACK_ANDROID_NO_RESET === 'true',
    'appium:automationName': process.env.BROWSERSTACK_ANDROID_AUTOMATION_NAME || 'UiAutomator2',
  })
);

// BrowserStack capabilities for iOS devices (env‑driven)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iosCapabilities: any[] = (iosDevices.length ? iosDevices : ['iPhone']).map(
  (deviceName: string) => ({
    platformName: 'iOS',
    'bstack:options': {
      deviceName,
      osVersion: iosOsVersion,
      projectName,
      buildName,
      sessionName: `iOS Tests - ${deviceName}`,
      debug: true,
      networkLogs: true,
      video: true,
      deviceLogs: true,
      appiumVersion: process.env.BROWSERSTACK_APPIUM_VERSION || '2.0.0',
      local: process.env.BROWSERSTACK_LOCAL === 'true',
      idleTimeout: 300,
    },
    'appium:app': iosAppId,
    'appium:autoAcceptAlerts': true,
    'appium:noReset': process.env.BROWSERSTACK_IOS_NO_RESET === 'true',
    'appium:automationName': process.env.BROWSERSTACK_IOS_AUTOMATION_NAME || 'XCUITest',
  })
);

// Select capabilities based on platform
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCapabilities = (): any[] => {
  // Read platform at runtime, not at config load time
  const platformArg = process.argv.find((arg) => arg.startsWith('--platform='));
  const platform = process.env.BROWSERSTACK_PLATFORM || 
                   (platformArg ? platformArg.split('=')[1] : 'android');
  
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
  ...baseConfig,

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
  specs: [path.join(rootDir, 'tests/specs/**/*.spec.ts')],

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
        // Only specify app path if uploading a new app (not using existing bs:// ID)
        // If BROWSERSTACK_APP_ID is set, the app is already uploaded and specified in capabilities
        ...(process.env.BROWSERSTACK_APP_PATH ? { app: process.env.BROWSERSTACK_APP_PATH } : {}),

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
    const platform = process.env.BROWSERSTACK_PLATFORM || 'android';
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
