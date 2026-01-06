import { config as baseConfig, rootDir } from './wdio.conf';
import { browser } from '@wdio/globals';
import type { Options, Capabilities } from '@wdio/types';
import * as path from 'path';

/**
 * iOS-specific WebdriverIO Configuration
 * Extends base configuration with iOS capabilities
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  ...baseConfig,

  //
  // ==================
  // Specify Test Files
  // ==================
  specs: [
    path.join(rootDir, 'tests/specs/ios/**/*.spec.ts'),
    path.join(rootDir, 'tests/specs/**/*.spec.ts'),
  ],

  //
  // ============
  // Capabilities
  // ============
  capabilities: [
    {
      // Platform options
      platformName: 'iOS',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.0',
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 15 Pro',
      'appium:automationName': 'XCUITest',

      // App options - Use either app path or bundleId
      'appium:app': process.env.IOS_APP_PATH || path.resolve('./apps/ios/App.app'),
      // 'appium:bundleId': process.env.IOS_BUNDLE_ID || 'com.example.app',

      // Device options
      'appium:udid': process.env.IOS_UDID || undefined, // Specific device UDID or undefined for simulator

      // Appium options
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:newCommandTimeout': 240,

      // XCUITest specific options
      'appium:wdaLaunchTimeout': 120000,
      'appium:wdaConnectionTimeout': 120000,
      'appium:useNewWDA': false,
      'appium:usePrebuiltWDA': true,
      'appium:showXcodeLog': false,
      'appium:xcodeOrgId': process.env.XCODE_ORG_ID || '',
      'appium:xcodeSigningId': process.env.XCODE_SIGNING_ID || 'iPhone Developer',

      // Permissions
      'appium:autoAcceptAlerts': true,
      'appium:autoDismissAlerts': false,

      // Performance
      'appium:reduceMotion': true,
      'appium:shouldUseSingletonTestManager': false,

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
        },
        logPath: './logs/',
        command: 'appium',
      },
    ],
  ],

  //
  // ===================
  // iOS-specific Hooks
  // ===================
  before: async function () {
    console.log('iOS test session starting...');

    // Add iOS-specific setup here
    await browser.pause(3000); // Allow app to fully load (iOS apps may take longer)
  },

  afterTest: async function (test, _context, { passed }) {
    if (!passed) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = `ios_${test.title.replace(/\s+/g, '_')}_${timestamp}`;

      try {
        // Capture screenshot
        await browser.saveScreenshot(`./reports/screenshots/${screenshotName}.png`);
      } catch (e) {
        console.log('Failed to capture screenshot or logs:', e);
      }
    }
  },
};

export default config;
