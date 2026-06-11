import { config as baseConfig } from './wdio.conf';
import type { Options, Capabilities } from '@wdio/types';

/**
 * Docker-specific WebdriverIO Configuration
 * For running tests inside Docker containers with external Appium server
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  ...baseConfig,

  //
  // ====================
  // Appium Configuration (external service)
  // ====================
  hostname: process.env.APPIUM_HOST || 'appium',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',

  //
  // ============
  // Capabilities
  // ============
  capabilities: [
    {
      platformName: process.env.PLATFORM || 'Android',
      'appium:platformVersion': process.env.PLATFORM_VERSION || '13',
      'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
      'appium:automationName': 'UiAutomator2',
      'appium:app': process.env.APP_PATH || '/app/apps/android/app-release.apk',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:uiautomator2ServerInstallTimeout': 60000,
    },
  ],

  //
  // ========
  // Services
  // ========
  // Don't start Appium service - it's running externally in Docker
  services: [],

  //
  // =============
  // Test Settings
  // =============
  logLevel: (process.env.LOG_LEVEL as Options.WebDriverLogTypes) || 'warn',
  outputDir: './logs',

  //
  // =====
  // Hooks
  // =====
  onPrepare: function () {
    console.log('========================================');
    console.log('Starting Docker-based Test Execution');
    console.log(`Appium Server: ${process.env.APPIUM_HOST}:${process.env.APPIUM_PORT}`);
    console.log(`Platform: ${process.env.PLATFORM || 'Android'}`);
    console.log(`Environment: ${process.env.TEST_ENV || 'docker'}`);
    console.log('========================================');
  },

  before: async function () {
    const { Logger } = await import('../src/utils/Logger');
    Logger.info('Test session starting in Docker environment...');
    Logger.info(`Appium server: ${process.env.APPIUM_HOST}:${process.env.APPIUM_PORT}`);
  },

  onComplete: function (exitCode) {
    console.log('========================================');
    console.log('Docker Test Execution Complete');
    console.log(`Exit Code: ${exitCode}`);
    console.log('========================================');
  },
};

export default config;
