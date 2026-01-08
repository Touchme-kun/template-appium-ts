/**
 * WebdriverIO Cucumber Configuration
 * BDD test execution with Cucumber framework
 */

import type { Options, Capabilities } from '@wdio/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { rootDir } from './wdio.conf';

// Load environment variables
dotenv.config();

/**
 * Get tag expression from command line or environment
 * Usage: npm run test:cucumber -- --cucumberOpts.tagExpression="@smoke"
 * Or set CUCUMBER_TAGS environment variable
 */
const getTagExpression = (): string => {
  return process.env.CUCUMBER_TAGS || '';
};

/**
 * Cucumber Configuration for BDD Testing
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
  specs: [path.join(rootDir, 'tests/features/**/*.feature')],
  exclude: [],

  //
  // ============
  // Capabilities
  // ============
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14',
      'appium:app': process.env.ANDROID_APP_PATH || path.join(rootDir, 'apps/android/app-debug.apk'),
      'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.example.app',
      'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || '.MainActivity',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 300,
    } as Capabilities.AppiumCapabilities,
  ],

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
    // Feature file location
    require: [
      path.join(rootDir, 'tests/features/step-definitions/**/*.ts'),
      path.join(rootDir, 'tests/features/support/**/*.ts'),
    ],
    // <boolean> show full backtrace for errors
    backtrace: false,
    // <string[]> module(s) to require before loading support files
    requireModule: [],
    // <boolean> stop on first failing scenario
    failFast: false,
    // <boolean> print snippets for pending steps
    snippets: true,
    // <boolean> print each feature file being parsed
    source: true,
    // <boolean> fail if there are pending or undefined steps
    strict: false,
    // <string> tag expression to filter scenarios
    tagExpression: getTagExpression(),
    // <number> timeout for step definitions (ms)
    timeout: 120000,
    // <boolean> ignore undefined step definitions
    ignoreUndefinedDefinitions: false,
    // <string[]> names of scenarios to run
    name: [],
    // <boolean> add cucumber specific Allure reporting
    // scenarioLevelReporter: false,
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
        useCucumberStepReporter: true, // Enable for BDD
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
          logLevel: 'info',
        },
        logPath: path.join(rootDir, 'logs'),
        command: 'appium',
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
  onPrepare: function (config, capabilities) {
    console.log('\n🥒 Starting Cucumber BDD Tests');
    console.log('================================');
    console.log(`Tag Expression: ${getTagExpression() || '(all scenarios)'}`);
    console.log(`Feature Files: ${config.specs}`);
    console.log('================================\n');
  },

  /**
   * Gets executed before a worker process is spawned
   */
  onWorkerStart: function (cid, caps, specs, args, execArgv) {
    console.log(`Worker ${cid} starting with specs: ${specs.join(', ')}`);
  },

  /**
   * Gets executed after all workers have shut down
   */
  onComplete: function (exitCode, config, capabilities, results) {
    console.log('\n================================');
    console.log('🥒 Cucumber BDD Tests Complete');
    console.log(`Exit Code: ${exitCode}`);
    if (results) {
      console.log(`Passed: ${results.passed || 0}`);
      console.log(`Failed: ${results.failed || 0}`);
    }
    console.log('================================\n');
  },
};

export default config;
