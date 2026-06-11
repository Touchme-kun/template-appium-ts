import type { Options, Capabilities } from '@wdio/types';
import { browser } from '@wdio/globals';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../src/utils/Logger';

// Load environment variables — TEST_ENV selects the file (e.g. TEST_ENV=qa → .env.qa)
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.TEST_ENV || 'qa'}`) });

// Root directory (one level up from configs/)
export const rootDir = path.resolve(__dirname, '..');

/**
 * Base WebdriverIO Configuration
 * This configuration serves as the foundation for all platform-specific configs
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  // ====================
  // Runner Configuration
  // ====================
  runner: 'local',
  tsConfigPath: path.join(rootDir, 'tsconfig.json'),

  // ==================
  // Specify Test Files
  // ==================
  specs: [path.join(rootDir, 'src/tests/specs/**/*.spec.ts')],
  exclude: [],

  // =====================
  // Target Suite Mappings
  // =====================
  suites: {
    smoke: [
      path.join(rootDir, 'src/tests/specs/android/smoke.android.spec.ts')
    ],
    regression: [
      path.join(rootDir, 'src/tests/specs/android/regression.android.spec.ts')
    ],
    e2e: [
      path.join(rootDir, 'src/tests/specs/android/e2e.android.spec.ts')
    ]
  },

  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [],

  // ===================
  // Test Configurations
  // ===================
  logLevel: (process.env.LOG_LEVEL as Options.WebDriverLogTypes) || 'info',
  bail: 0,
  baseUrl: process.env.BASE_URL || '',
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // ==============
  // Test Framework
  // ==============
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  // =========
  // Reporters
  // =========
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.join(rootDir, 'allure-results'),
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
        addConsoleLogs: true,
        disableMochaHooks: false,
      },
    ],
  ],

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
        logPath: path.join(rootDir, 'log'), // Standardized directory mapping
      },
    ],
  ],

  // =====
  // Hooks
  // =====
  /**
   * Gets executed once before all workers get launched.
   */
  onPrepare: function () {
    Logger.info('========================================');
    Logger.info('Starting Mobile Automation Test Suite');
    Logger.info(`Timestamp: ${new Date().toISOString()}`);
    Logger.info('========================================');

    // Ensure screenshots directory exists
    const screenshotsDir = path.join(rootDir, 'reports', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Copy categories.json to allure-results if it exists
    const categoriesSource = path.join(rootDir, 'allure-results', 'categories.json');
    if (fs.existsSync(categoriesSource)) {
      Logger.info('Allure categories.json found and ready');
    }
  },

  /**
   * Gets executed before a worker process is spawned
   */
  onWorkerStart: function (cid, _caps, specs) {
    Logger.info(`Worker ${cid} starting for specs: ${specs}`);
  },

  /**
   * Gets executed before test execution begins
   */
  before: async function () {
    const { Logger } = await import('../src/utils/Logger');
    const { AllureReporter } = await import('../src/utils/AllureReporter');

    // Initialize reporting
    AllureReporter.initialize();
    
    Logger.info('Test session starting...');
    Logger.info(`Run ID: ${Logger.getRunId()}`);

    // Add device and environment info to Allure
    await AllureReporter.addDeviceInfo();
    await AllureReporter.writeEnvironmentProperties();
  },

  /**
   * Runs before a test
   */
  beforeTest: async function (test) {
    const { Logger } = await import('../src/utils/Logger');
    const { AllureReporter } = await import('../src/utils/AllureReporter');
    const { DeviceLogsHelper } = await import('../src/utils/DeviceLogsHelper');

    Logger.testStart(test.title);
    AllureReporter.markTestStart();

    // Clear device logs to get fresh logs for this test
    await DeviceLogsHelper.clearLogs();
  },

  /**
   * Hook that gets executed after a test
   */
  afterTest: async function (test, _context, { passed, error, duration }) {
    const { Logger } = await import('../src/utils/Logger');
    const { AllureReporter } = await import('../src/utils/AllureReporter');
    const { DeviceLogsHelper } = await import('../src/utils/DeviceLogsHelper');

    Logger.testEnd(test.title, passed, duration);

    // On failure, capture all debugging artifacts
    if (!passed) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedTitle = test.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

      try {
        // Capture screenshot
        const screenshotPath = path.join(
          rootDir,
          'reports',
          'screenshots',
          `${sanitizedTitle}_${timestamp}.png`
        );
        await browser.saveScreenshot(screenshotPath);
        Logger.screenshot(test.title, screenshotPath);

        // Also add screenshot to Allure
        await AllureReporter.captureScreenshot(`${test.title}_failure`);

        // Capture device logs
        await DeviceLogsHelper.captureAndAttach('Device Logs on Failure');

        // Capture page source
        await AllureReporter.addPageSource('Page Source on Failure');

        // Add failure categorization
        if (error) {
          const category = AllureReporter.categorizeFailure(error);
          AllureReporter.addFailureAnalysis(error, category);
          Logger.error(`Test failed: ${test.title}`, error);
        }
      } catch (captureError) {
        Logger.error('Failed to capture failure artifacts', captureError as Error);
      }
    }

    AllureReporter.addExecutionTime();
  },

  /**
   * Hook that gets executed after a test suite
   */
  afterSuite: async function (suite) {
    const { Logger } = await import('../src/utils/Logger');
    Logger.suiteEnd(suite.title || 'Unknown Suite', 0, 0, 0);
  },

  /**
   * Gets executed after all tests are done
   */
  after: async function () {
    const { Logger } = await import('../src/utils/Logger');
    const { AllureReporter } = await import('../src/utils/AllureReporter');

    Logger.logPerformanceSummary();

    // Attach full test run logs to Allure
    const runLogs = Logger.getCurrentRunLogs();
    if (runLogs) {
      AllureReporter.addAttachment('Full Test Run Logs', runLogs, 'text/plain');
    }

    Logger.info('Test session completed.');
  },

  /**
   * Gets executed after all workers got shut down
   */
  onComplete: function (exitCode) {
    Logger.info('========================================');
    Logger.info('Test Suite Execution Complete');
    Logger.info(`Exit Code: ${exitCode}`);
    Logger.info(`Timestamp: ${new Date().toISOString()}`);
    Logger.info('========================================');
    Logger.info('Run "npm run allure:generate" to generate Allure report');
    Logger.info('Run "npm run allure:open" to view the report');
  }
};

export default config;