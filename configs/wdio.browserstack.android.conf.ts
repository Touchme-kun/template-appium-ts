/**
 * BrowserStack Android Configuration
 * Runs tests/specs/android/**\/*.spec.ts on BrowserStack Android devices only.
 * Use BROWSERSTACK_PLATFORM env var is intentionally ignored here — platform is locked to Android.
 */

import type { Options, Capabilities } from '@wdio/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { browser } from '@wdio/globals';
import { rootDir } from './wdio.conf';

// Load env file selected by TEST_ENV (default: qa)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.TEST_ENV || 'qa'}`) });

const buildName = `Android-${process.env.BUILD_NUMBER || new Date().toISOString().split('T')[0]}`;

const androidDevices = (process.env.BROWSERSTACK_ANDROID_DEVICES || 'Samsung Galaxy S23')
  .split(',')
  .map((d) => d.trim())
  .filter((d) => d.length > 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBrowserStackLocal = process.env.BROWSERSTACK_LOCAL === 'true';
const capabilities: any[] = androidDevices.map((deviceName) => ({
  platformName: 'Android',
  'bstack:options': {
    deviceName,
    osVersion: process.env.BROWSERSTACK_ANDROID_OS_VERSION || '13.0',
    projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'MCash Android Tests',
    buildName,
    sessionName: `Android - ${deviceName}`,
    debug: true,
    networkLogs: true,
    video: true,
    deviceLogs: true,
    appiumVersion: process.env.BROWSERSTACK_APPIUM_VERSION || '2.0.0',
    local: isBrowserStackLocal,
    ...(isBrowserStackLocal && { localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER }),
    idleTimeout: 300,
  },
  'appium:app': process.env.BROWSERSTACK_APP_ID,
  'appium:automationName': process.env.BROWSERSTACK_ANDROID_AUTOMATION_NAME || 'UiAutomator2',
  'appium:autoGrantPermissions': true,
  'appium:noReset': process.env.BROWSERSTACK_ANDROID_NO_RESET === 'true',
}));

export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  runner: 'local',
  tsConfigPath: path.join(rootDir, 'tsconfig.json'),

  user: process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_ACCESS_KEY || process.env.BROWSERSTACK_KEY,
  hostname: 'hub.browserstack.com',

  // Android-only spec path
  specs: [path.join(rootDir, 'tests/specs/android/**/*.spec.ts')],
  exclude: [],

  maxInstances: 5,
  capabilities,

  logLevel: (process.env.LOG_LEVEL as Options.WebDriverLogTypes) || 'warn',
  bail: 0,
  baseUrl: process.env.BASE_URL || '',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    // require: ['ts-node/register'],
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.join(rootDir, 'allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
        addConsoleLogs: true,
      },
    ],
  ],

  services: [
    [
      'browserstack',
      {
        ...(process.env.BROWSERSTACK_APP_PATH ? { app: process.env.BROWSERSTACK_APP_PATH } : {}),
        browserstackLocal: isBrowserStackLocal,
        opts: {
          ...(isBrowserStackLocal && { localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER }),
          forceLocal: false,
        },
        testObservability: true,
        testObservabilityOptions: {
          projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'MCash Android Tests',
          buildName,
        },
      },
    ],
  ],

  before: async function (_capabilities, specs) {
    console.log(`[BrowserStack Android] Build: ${buildName}`);
    console.log(`[BrowserStack Android] Spec: ${specs[0]}`);
    await browser.executeScript(
      `browserstack_executor: {"action": "setSessionName", "arguments": {"name": "${path.basename(specs[0])}"}}`,
      []
    );
  },

  afterTest: async function (test, _context, { passed }) {
    const status = passed ? 'passed' : 'failed';
    try {
      await browser.executeScript(
        `browserstack_executor: {"action": "setSessionStatus", "arguments": {"status": "${status}", "reason": ""}}`,
        []
      );
    } catch {
      // non-fatal
    }
    if (!passed) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      try {
        await browser.saveScreenshot(
          `./reports/screenshots/bs_android_${test.title.replace(/\s+/g, '_')}_${ts}.png`
        );
      } catch {
        // non-fatal
      }
    }
  },

  onComplete: function (exitCode) {
    console.log('========================================');
    console.log('BrowserStack Android Test Execution Complete');
    console.log(`Build: ${buildName}`);
    console.log(`Exit Code: ${exitCode}`);
    console.log('View results at: https://app-automate.browserstack.com/dashboard');
    console.log('========================================');
  },
};

export default config;
