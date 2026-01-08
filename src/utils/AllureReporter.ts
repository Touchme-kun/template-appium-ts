import { browser } from '@wdio/globals';
import allure from '@wdio/allure-reporter';
import { Logger } from './Logger';
import * as fs from 'fs';
import * as path from 'path';

// Type assertion for allure methods not in type definitions
const allureReporter = allure as typeof allure & {
  addEnvironment: (key: string, value: string) => void;
};

/**
 * Severity levels for test categorization
 */
export type AllureSeverity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

/**
 * Test status for step reporting
 */
export type AllureStatus = 'passed' | 'failed' | 'broken' | 'skipped' | 'unknown';

/**
 * Allure Reporter utility class
 * Provides comprehensive methods for enhanced Allure reporting
 *
 * Features:
 * - Step annotations with automatic status handling
 * - Screenshot capture on failure
 * - Device logs attachment
 * - Environment and device info tracking
 * - Test categorization (severity, feature, story)
 * - Video and artifact links
 * - Performance metrics tracking
 */
export class AllureReporter {
  private static allureResultsDir = path.resolve(process.cwd(), 'allure-results');
  private static testStartTime: number = 0;

  /**
   * Initialize Allure results directory
   */
  static initialize(): void {
    if (!fs.existsSync(this.allureResultsDir)) {
      fs.mkdirSync(this.allureResultsDir, { recursive: true });
    }
  }

  /**
   * Add a step to the Allure report
   */
  static addStep(stepName: string, status: AllureStatus = 'passed'): void {
    allure.addStep(stepName, { content: '', name: stepName }, status as never);
    Logger.step(stepName);
  }

  /**
   * Start a step (for nested steps)
   */
  static startStep(stepName: string): void {
    allure.startStep(stepName);
    Logger.step(stepName);
  }

  /**
   * End the current step
   */
  static endStep(status = 'passed'): void {
    allure.endStep(status as never);
  }

  /**
   * Add an attachment to the report
   */
  static addAttachment(name: string, content: string | Buffer, type: string): void {
    allure.addAttachment(name, content, type);
    Logger.debug(`Attachment added: ${name}`);
  }

  /**
   * Capture and attach a screenshot
   */
  static async captureScreenshot(name: string): Promise<void> {
    try {
      const screenshot = await browser.takeScreenshot();
      allure.addAttachment(name, Buffer.from(screenshot, 'base64'), 'image/png');
      Logger.info(`Screenshot captured: ${name}`);
    } catch (error) {
      Logger.error(`Failed to capture screenshot: ${name}`, error as Error);
    }
  }

  /**
   * Add environment information
   */
  static addEnvironment(key: string, value: string): void {
    allureReporter.addEnvironment(key, value);
  }

  /**
   * Add multiple environment variables
   */
  static addEnvironmentInfo(info: Record<string, string>): void {
    Object.entries(info).forEach(([key, value]) => {
      this.addEnvironment(key, value);
    });
  }

  /**
   * Set feature label
   */
  static addFeature(featureName: string): void {
    allure.addFeature(featureName);
  }

  /**
   * Set story label
   */
  static addStory(storyName: string): void {
    allure.addStory(storyName);
  }

  /**
   * Set severity level
   */
  static addSeverity(severity: AllureSeverity): void {
    allure.addSeverity(severity);
  }

  /**
   * Add issue link
   */
  static addIssue(issueId: string): void {
    allure.addIssue(issueId);
  }

  /**
   * Add test case ID
   */
  static addTestId(testId: string): void {
    allure.addTestId(testId);
  }

  /**
   * Add description to test
   */
  static addDescription(description: string, type: 'html' | 'markdown' | 'text' = 'text'): void {
    allure.addDescription(description, type);
  }

  /**
   * Add argument to current test
   */
  static addArgument(name: string, value: string): void {
    allure.addArgument(name, value);
  }

  /**
   * Add device info to report
   */
  static async addDeviceInfo(): Promise<void> {
    try {
      const caps = browser.capabilities as Record<string, unknown>;

      allureReporter.addEnvironment('Platform', String(caps.platformName || 'Unknown'));
      allureReporter.addEnvironment('Platform Version', String(caps.platformVersion || 'Unknown'));
      allureReporter.addEnvironment('Device Name', String(caps.deviceName || caps['appium:deviceName'] || 'Unknown'));
      allureReporter.addEnvironment(
        'Automation Name',
        String(caps.automationName || caps['appium:automationName'] || 'Unknown')
      );

      // Additional device details
      if (caps['appium:udid']) {
        allureReporter.addEnvironment('Device UDID', String(caps['appium:udid']));
      }
      if (caps['browserstack:options']) {
        const bsOptions = caps['browserstack:options'] as Record<string, unknown>;
        allureReporter.addEnvironment('BrowserStack Build', String(bsOptions.buildName || 'N/A'));
        allureReporter.addEnvironment('BrowserStack Session', String(bsOptions.sessionName || 'N/A'));
      }
    } catch (error) {
      Logger.warn('Could not add device info to Allure report');
    }
  }

  /**
   * Create a custom label
   */
  static addLabel(name: string, value: string): void {
    allure.addLabel(name, value);
  }

  /**
   * Add link to report
   */
  static addLink(url: string, name?: string, type?: string): void {
    allure.addLink(url, name, type);
  }

