import type { Options, Capabilities } from '@wdio/types';
import { browser } from '@wdio/globals';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Root directory (one level up from configs/)
export const rootDir = path.resolve(__dirname, '..');

/**
 * Base WebdriverIO Configuration
 * This configuration serves as the foundation for all platform-specific configs
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  tsConfigPath: path.join(rootDir, 'tsconfig.json'),

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [path.join(rootDir, 'tests/specs/**/*.spec.ts')],
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [],

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
  // ==============
  // Test Framework
  // ==============
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    // Note: ts-node/register not needed in WDIO v9 - uses tsx internally
  },

  //
  // ===================
  // Cucumber Framework (alternative)
  // ===================
  // Uncomment to use Cucumber instead of Mocha
  // framework: 'cucumber',
  // cucumberOpts: {
  //   require: ['./tests/features/step-definitions/**/*.ts'],
  //   backtrace: false,
  //   requireModule: ['ts-node/register'],
  //   dryRun: false,
  //   failFast: false,
  //   snippets: true,
  //   source: true,
  //   strict: false,
  //   tagExpression: '',
  //   timeout: 120000,
  //   ignoreUndefinedDefinitions: false,
  // },

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
        useCucumberStepReporter: false,
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
      'appium',
      {
        args: {
          address: '127.0.0.1',
          port: 4723,
          relaxedSecurity: true,
          allowInsecure: ['chromedriver_autodownload'],
        },
        logPath: path.join(rootDir, 'logs'),
      },
    ],
  ],

  //
  // =====
  // Hooks
  // =====
  /**
   * Gets executed once before all workers get launched.
   */
  onPrepare: function () {
    console.log('========================================');
    console.log('Starting Mobile Automation Test Suite');
    console.log('========================================');
  },

  /**
   * Gets executed before a worker process is spawned
   */
  onWorkerStart: function (cid, _caps, specs) {
    console.log(`Worker ${cid} starting for specs: ${specs}`);
  },

  /**
   * Gets executed before test execution begins
   */
  before: async function () {
    // Add custom commands or setup here
    console.log('Test session starting...');
  },

  /**
   * Runs before a test
   */
  beforeTest: async function (test) {
    console.log(`Running test: ${test.title}`);
  },

  /**
   * Hook that gets executed after a test
   */
  afterTest: async function (test, _context, { passed }) {
    // Take screenshot on failure
    if (!passed) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `${test.title.replace(/\s+/g, '_')}_${timestamp}`;
      
      try {
        const screenshotPath = path.join(rootDir, 'reports', 'screenshots', `${screenshotName}.png`);
        await browser.saveScreenshot(screenshotPath);
        console.log(`Screenshot saved: ${screenshotName}.png`);
      } catch (e) {
        console.log('Failed to capture screenshot:', e);
      }
    }
  },

  /**
   * Gets executed after all tests are done
   */
  after: async function () {
    console.log('Test session completed.');
  },

  /**
   * Gets executed after all workers got shut down
   */
  onComplete: function (exitCode) {
    console.log('========================================');
    console.log('Test Suite Execution Complete');
    console.log(`Exit Code: ${exitCode}`);
    console.log('========================================');
  },

  /**
   * Cucumber specific hooks
   */
  // beforeFeature: async function (uri, feature) {},
  // beforeScenario: async function (world, context) {},
  // beforeStep: async function (step, scenario, context) {},
  // afterStep: async function (step, scenario, result, context) {},
  // afterScenario: async function (world, result, context) {},
  // afterFeature: async function (uri, feature) {},
};

export default config;
