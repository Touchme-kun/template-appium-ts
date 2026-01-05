import type { WaitOptions } from '../types/framework.types';
import { Logger } from '../utils/Logger';

/**
 * Wait Helper class
 * Provides smart wait utilities for mobile testing
 */
export class WaitHelper {
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly DEFAULT_INTERVAL = 500;

  /**
   * Wait for element to be displayed
   */
  static async waitForDisplayed(selector: string, options: WaitOptions = {}): Promise<WebdriverIO.Element> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} not displayed within ${timeout}ms`;

    Logger.debug(`Waiting for element to be displayed: ${selector}`);

    const element = await $(selector);
    await element.waitForDisplayed({ timeout, interval, timeoutMsg });

    Logger.debug(`Element displayed: ${selector}`);
    return element;
  }

  /**
   * Wait for element to exist in DOM
   */
  static async waitForExist(selector: string, options: WaitOptions = {}): Promise<WebdriverIO.Element> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} does not exist within ${timeout}ms`;

    Logger.debug(`Waiting for element to exist: ${selector}`);

    const element = await $(selector);
    await element.waitForExist({ timeout, interval, timeoutMsg });

    Logger.debug(`Element exists: ${selector}`);
    return element;
  }

  /**
   * Wait for element to be clickable
   */
  static async waitForClickable(selector: string, options: WaitOptions = {}): Promise<WebdriverIO.Element> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} not clickable within ${timeout}ms`;

    Logger.debug(`Waiting for element to be clickable: ${selector}`);

    const element = await $(selector);
    await element.waitForClickable({ timeout, interval, timeoutMsg });

    Logger.debug(`Element clickable: ${selector}`);
    return element;
  }

  /**
   * Wait for element to be enabled
   */
  static async waitForEnabled(selector: string, options: WaitOptions = {}): Promise<WebdriverIO.Element> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} not enabled within ${timeout}ms`;

    Logger.debug(`Waiting for element to be enabled: ${selector}`);

    const element = await $(selector);
    await element.waitForEnabled({ timeout, interval, timeoutMsg });

    Logger.debug(`Element enabled: ${selector}`);
    return element;
  }

  /**
   * Wait for element to not be displayed
   */
  static async waitForNotDisplayed(selector: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} still displayed after ${timeout}ms`;

    Logger.debug(`Waiting for element to not be displayed: ${selector}`);

    const element = await $(selector);
    await element.waitForDisplayed({ timeout, interval, timeoutMsg, reverse: true });

    Logger.debug(`Element not displayed: ${selector}`);
  }

  /**
   * Wait for element to not exist in DOM
   */
  static async waitForNotExist(selector: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Element ${selector} still exists after ${timeout}ms`;

    Logger.debug(`Waiting for element to not exist: ${selector}`);

    const element = await $(selector);
    await element.waitForExist({ timeout, interval, timeoutMsg, reverse: true });

    Logger.debug(`Element does not exist: ${selector}`);
  }

  /**
   * Wait for element text to contain value
   */
  static async waitForTextContains(selector: string, text: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;

    Logger.debug(`Waiting for element ${selector} to contain text: ${text}`);

    await browser.waitUntil(
      async () => {
        const element = await $(selector);
        const elementText = await element.getText();
        return elementText.includes(text);
      },
      {
        timeout,
        interval,
        timeoutMsg: `Element ${selector} does not contain text "${text}" within ${timeout}ms`,
      }
    );

    Logger.debug(`Element contains text: ${text}`);
  }

  /**
   * Wait for element text to equal value
   */
  static async waitForTextEquals(selector: string, text: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;

    Logger.debug(`Waiting for element ${selector} text to equal: ${text}`);

    await browser.waitUntil(
      async () => {
        const element = await $(selector);
        const elementText = await element.getText();
        return elementText === text;
      },
      {
        timeout,
        interval,
        timeoutMsg: `Element ${selector} text does not equal "${text}" within ${timeout}ms`,
      }
    );

    Logger.debug(`Element text equals: ${text}`);
  }

  /**
   * Wait for attribute to have value
   */
  static async waitForAttributeValue(
    selector: string,
    attribute: string,
    value: string,
    options: WaitOptions = {}
  ): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;

    Logger.debug(`Waiting for element ${selector} attribute "${attribute}" to equal: ${value}`);

    await browser.waitUntil(
      async () => {
        const element = await $(selector);
        const attrValue = await element.getAttribute(attribute);
        return attrValue === value;
      },
      {
        timeout,
        interval,
        timeoutMsg: `Element ${selector} attribute "${attribute}" does not equal "${value}" within ${timeout}ms`,
      }
    );

    Logger.debug(`Element attribute ${attribute} equals: ${value}`);
  }

  /**
   * Wait for custom condition
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    options: WaitOptions = {}
  ): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;
    const timeoutMsg = options.timeoutMsg || `Condition not met within ${timeout}ms`;

    Logger.debug('Waiting for custom condition');

    await browser.waitUntil(condition, { timeout, interval, timeoutMsg });

    Logger.debug('Custom condition met');
  }

  /**
   * Wait for specified duration (use sparingly)
   */
  static async pause(durationMs: number): Promise<void> {
    Logger.debug(`Pausing for ${durationMs}ms`);
    await browser.pause(durationMs);
  }

  /**
   * Wait for app to be ready (custom condition for each app)
   */
  static async waitForAppReady(indicator: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || 60000;

    Logger.info('Waiting for app to be ready');
    await WaitHelper.waitForDisplayed(indicator, { timeout, ...options });
    Logger.info('App is ready');
  }

  /**
   * Wait for loading indicator to disappear
   */
  static async waitForLoadingComplete(loadingSelector: string, options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || 60000;

    Logger.debug('Waiting for loading to complete');

    // First check if loading indicator exists
    const element = await $(loadingSelector);
    const exists = await element.isExisting();

    if (exists) {
      await WaitHelper.waitForNotDisplayed(loadingSelector, { timeout, ...options });
    }

    Logger.debug('Loading complete');
  }

  /**
   * Wait for alert to be present (iOS/Android)
   */
  static async waitForAlert(options: WaitOptions = {}): Promise<void> {
    const timeout = options.timeout || WaitHelper.DEFAULT_TIMEOUT;
    const interval = options.interval || WaitHelper.DEFAULT_INTERVAL;

    Logger.debug('Waiting for alert');

    await browser.waitUntil(
      async () => {
        try {
          await driver.getAlertText();
          return true;
        } catch {
          return false;
        }
      },
      {
        timeout,
        interval,
        timeoutMsg: `Alert not present within ${timeout}ms`,
      }
    );

    Logger.debug('Alert present');
  }

  /**
   * Retry action with wait
   */
  static async retryWithWait<T>(
    action: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug(`Attempt ${attempt} of ${maxRetries}`);
        return await action();
      } catch (error) {
        lastError = error as Error;
        Logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < maxRetries) {
          await WaitHelper.pause(delayMs);
        }
      }
    }

    throw new Error(`Action failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
  }
}

export default WaitHelper;
