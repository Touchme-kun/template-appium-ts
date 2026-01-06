/**
 * BaseTest - Foundation class for all test classes
 * Provides setup/teardown, test context management, and session handling
 */

import { browser } from '@wdio/globals';
import { Logger } from '../utils/Logger';
import { AllureReporter } from '../utils/AllureReporter';

const env = {
  environment: process.env.TEST_ENV || 'development',
  appiumUrl: `http://${process.env.APPIUM_HOST || 'localhost'}:${process.env.APPIUM_PORT || '4723'}`
};

export interface TestContext {
  testName: string;
  suiteName: string;
  platform: 'android' | 'ios';
  startTime: Date;
  testData: Record<string, unknown>;
}

export interface AppInfo {
  appPackage?: string;
  appActivity?: string;
  bundleId?: string;
}

export class BaseTest {
  protected static context: TestContext;
  protected static sessionId: string | null = null;

  /**
   * Initialize test suite - call in before() hook
   */
  static async initializeSuite(suiteName: string): Promise<void> {
    Logger.info(`Initializing test suite: ${suiteName}`);
    
    // Add environment info to Allure
    AllureReporter.addEnvironmentInfo({
      'Environment': env.environment,
      'Platform': this.getPlatform(),
      'Appium URL': env.appiumUrl,
    });

    Logger.info(`Test suite "${suiteName}" initialized successfully`);
  }

  /**
   * Setup before each test - call in beforeEach() hook
   */
  static async setupTest(testName: string, suiteName: string = 'Default Suite'): Promise<void> {
    const platform = this.getPlatform();
    
    this.context = {
      testName,
      suiteName,
      platform,
      startTime: new Date(),
      testData: {},
    };

    Logger.setTestContext(testName);
    Logger.info(`Starting test: ${testName}`);
    Logger.info(`Platform: ${platform}`);

    // Store session ID
    if (browser.sessionId) {
      this.sessionId = browser.sessionId;
      Logger.debug(`Session ID: ${this.sessionId}`);
    }

    // Add test info to Allure
    AllureReporter.addFeature(suiteName);
    AllureReporter.addStory(testName);

    // Add device info
    await AllureReporter.addDeviceInfo();
  }

  /**
   * Teardown after each test - call in afterEach() hook
   */
  static async teardownTest(testPassed: boolean): Promise<void> {
    const duration = this.getTestDuration();
    
    if (!testPassed) {
      Logger.error(`Test failed: ${this.context?.testName}`);
      
      // Capture screenshot on failure
      await AllureReporter.captureScreenshot('Failure Screenshot');
      
      // Capture page source for debugging
      try {
        const pageSource = await browser.getPageSource();
        AllureReporter.addAttachment(
          'Page Source',
          pageSource,
          'application/xml'
        );
      } catch (error) {
        Logger.warn('Could not capture page source');
      }
    } else {
      Logger.info(`Test passed: ${this.context?.testName}`);
    }

    Logger.info(`Test duration: ${duration}ms`);
    this.context = null as unknown as TestContext;
  }

  /**
   * Cleanup after test suite - call in after() hook
   */
  static async cleanupSuite(suiteName: string): Promise<void> {
    Logger.info(`Cleaning up test suite: ${suiteName}`);
    
    try {
      // Close any open sessions
      if (browser.sessionId) {
        await browser.deleteSession();
        Logger.info('Browser session closed');
      }
    } catch (error) {
      Logger.warn('Error closing browser session', error as Error);
    }

    Logger.info(`Test suite "${suiteName}" cleanup completed`);
  }

  /**
   * Get current platform (android or ios)
   */
  static getPlatform(): 'android' | 'ios' {
    try {
      const caps = browser.capabilities as Record<string, unknown>;
      const platformName = (caps.platformName as string || '').toLowerCase();
      return platformName === 'ios' ? 'ios' : 'android';
    } catch {
      return 'android'; // Default to Android
    }
  }

  /**
   * Check if running on Android
   */
  static isAndroid(): boolean {
    return this.getPlatform() === 'android';
  }

  /**
   * Check if running on iOS
   */
  static isIOS(): boolean {
    return this.getPlatform() === 'ios';
  }

  /**
   * Get test duration in milliseconds
   */
  static getTestDuration(): number {
    if (!this.context?.startTime) return 0;
    return new Date().getTime() - this.context.startTime.getTime();
  }

  /**
   * Store data in test context
   */
  static setTestData(key: string, value: unknown): void {
    if (this.context) {
      this.context.testData[key] = value;
    }
  }

