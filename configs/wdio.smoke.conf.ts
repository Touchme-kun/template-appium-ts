import { config as baseConfig, rootDir } from './wdio.conf';
import type { Options, Capabilities } from '@wdio/types';
import * as path from 'path';

/**
 * Smoke Test Configuration
 * Uses Android Settings app (pre-installed) - no APK required
 */
export const config: Options.Testrunner & { capabilities: Capabilities.TestrunnerCapabilities } = {
  ...baseConfig,

  specs: [path.join(rootDir, 'tests/specs/smoke.spec.ts')],

  capabilities: [
    {
      platformName: 'Android',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13',
      'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
      'appium:automationName': 'UiAutomator2',
      
      // Use pre-installed Settings app (no APK needed!)
      'appium:appPackage': 'com.android.settings',
      'appium:appActivity': 'com.android.settings.Settings',
      
      'appium:noReset': true,
      'appium:newCommandTimeout': 240,
    } as WebdriverIO.Capabilities,
  ],
};

export default config;
