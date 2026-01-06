import { browser } from '@wdio/globals';
import allure from '@wdio/allure-reporter';
import { Logger } from './Logger';

// Type assertion for allure methods not in type definitions
const allureReporter = allure as typeof allure & {
  addEnvironment: (key: string, value: string) => void;
};

/**
 * Allure Reporter utility class
 * Provides methods for enhanced Allure reporting
 */
export class AllureReporter {
  /**
   * Add a step to the Allure report
   */
  static addStep(stepName: string, status = 'passed'): void {
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
  static addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
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
      allureReporter.addEnvironment('Automation Name', String(caps.automationName || caps['appium:automationName'] || 'Unknown'));
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
}

export default AllureReporter;