  /**
   * Add video recording link (e.g., from BrowserStack)
   */
  static addVideoLink(videoUrl: string, name = 'Test Recording'): void {
    allure.addLink(videoUrl, name, 'video');
    Logger.info(`Video link added: ${videoUrl}`);
  }

  /**
   * Add BrowserStack session link
   */
  static addBrowserStackSessionLink(sessionId: string): void {
    const bsUrl = `https://app-automate.browserstack.com/dashboard/v2/sessions/${sessionId}`;
    this.addLink(bsUrl, 'BrowserStack Session', 'tms');
    Logger.info(`BrowserStack session link added: ${bsUrl}`);
  }

  /**
   * Mark test start for duration tracking
   */
  static markTestStart(): void {
    this.testStartTime = Date.now();
  }

  /**
   * Get test duration in ms
   */
  static getTestDuration(): number {
    return this.testStartTime > 0 ? Date.now() - this.testStartTime : 0;
  }

  /**
   * Add performance metric
   */
  static addPerformanceMetric(metricName: string, value: number, unit = 'ms'): void {
    this.addArgument(metricName, `${value}${unit}`);
    Logger.performance(metricName, value);
  }

  /**
   * Add test execution time
   */
  static addExecutionTime(): void {
    const duration = this.getTestDuration();
    if (duration > 0) {
      this.addPerformanceMetric('Execution Time', duration);
    }
  }

  /**
   * Add console logs attachment
   */
  static addConsoleLogs(logs: string[]): void {
    if (logs.length > 0) {
      const content = logs.join('\n');
      this.addAttachment('Console Logs', content, 'text/plain');
    }
  }

  /**
   * Add page source attachment
   */
  static async addPageSource(name = 'Page Source'): Promise<void> {
    try {
      const pageSource = await browser.getPageSource();
      this.addAttachment(name, pageSource, 'application/xml');
    } catch (error) {
      Logger.warn('Could not capture page source');
    }
  }

  /**
   * Add test data attachment (JSON)
   */
  static addTestData(name: string, data: Record<string, unknown>): void {
    const content = JSON.stringify(data, null, 2);
    this.addAttachment(name, content, 'application/json');
  }

  /**
   * Add network logs attachment
   */
  static addNetworkLogs(logs: unknown[]): void {
    if (logs.length > 0) {
      const content = JSON.stringify(logs, null, 2);
      this.addAttachment('Network Logs', content, 'application/json');
    }
  }

  /**
   * Create environment.properties file for Allure
   */
  static async writeEnvironmentProperties(): Promise<void> {
    try {
      const caps = browser.capabilities as Record<string, unknown>;
      const properties: string[] = [
        `Platform=${caps.platformName || 'Unknown'}`,
        `Platform.Version=${caps.platformVersion || 'Unknown'}`,
        `Device.Name=${caps.deviceName || caps['appium:deviceName'] || 'Unknown'}`,
        `Automation.Name=${caps.automationName || caps['appium:automationName'] || 'Unknown'}`,
        `Environment=${process.env.TEST_ENV || 'development'}`,
        `Timestamp=${new Date().toISOString()}`,
        `Framework=WebdriverIO 9.x`,
        `Node.Version=${process.version}`,
      ];

      // Add BrowserStack info if present
      if (process.env.BROWSERSTACK_USER) {
        properties.push(`Cloud.Provider=BrowserStack`);
        properties.push(`BrowserStack.Build=${process.env.BROWSERSTACK_BUILD_NAME || 'Unknown'}`);
      }

      const filePath = path.join(this.allureResultsDir, 'environment.properties');
      fs.writeFileSync(filePath, properties.join('\n'), 'utf8');
      Logger.info('Allure environment.properties written');
    } catch (error) {
      Logger.error('Failed to write environment.properties', error as Error);
    }
  }

  /**
   * Wrap a step with automatic status handling
   */
  static async step<T>(stepName: string, fn: () => Promise<T>): Promise<T> {
    AllureReporter.startStep(stepName);
    try {
      const result = await fn();
      AllureReporter.endStep('passed');
      return result;
    } catch (error) {
      await AllureReporter.captureScreenshot(`${stepName}_failure`);
      AllureReporter.endStep('failed');
      throw error;
    }
  }

  /**
   * Wrap a step with retry capability
   */
  static async stepWithRetry<T>(stepName: string, fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const attemptName = attempt > 1 ? `${stepName} (Attempt ${attempt})` : stepName;
        return await this.step(attemptName, fn);
      } catch (error) {
        lastError = error as Error;
        if (attempt <= retries) {
          Logger.warn(`Step "${stepName}" failed, retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError;
  }

  /**
   * Add failure analysis info
   */
  static addFailureAnalysis(error: Error, category: string): void {
    this.addLabel('failure_category', category);
    this.addAttachment(
      'Error Details',
      JSON.stringify(
        {
          name: error.name,
          message: error.message,
          stack: error.stack,
          category: category,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
      'application/json'
    );
  }

  /**
   * Categorize failure type
   */
  static categorizeFailure(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return 'Timeout Failures';
    }
    if (message.includes('element') && (message.includes('not found') || message.includes('not visible'))) {
      return 'Element Not Found';
    }
    if (message.includes('assertion') || message.includes('expect')) {
      return 'Assertion Failures';
    }
    if (message.includes('network') || message.includes('connection')) {
      return 'Network Failures';
    }
    if (message.includes('stale')) {
      return 'Stale Element Failures';
    }
    return 'Uncategorized Failures';
  }
}

export default AllureReporter;
