// Framework type definitions

/**
 * Platform types supported by the framework
 */
export type Platform = 'android' | 'ios';

/**
 * Environment configuration
 */
export type Environment = 'dev' | 'staging' | 'qa' | 'preprod' | 'prod';

/**
 * Test execution context
 */
export interface TestContext {
  platform: Platform;
  environment: Environment;
  deviceName: string;
  platformVersion: string;
  appPath?: string;
  sessionId?: string;
}

/**
 * User data for test scenarios
 */
export interface User {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Element locator strategy
 */
export interface Locator {
  android: string;
  ios: string;
  description?: string;
}

/**
 * Gesture configuration
 */
export interface SwipeOptions {
  startPercentage?: number;
  endPercentage?: number;
  duration?: number;
}

/**
 * Wait options
 */
export interface WaitOptions {
  timeout?: number;
  interval?: number;
  timeoutMsg?: string;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  name: string;
  fullPage?: boolean;
  attachToAllure?: boolean;
}

/**
 * Logger metadata
 */
export interface LogMetadata {
  testName?: string;
  stepName?: string;
  platform?: Platform;
  [key: string]: unknown;
}

/**
 * BrowserStack options
 */
export interface BrowserStackOptions {
  projectName: string;
  buildName: string;
  sessionName: string;
  debug?: boolean;
  networkLogs?: boolean;
  video?: boolean;
  deviceLogs?: boolean;
}

/**
 * Device capability
 */
export interface DeviceCapability {
  deviceName: string;
  platformName: Platform;
  platformVersion: string;
  automationName: string;
  app?: string;
  appPackage?: string;
  appActivity?: string;
  bundleId?: string;
  udid?: string;
  noReset?: boolean;
  fullReset?: boolean;
}
