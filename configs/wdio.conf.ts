import type { Options } from '@wdio/types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Base WebdriverIO Configuration
 * This configuration serves as the foundation for all platform-specific configs
 */
export const config: Options.Testrunner = {
  //
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true,
    },
  },

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: ['./tests/specs/**/*.spec.ts'],
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
    require: ['ts-node/register'],
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
        outputDir: 'allure-results',
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
        logPath: './logs/',
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
        await browser.saveScreenshot(`./reports/screenshots/${screenshotName}.png`);
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