  /**
   * Retrieve data from test context
   */
  static getTestData<T>(key: string): T | undefined {
    return this.context?.testData[key] as T;
  }

  /**
   * Reset app state without reinstalling
   */
  static async resetApp(): Promise<void> {
    Logger.info('Resetting app state');
    try {
      await browser.execute('mobile: terminateApp', { 
        bundleId: this.getAppIdentifier() 
      });
      await browser.pause(1000);
      await browser.execute('mobile: activateApp', { 
        bundleId: this.getAppIdentifier() 
      });
      Logger.info('App reset completed');
    } catch (error) {
      Logger.warn('Could not reset app, attempting relaunch', error as Error);
      await this.relaunchApp();
    }
  }

  /**
   * Relaunch the application
   */
  static async relaunchApp(): Promise<void> {
    Logger.info('Relaunching app');
    try {
      await browser.reloadSession();
      Logger.info('App relaunched successfully');
    } catch (error) {
      Logger.error('Failed to relaunch app', error as Error);
      throw error;
    }
  }

  /**
   * Close the application
   */
  static async closeApp(): Promise<void> {
    Logger.info('Closing app');
    try {
      await browser.execute('mobile: terminateApp', { 
        bundleId: this.getAppIdentifier() 
      });
      Logger.info('App closed successfully');
    } catch (error) {
      Logger.warn('Could not close app gracefully', error as Error);
    }
  }

  /**
   * Get app identifier (package name or bundle ID)
   */
  static getAppIdentifier(): string {
    const caps = browser.capabilities as Record<string, unknown>;
    
    if (this.isIOS()) {
      return (caps.bundleId || caps['appium:bundleId'] || '') as string;
    }
    
    return (caps.appPackage || caps['appium:appPackage'] || '') as string;
  }

  /**
   * Take screenshot with custom name
   */
  static async takeScreenshot(name: string): Promise<void> {
    await AllureReporter.captureScreenshot(name);
  }

  /**
   * Add step to test report
   */
  static addStep(stepName: string): void {
    Logger.step(stepName);
    AllureReporter.addStep(stepName);
  }

  /**
   * Wait for app to be ready
   */
  static async waitForAppReady(timeout: number = 30000): Promise<void> {
    Logger.info('Waiting for app to be ready');
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check if we can interact with the app
        await browser.getPageSource();
        Logger.info('App is ready');
        return;
      } catch {
        await browser.pause(500);
      }
    }
    
    throw new Error('App did not become ready within timeout');
  }

  /**
   * Get device info
   */
  static async getDeviceInfo(): Promise<Record<string, string>> {
    const caps = browser.capabilities as Record<string, unknown>;
    
    return {
      platformName: String(caps.platformName || 'Unknown'),
      platformVersion: String(caps.platformVersion || 'Unknown'),
      deviceName: String(caps.deviceName || caps['appium:deviceName'] || 'Unknown'),
      automationName: String(caps.automationName || caps['appium:automationName'] || 'Unknown'),
      sessionId: browser.sessionId || 'Unknown',
    };
  }

  /**
   * Set implicit wait timeout
   */
  static async setImplicitWait(timeout: number): Promise<void> {
    await browser.setTimeout({ implicit: timeout });
    Logger.debug(`Implicit wait set to ${timeout}ms`);
  }

  /**
   * Get current context (NATIVE_APP or WEBVIEW)
   */
  static async getCurrentContext(): Promise<string> {
    try {
      const context = await browser.getContext();
      if (typeof context === 'string') {
        return context || 'NATIVE_APP';
      }
      return 'NATIVE_APP';
    } catch {
      return 'NATIVE_APP';
    }
  }

  /**
   * Switch to native context
   */
  static async switchToNativeContext(): Promise<void> {
    try {
      await browser.switchContext('NATIVE_APP');
      Logger.debug('Switched to NATIVE_APP context');
    } catch (error) {
      Logger.warn('Could not switch to native context', error as Error);
    }
  }

  /**
   * Switch to webview context
   */
  static async switchToWebViewContext(): Promise<void> {
    try {
      const contexts = await browser.getContexts();
      const webviewContext = contexts.find(ctx => {
        if (typeof ctx === 'string') {
          return ctx.includes('WEBVIEW');
        }
        return false;
      });
      
      if (webviewContext && typeof webviewContext === 'string') {
        await browser.switchContext(webviewContext);
        Logger.debug(`Switched to ${webviewContext} context`);
      } else {
        Logger.warn('No WEBVIEW context found');
      }
    } catch (error) {
      Logger.warn('Could not switch to webview context', error as Error);
    }
  }
}

export default BaseTest;
