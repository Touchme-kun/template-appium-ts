import { $, browser, driver } from '@wdio/globals';
import type { Locator, WaitOptions } from '../types/framework.types';
import { Logger } from '../utils/Logger';

// Type alias for WebdriverIO element (v9 compatible)
type WdioElement = Awaited<ReturnType<typeof $>>;

/**
 * Base Screen class for Page Object Model
 * Provides common methods for all screen objects
 */
export abstract class BaseScreen {
  /**
   * Abstract property to define the screen's main locator
   * Used to verify if the screen is displayed
   */
  protected abstract get screenLocator(): string;

  /**
   * Get platform-specific locator
   */
  protected getLocator(locator: Locator): string {
    return driver.isAndroid ? locator.android : locator.ios;
  }

  /**
   * Wait for the screen to be displayed
   */
  async waitForScreen(options?: WaitOptions): Promise<void> {
    const timeout = options?.timeout || 30000;
    const timeoutMsg = options?.timeoutMsg || `Screen not displayed within ${timeout}ms`;

    Logger.info(`Waiting for screen: ${this.constructor.name}`);
    await this.waitForElement(this.screenLocator, { timeout, timeoutMsg });
    Logger.info(`Screen displayed: ${this.constructor.name}`);
  }

  /**
   * Check if screen is displayed
   */
  async isScreenDisplayed(): Promise<boolean> {
    try {
      const element = await $(this.screenLocator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Wait for an element to be displayed
   */
  async waitForElement(selector: string, options?: WaitOptions): Promise<WdioElement> {
    const timeout = options?.timeout || 30000;
    const interval = options?.interval || 500;
    const timeoutMsg = options?.timeoutMsg || `Element ${selector} not found within ${timeout}ms`;

    const element = await $(selector);
    await element.waitForDisplayed({ timeout, interval, timeoutMsg });
    return element;
  }

  /**
   * Wait for an element to exist in DOM
   */
  async waitForElementExist(selector: string, options?: WaitOptions): Promise<WdioElement> {
    const timeout = options?.timeout || 30000;
    const interval = options?.interval || 500;
    const timeoutMsg = options?.timeoutMsg || `Element ${selector} does not exist within ${timeout}ms`;

    const element = await $(selector);
    await element.waitForExist({ timeout, interval, timeoutMsg });
    return element;
  }

  /**
   * Wait for an element to be clickable
   */
  async waitForElementClickable(selector: string, options?: WaitOptions): Promise<WdioElement> {
    const timeout = options?.timeout || 30000;
    const interval = options?.interval || 500;
    const timeoutMsg = options?.timeoutMsg || `Element ${selector} not clickable within ${timeout}ms`;

    const element = await $(selector);
    await element.waitForClickable({ timeout, interval, timeoutMsg });
    return element;
  }

  /**
   * Tap on an element
   */
  async tap(selector: string): Promise<void> {
    Logger.debug(`Tapping element: ${selector}`);
    const element = await this.waitForElementClickable(selector);
    await element.click();
    Logger.debug(`Tapped element: ${selector}`);
  }

  /**
   * Enter text into an input field
   */
  async enterText(selector: string, text: string, clearFirst = true): Promise<void> {
    Logger.debug(`Entering text into: ${selector}`);
    const element = await this.waitForElement(selector);

    if (clearFirst) {
      await element.clearValue();
    }

    await element.setValue(text);
    Logger.debug(`Entered text into: ${selector}`);
  }

  /**
   * Get text from an element
   */
  async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return await element.getText();
  }

  /**
   * Get attribute value from an element
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const element = await this.waitForElement(selector);
    return await element.getAttribute(attribute);
  }

  /**
   * Check if an element is displayed
   */
  async isElementDisplayed(selector: string, timeout = 5000): Promise<boolean> {
    try {
      const element = await $(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if an element exists in DOM
   */
  async isElementExisting(selector: string): Promise<boolean> {
    const element = await $(selector);
    return await element.isExisting();
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementNotDisplayed(selector: string, options?: WaitOptions): Promise<void> {
    const timeout = options?.timeout || 30000;
    const interval = options?.interval || 500;

    const element = await $(selector);
    await element.waitForDisplayed({ timeout, interval, reverse: true });
  }

  /**
   * Scroll to an element
   */
  async scrollToElement(selector: string, maxScrolls = 5): Promise<WdioElement> {
    Logger.debug(`Scrolling to element: ${selector}`);
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      const element = await $(selector);
      if (await element.isDisplayed()) {
        Logger.debug(`Found element after ${scrollCount} scrolls`);
        return element;
      }

      await this.swipeUp(0.5);
      scrollCount++;
    }

    throw new Error(`Element ${selector} not found after ${maxScrolls} scrolls`);
  }

  /**
   * Swipe up on the screen
   */
  async swipeUp(percentage = 0.8): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const startX = width / 2;
    const startY = height * percentage;
    const endY = height * (1 - percentage);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 500, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
  }

  /**
   * Swipe down on the screen
   */
  async swipeDown(percentage = 0.8): Promise<void> {
    const { width, height } = await driver.getWindowSize();
    const startX = width / 2;
    const startY = height * (1 - percentage);
    const endY = height * percentage;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 500, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
  }

  /**
   * Hide keyboard if displayed
   */
  async hideKeyboard(): Promise<void> {
    try {
      if (driver.isAndroid) {
        await driver.hideKeyboard();
      } else {
        // iOS: tap outside or press Done
        await driver.hideKeyboard();
      }
    } catch {
      // Keyboard might not be visible
      Logger.debug('Keyboard not visible or already hidden');
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${name}_${timestamp}.png`;
    const filePath = `./reports/screenshots/${fileName}`;

    await browser.saveScreenshot(filePath);
    Logger.info(`Screenshot saved: ${filePath}`);

    return filePath;
  }
}

export default BaseScreen;
