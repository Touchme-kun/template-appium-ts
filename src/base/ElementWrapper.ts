/**
 * ElementWrapper - Custom element interactions with error handling and retries
 * Provides a fluent API for element interactions with built-in resilience
 */

import { $, browser } from '@wdio/globals';
import { Logger } from '../utils/Logger';

// Type alias for WebdriverIO element (v9 compatible)
type WdioElement = Awaited<ReturnType<typeof $>>;

export interface ElementOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  scrollIntoView?: boolean;
}

const DEFAULT_OPTIONS: Required<ElementOptions> = {
  timeout: 10000,
  retries: 3,
  retryDelay: 500,
  scrollIntoView: true,
};

export class ElementWrapper {
  private selector: string;
  private options: Required<ElementOptions>;
  private cachedElement: WdioElement | null = null;

  constructor(selector: string, options: ElementOptions = {}) {
    this.selector = selector;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Create ElementWrapper from selector
   */
  static $(selector: string, options?: ElementOptions): ElementWrapper {
    return new ElementWrapper(selector, options);
  }

  /**
   * Get the underlying WebdriverIO element
   */
  async getElement(): Promise<WdioElement> {
    if (this.cachedElement) {
      try {
        // Verify element is still valid
        await this.cachedElement.isExisting();
        return this.cachedElement;
      } catch {
        this.cachedElement = null;
      }
    }

    this.cachedElement = await $(this.selector);
    return this.cachedElement!;
  }

  /**
   * Clear cached element reference
   */
  clearCache(): void {
    this.cachedElement = null;
  }

  /**
   * Wait for element to exist
   */
  async waitForExist(timeout?: number): Promise<boolean> {
    const element = await this.getElement();
    try {
      await element.waitForExist({
        timeout: timeout || this.options.timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be displayed
   */
  async waitForDisplayed(timeout?: number): Promise<boolean> {
    const element = await this.getElement();
    try {
      await element.waitForDisplayed({
        timeout: timeout || this.options.timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(timeout?: number): Promise<boolean> {
    const element = await this.getElement();
    try {
      await element.waitForClickable({
        timeout: timeout || this.options.timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(timeout?: number): Promise<boolean> {
    const element = await this.getElement();
    try {
      await element.waitForEnabled({
        timeout: timeout || this.options.timeout,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists
   */
  async exists(): Promise<boolean> {
    try {
      const element = await this.getElement();
      return await element.isExisting();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is displayed
   */
  async isDisplayed(): Promise<boolean> {
    try {
      const element = await this.getElement();
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const element = await this.getElement();
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is selected
   */
  async isSelected(): Promise<boolean> {
    try {
      const element = await this.getElement();
      return await element.isSelected();
    } catch {
      return false;
    }
  }

  /**
   * Click element with retry logic
   */
  async click(): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      
      if (this.options.scrollIntoView) {
        await this.scrollIntoViewIfNeeded();
      }
      
      await element.waitForClickable({ timeout: this.options.timeout });
      await element.click();
      Logger.debug(`Clicked element: ${this.selector}`);
    }, 'click');
  }

  /**
   * Double click element
   */
  async doubleClick(): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      
      if (this.options.scrollIntoView) {
        await this.scrollIntoViewIfNeeded();
      }
      
      await element.waitForClickable({ timeout: this.options.timeout });
      await element.doubleClick();
      Logger.debug(`Double clicked element: ${this.selector}`);
    }, 'doubleClick');
  }

  /**
   * Enter text into element
   */
  async setValue(value: string): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      
      if (this.options.scrollIntoView) {
        await this.scrollIntoViewIfNeeded();
      }
      
      await element.waitForDisplayed({ timeout: this.options.timeout });
      await element.setValue(value);
      Logger.debug(`Set value "${value}" on element: ${this.selector}`);
    }, 'setValue');
  }

  /**
   * Add text to element (without clearing)
   */
  async addValue(value: string): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      
      if (this.options.scrollIntoView) {
        await this.scrollIntoViewIfNeeded();
      }
      
      await element.waitForDisplayed({ timeout: this.options.timeout });
      await element.addValue(value);
      Logger.debug(`Added value "${value}" to element: ${this.selector}`);
    }, 'addValue');
  }

  /**
   * Clear element text
   */
  async clearValue(): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      await element.waitForDisplayed({ timeout: this.options.timeout });
      await element.clearValue();
      Logger.debug(`Cleared value from element: ${this.selector}`);
    }, 'clearValue');
  }

  /**
   * Get element text
   */
  async getText(): Promise<string> {
    return await this.retryAction(async () => {
      const element = await this.getElement();
      await element.waitForDisplayed({ timeout: this.options.timeout });
      const text = await element.getText();
      Logger.debug(`Got text "${text}" from element: ${this.selector}`);
      return text;
    }, 'getText');
  }

  /**
   * Get element attribute
   */
  async getAttribute(attributeName: string): Promise<string | null> {
    return await this.retryAction(async () => {
      const element = await this.getElement();
      await element.waitForExist({ timeout: this.options.timeout });
      const value = await element.getAttribute(attributeName);
      Logger.debug(`Got attribute "${attributeName}=${value}" from element: ${this.selector}`);
      return value;
    }, 'getAttribute');
  }

  /**
   * Get element value
   */
  async getValue(): Promise<string> {
    return await this.retryAction(async () => {
      const element = await this.getElement();
      await element.waitForExist({ timeout: this.options.timeout });
      const value = await element.getValue();
      return value;
    }, 'getValue');
  }

  /**
   * Get element location
   */
  async getLocation(): Promise<{ x: number; y: number }> {
    const element = await this.getElement();
    await element.waitForExist({ timeout: this.options.timeout });
    return await element.getLocation();
  }

  /**
   * Get element size
   */
  async getSize(): Promise<{ width: number; height: number }> {
    const element = await this.getElement();
    await element.waitForExist({ timeout: this.options.timeout });
    return await element.getSize();
  }

  /**
   * Scroll element into view if needed
   */
  async scrollIntoViewIfNeeded(): Promise<void> {
    try {
      const element = await this.getElement();
      const isDisplayed = await element.isDisplayed();
      
      if (!isDisplayed) {
        await element.scrollIntoView();
        await browser.pause(300); // Wait for scroll animation
      }
    } catch {
      // Element might not be in DOM yet, ignore
    }
  }

  /**
   * Scroll to element
   */
  async scrollIntoView(): Promise<void> {
    const element = await this.getElement();
    await element.scrollIntoView();
    await browser.pause(300);
  }

  /**
   * Long press on element
   */
  async longPress(duration: number = 2000): Promise<void> {
    await this.retryAction(async () => {
      const element = await this.getElement();
      
      if (this.options.scrollIntoView) {
        await this.scrollIntoViewIfNeeded();
      }
      
      await element.waitForDisplayed({ timeout: this.options.timeout });
      
      const location = await element.getLocation();
      const size = await element.getSize();
      const centerX = location.x + size.width / 2;
      const centerY = location.y + size.height / 2;

      await browser.touchAction([
        { action: 'press', x: centerX, y: centerY },
        { action: 'wait', ms: duration },
        { action: 'release' },
      ]);
      
      Logger.debug(`Long pressed element for ${duration}ms: ${this.selector}`);
    }, 'longPress');
  }

  /**
   * Tap on element (mobile-specific)
   */
  async tap(): Promise<void> {
    await this.click();
  }

  /**
   * Get element's child element
   */
  async $(childSelector: string): Promise<ElementWrapper> {
    const parent = await this.getElement();
    const child = await parent.$(childSelector);
    const childWrapper = new ElementWrapper(childSelector, this.options);
    childWrapper.cachedElement = child as unknown as WdioElement;
    return childWrapper;
  }

  /**
   * Get all matching child elements
   */
  async $$(childSelector: string): Promise<ElementWrapper[]> {
    const parent = await this.getElement();
    const children = await parent.$$(childSelector);
    
    return children.map((child, index) => {
      const wrapper = new ElementWrapper(`${childSelector}[${index}]`, this.options);
      wrapper.cachedElement = child as unknown as WdioElement;
      return wrapper;
    });
  }

  /**
   * Retry action with exponential backoff
   */
  private async retryAction<T>(
    action: () => Promise<T>,
    actionName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        Logger.warn(
          `Action "${actionName}" failed on attempt ${attempt}/${this.options.retries}: ${lastError.message}`
        );
        
        if (attempt < this.options.retries) {
          this.clearCache(); // Clear cache to get fresh element
          const delay = this.options.retryDelay * attempt;
          await browser.pause(delay);
        }
      }
    }
    
    Logger.error(`Action "${actionName}" failed after ${this.options.retries} attempts on element: ${this.selector}`);
    throw lastError;
  }

  /**
   * Take screenshot of element
   */
  async takeScreenshot(): Promise<void> {
    const element = await this.getElement();
    await element.saveScreenshot(`element-${Date.now()}.png`);
  }

  /**
   * Check if element has specific text
   */
  async hasText(expectedText: string): Promise<boolean> {
    const actualText = await this.getText();
    return actualText.includes(expectedText);
  }

  /**
   * Check if element has specific attribute value
   */
  async hasAttribute(name: string, value: string): Promise<boolean> {
    const actualValue = await this.getAttribute(name);
    return actualValue === value;
  }

  /**
   * Wait until element has specific text
   */
  async waitUntilHasText(expectedText: string, timeout?: number): Promise<void> {
    const element = await this.getElement();
    await browser.waitUntil(
      async () => {
        const text = await element.getText();
        return text.includes(expectedText);
      },
      {
        timeout: timeout || this.options.timeout,
        timeoutMsg: `Element ${this.selector} did not contain text "${expectedText}"`,
      }
    );
  }

  /**
   * Wait until element is not displayed
   */
  async waitUntilNotDisplayed(timeout?: number): Promise<void> {
    const element = await this.getElement();
    await element.waitForDisplayed({
      timeout: timeout || this.options.timeout,
      reverse: true,
    });
  }
}

// Factory function for creating elements
export const $e = (selector: string, options?: ElementOptions): ElementWrapper => {
  return ElementWrapper.$(selector, options);
};

export default ElementWrapper;
