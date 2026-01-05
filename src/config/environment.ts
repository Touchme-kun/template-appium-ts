import * as dotenv from 'dotenv';
import * as path from 'path';
import type { Environment, Platform } from '../types/framework.types';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment configuration manager
 * Provides type-safe access to environment variables
 */
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  private constructor() {
    // Validate required environment variables on instantiation
    this.validateRequiredVars();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Validate required environment variables
   */
  private validateRequiredVars(): void {
    const warnings: string[] = [];

    // Check BrowserStack credentials if running on cloud
    if (this.isCloudExecution) {
      if (!process.env.BROWSERSTACK_USERNAME) {
        warnings.push('BROWSERSTACK_USERNAME is not set');
      }
      if (!process.env.BROWSERSTACK_ACCESS_KEY) {
        warnings.push('BROWSERSTACK_ACCESS_KEY is not set');
      }
    }

    if (warnings.length > 0) {
      console.warn('Environment Configuration Warnings:');
      warnings.forEach((w) => console.warn(`  - ${w}`));
    }
  }

  // ===========================================
  // General Settings
  // ===========================================

  get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get logLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }

  get baseUrl(): string {
    return process.env.BASE_URL || '';
  }

  get testEnvironment(): Environment {
    return (process.env.TEST_ENVIRONMENT as Environment) || 'staging';
  }

  // ===========================================
  // Appium Configuration
  // ===========================================

  get appiumHost(): string {
    return process.env.APPIUM_HOST || '127.0.0.1';
  }

  get appiumPort(): number {
    return parseInt(process.env.APPIUM_PORT || '4723', 10);
  }

  get appiumUrl(): string {
    return `http://${this.appiumHost}:${this.appiumPort}`;
  }

  // ===========================================
  // Android Configuration
  // ===========================================

  get androidDeviceName(): string {
    return process.env.ANDROID_DEVICE_NAME || 'Pixel_7_API_33';
  }

  get androidPlatformVersion(): string {
    return process.env.ANDROID_PLATFORM_VERSION || '13';
  }

  get androidAppPath(): string {
    return process.env.ANDROID_APP_PATH || './apps/android/app-debug.apk';
  }

  get androidAppPackage(): string {
    return process.env.ANDROID_APP_PACKAGE || 'com.example.app';
  }

  get androidAppActivity(): string {
    return process.env.ANDROID_APP_ACTIVITY || 'com.example.app.MainActivity';
  }

  // ===========================================
  // iOS Configuration
  // ===========================================

  get iosDeviceName(): string {
    return process.env.IOS_DEVICE_NAME || 'iPhone 15 Pro';
  }

  get iosPlatformVersion(): string {
    return process.env.IOS_PLATFORM_VERSION || '17.0';
  }

  get iosAppPath(): string {
    return process.env.IOS_APP_PATH || './apps/ios/App.app';
  }

  get iosBundleId(): string {
    return process.env.IOS_BUNDLE_ID || 'com.example.app';
  }

  get iosUdid(): string | undefined {
    return process.env.IOS_UDID || undefined;
  }

  get xcodeOrgId(): string {
    return process.env.XCODE_ORG_ID || '';
  }

  get xcodeSigningId(): string {
    return process.env.XCODE_SIGNING_ID || 'iPhone Developer';
  }

  // ===========================================
  // BrowserStack Configuration
  // ===========================================

  get browserStackUsername(): string {
    return process.env.BROWSERSTACK_USERNAME || '';
  }

  get browserStackAccessKey(): string {
    return process.env.BROWSERSTACK_ACCESS_KEY || '';
  }

  get browserStackAppId(): string {
    return process.env.BROWSERSTACK_APP_ID || '';
  }

  get browserStackIosAppId(): string {
    return process.env.BROWSERSTACK_IOS_APP_ID || '';
  }

  get browserStackLocal(): boolean {
    return process.env.BROWSERSTACK_LOCAL === 'true';
  }

  get browserStackLocalIdentifier(): string | undefined {
    return process.env.BROWSERSTACK_LOCAL_IDENTIFIER || undefined;
  }

  get isCloudExecution(): boolean {
    return !!process.env.BROWSERSTACK_USERNAME;
  }

  // ===========================================
  // CI/CD Configuration
  // ===========================================

  get buildNumber(): string {
    return process.env.BUILD_NUMBER || 'local';
  }

  get isCI(): boolean {
    return process.env.CI === 'true';
  }

  // ===========================================
  // Reporting & Notifications
  // ===========================================

  get allureResultsDir(): string {
    return process.env.ALLURE_RESULTS_DIR || './allure-results';
  }

  get slackWebhook(): string | undefined {
    return process.env.SLACK_WEBHOOK || undefined;
  }

  get emailNotifications(): boolean {
    return process.env.EMAIL_NOTIFICATIONS === 'true';
  }

  // ===========================================
  // Test Data
  // ===========================================

  get testUserEmail(): string {
    return process.env.TEST_USER_EMAIL || 'testuser@example.com';
  }

  get testUserPassword(): string {
    return process.env.TEST_USER_PASSWORD || 'SecurePass123';
  }

  // ===========================================
  // Debug Settings
  // ===========================================

  get debugMode(): boolean {
    return process.env.DEBUG_MODE === 'true';
  }

  get captureScreenshots(): boolean {
    return process.env.CAPTURE_SCREENSHOTS !== 'false';
  }

  get captureVideo(): boolean {
    return process.env.CAPTURE_VIDEO === 'true';
  }

  // ===========================================
  // Utility Methods
  // ===========================================

  /**
   * Get platform-specific app path
   */
  getAppPath(platform: Platform): string {
    return platform === 'android' ? this.androidAppPath : this.iosAppPath;
  }

  /**
   * Get platform-specific device name
   */
  getDeviceName(platform: Platform): string {
    return platform === 'android' ? this.androidDeviceName : this.iosDeviceName;
  }

  /**
   * Get platform-specific platform version
   */
  getPlatformVersion(platform: Platform): string {
    return platform === 'android' ? this.androidPlatformVersion : this.iosPlatformVersion;
  }

  /**
   * Get environment-specific API URL
   */
  getApiUrl(): string {
    const urls: Record<Environment, string> = {
      dev: 'https://api.dev.example.com',
      staging: 'https://api.staging.example.com',
      prod: 'https://api.example.com',
    };
    return urls[this.testEnvironment];
  }

  /**
   * Print current configuration (masked secrets)
   */
  printConfig(): void {
    console.log('Current Environment Configuration:');
    console.log('==================================');
    console.log(`Environment: ${this.testEnvironment}`);
    console.log(`Node Env: ${this.nodeEnv}`);
    console.log(`Log Level: ${this.logLevel}`);
    console.log(`Appium URL: ${this.appiumUrl}`);
    console.log(`Cloud Execution: ${this.isCloudExecution}`);
    console.log(`CI Mode: ${this.isCI}`);
    console.log(`Build Number: ${this.buildNumber}`);
    console.log('==================================');
  }
}

// Export singleton instance
export const envConfig = EnvironmentConfig.getInstance();

// Export for direct use
export default envConfig;
