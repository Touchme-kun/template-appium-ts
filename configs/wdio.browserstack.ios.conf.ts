/**
 * BrowserStack iOS Configuration
 * Runs tests/specs/ios/**\/*.spec.ts on BrowserStack iOS devices only.
 * Platform is locked to iOS — BROWSERSTACK_PLATFORM env var is intentionally ignored here.
 */

import type { Options, Capabilities } from '@wdio/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { browser } from '@wdio/globals';
import { rootDir } from './wdio.conf';

// Load env file selected by TEST_ENV (default: qa)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.TEST_ENV || 'qa'}`) });

const buildName = `iOS-${process.env.BUILD_NUMBER || new Date().toISOString().split('T')[0]}`;

const iosDevices = (process.env.BROWSERSTACK_IOS_DEVICES || 'iPhone 16 Pro Max')
  .split(',')
  .map((d) => d.trim())
  .filter((d) => d.length > 0);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const capabilities: any[] = iosDevices.map((deviceName) => ({
  platformName: 'iOS',
  'bstack:options': {
    deviceName,
    osVersion: process.env.BROWSERSTACK_IOS_OS_VERSION || process.env.IOS_PLATFORM_VERSION || '18.0',
    projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'MCash iOS Tests',
    buildName,
    sessionName: `iOS - ${deviceName}`,
    debug: true,
    networkLogs: true,
    video: true,
    deviceLogs: true,
    appiumVersion: process.env.BROWSERSTACK_APPIUM_VERSION || '2.0.0',
    local: process.env.BROWSERSTACK_LOCAL === 'true',
    localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
    idleTimeout: 300,
  },
  'appium:app': process.env.BROWSERSTACK_IOS_APP_ID,
  'appium:automationName': process.env.BROWSERSTACK_IOS_AUTOMATION_NAME || 'XCUITest',
  'appium:autoAcceptAlerts': true,
  'appium:noReset': process.env.BROWSERSTACK_IOS_NO_RESET === 'true',
}));

export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  runner: 'local',
  tsConfigPath: path.join(rootDir, 'tsconfig.json'),

  user: process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_ACCESS_KEY || process.env.BROWSERSTACK_KEY,
  hostname: 'hub.browserstack.com',

  // iOS-only spec path
  specs: [path.join(rootDir, 'tests/specs/ios/**/*.spec.ts')],
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
    require: ['ts-node/register'],
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
        ...(process.env.BROWSERSTACK_IOS_APP_PATH ? { app: process.env.BROWSERSTACK_IOS_APP_PATH } : {}),
        browserstackLocal: process.env.BROWSERSTACK_LOCAL === 'true',
        opts: {
          localIdentifier: process.env.BROWSERSTACK_LOCAL_IDENTIFIER,
          forceLocal: false,
        },
        testObservability: true,
        testObservabilityOptions: {
          projectName: process.env.BROWSERSTACK_PROJECT_NAME || 'MCash iOS Tests',
          buildName,
        },
      },
    ],
  ],

  before: async function (_capabilities, specs) {
    console.log(`[BrowserStack iOS] Build: ${buildName}`);
    console.log(`[BrowserStack iOS] Spec: ${specs[0]}`);
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
          `./reports/screenshots/bs_ios_${test.title.replace(/\s+/g, '_')}_${ts}.png`
        );
      } catch {
        // non-fatal
      }
    }
  },

  onComplete: function (exitCode) {
    console.log('========================================');
    console.log('BrowserStack iOS Test Execution Complete');
    console.log(`Build: ${buildName}`);
    console.log(`Exit Code: ${exitCode}`);
    console.log('View results at: https://app-automate.browserstack.com/dashboard');
    console.log('========================================');
  },
};

export default config;
