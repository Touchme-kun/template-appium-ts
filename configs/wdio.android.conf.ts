import { config as baseConfig, rootDir } from './wdio.conf';
import { browser } from '@wdio/globals';
import type { Options, Capabilities } from '@wdio/types';
import * as path from 'path';
import { Logger } from '../src/utils/Logger';

/**
 * Android-specific WebdriverIO Configuration
 * Extends base configuration with Android capabilities
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  ...baseConfig,

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [
    path.join(rootDir, 'tests/specs/android/**/*.spec.ts'),
    path.join(rootDir, 'tests/specs/**/*.spec.ts'),
  ],

  //
  // ============
  // Capabilities
  // ============
  capabilities: [
    {
      // Platform options
      platformName: 'Android',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '16',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Pixel_7_API_33',
      'appium:automationName': 'UiAutomator2',

      // App options
      'appium:app': process.env.ANDROID_APP_PATH || path.resolve('./apps/android/app-debug.apk'),
      'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.example.app',
      'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || 'com.example.app.MainActivity',

      // Appium options
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,
      'appium:androidInstallTimeout': 120000,
      'appium:adbExecTimeout': 60000,

      // Performance options
      'appium:skipDeviceInitialization': false,
      'appium:skipServerInstallation': false,

      // Chrome/WebView options (for hybrid apps)
      'appium:chromedriverAutodownload': true,
      'appium:autoWebview': false,

      // Logging
      'appium:enablePerformanceLogging': false, // -> disable for logcat noise

      // Wait options
      'wdio:maxInstances': 1,
    } as WebdriverIO.Capabilities,
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
          address: process.env.APPIUM_HOST || '127.0.0.1',
          port: parseInt(process.env.APPIUM_PORT || '4723', 10),
          relaxedSecurity: true,
          allowInsecure: ['chromedriver_autodownload'],
        },
        logPath: './logs/',
        command: 'appium',
      },
    ],
  ],

  //
  // ===================
  // Android-specific Hooks
  // ===================
  before: async function () {
    // Wait for app to be ready
    Logger.info('Android test session starting...');
    await browser.hideKeyboard();

    // Add Android-specific setup here
    await browser.pause(2000); // Allow app to fully load
  },

  afterTest: async function (test, _context, { passed }) {
    if (!passed) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `android_${test.title.replace(/\s+/g, '_')}_${timestamp}`;

      try {
        // Capture screenshot
        await browser.saveScreenshot(`./reports/screenshots/${screenshotName}.png`);

        // Capture logcat for debugging
        // const logs = await browser.getLogs('logcat');
        // Logger.debug('Logcat entries:', logs.length);
      } catch (e) {
        Logger.error('Failed to capture screenshot or logs:', e as Error);
      }
    }
  },
};

export default config;
