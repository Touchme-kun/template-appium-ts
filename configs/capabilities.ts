import type { DeviceCapability, Platform } from '../src/types/framework.types';
import { envConfig } from '../src/constants/environment';

/**
 * Device capabilities configuration
 * Provides pre-configured device capabilities for different platforms
 */
export class CapabilitiesConfig {
  /**
   * Get Android emulator capabilities
   */
  static getAndroidEmulatorCapabilities(): DeviceCapability {
    return {
      platformName: 'android',
      deviceName: envConfig.androidDeviceName,
      platformVersion: envConfig.androidPlatformVersion,
      automationName: 'UiAutomator2',
      app: envConfig.androidAppPath,
      appPackage: envConfig.androidAppPackage,
      appActivity: envConfig.androidAppActivity,
      noReset: false,
      fullReset: false,
    };
  }

  /**
   * Get iOS simulator capabilities
   */
  static getIosSimulatorCapabilities(): DeviceCapability {
    return {
      platformName: 'ios',
      deviceName: envConfig.iosDeviceName,
      platformVersion: envConfig.iosPlatformVersion,
      automationName: 'XCUITest',
      app: envConfig.iosAppPath,
      bundleId: envConfig.iosBundleId,
      noReset: false,
      fullReset: false,
    };
  }

  /**
   * Get iOS real device capabilities
   */
  static getIosRealDeviceCapabilities(): DeviceCapability {
    return {
      ...this.getIosSimulatorCapabilities(),
      udid: envConfig.iosUdid,
    };
  }

  /**
   * Get capabilities by platform
   */
  static getCapabilities(platform: Platform, isRealDevice = false): DeviceCapability {
    if (platform === 'android') {
      return this.getAndroidEmulatorCapabilities();
    }
    return isRealDevice ? this.getIosRealDeviceCapabilities() : this.getIosSimulatorCapabilities();
  }

  /**
   * Android device matrix for parallel testing
   */
  static getAndroidDeviceMatrix(): DeviceCapability[] {
    return [
      {
        platformName: 'android',
        deviceName: 'Pixel 7',
        platformVersion: '13',
        automationName: 'UiAutomator2',
        app: envConfig.androidAppPath,
        appPackage: envConfig.androidAppPackage,
        appActivity: envConfig.androidAppActivity,
        noReset: false,
        fullReset: false,
      },
      {
        platformName: 'android',
        deviceName: 'Samsung Galaxy S23',
        platformVersion: '13',
        automationName: 'UiAutomator2',
        app: envConfig.androidAppPath,
        appPackage: envConfig.androidAppPackage,
        appActivity: envConfig.androidAppActivity,
        noReset: false,
        fullReset: false,
      },
      {
        platformName: 'android',
        deviceName: 'Pixel 6',
        platformVersion: '12',
        automationName: 'UiAutomator2',
        app: envConfig.androidAppPath,
        appPackage: envConfig.androidAppPackage,
        appActivity: envConfig.androidAppActivity,
        noReset: false,
        fullReset: false,
      },
    ];
  }

  /**
   * iOS device matrix for parallel testing
   */
  static getIosDeviceMatrix(): DeviceCapability[] {
    return [
      {
        platformName: 'ios',
        deviceName: 'iPhone 15 Pro',
        platformVersion: '17',
        automationName: 'XCUITest',
        app: envConfig.iosAppPath,
        bundleId: envConfig.iosBundleId,
        noReset: false,
        fullReset: false,
      },
      {
        platformName: 'ios',
        deviceName: 'iPhone 14',
        platformVersion: '16',
        automationName: 'XCUITest',
        app: envConfig.iosAppPath,
        bundleId: envConfig.iosBundleId,
        noReset: false,
        fullReset: false,
      },
      {
        platformName: 'ios',
        deviceName: 'iPhone 13',
        platformVersion: '15',
        automationName: 'XCUITest',
        app: envConfig.iosAppPath,
        bundleId: envConfig.iosBundleId,
        noReset: false,
        fullReset: false,
      },
    ];
  }
}

export default CapabilitiesConfig;
