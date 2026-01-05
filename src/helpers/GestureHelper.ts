import type { SwipeOptions } from '../types/framework.types';
import { Logger } from '../utils/Logger';

/**
 * Gesture Helper class
 * Provides common gesture operations for mobile testing
 */
export class GestureHelper {
  /**
   * Swipe up on the screen
   */
  static async swipeUp(options: SwipeOptions = {}): Promise<void> {
    const { startPercentage = 0.8, endPercentage = 0.2, duration = 500 } = options;

    Logger.debug('Performing swipe up');
    const { width, height } = await driver.getWindowSize();

    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * startPercentage);
    const endY = Math.floor(height * endPercentage);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Swipe up completed');
  }

  /**
   * Swipe down on the screen
   */
  static async swipeDown(options: SwipeOptions = {}): Promise<void> {
    const { startPercentage = 0.2, endPercentage = 0.8, duration = 500 } = options;

    Logger.debug('Performing swipe down');
    const { width, height } = await driver.getWindowSize();

    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * startPercentage);
    const endY = Math.floor(height * endPercentage);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration, x: startX, y: endY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Swipe down completed');
  }

  /**
   * Swipe left on the screen or element
   */
  static async swipeLeft(element?: WebdriverIO.Element, options: SwipeOptions = {}): Promise<void> {
    const { startPercentage = 0.9, endPercentage = 0.1, duration = 500 } = options;

    Logger.debug('Performing swipe left');

    let startX: number, endX: number, y: number;

    if (element) {
      const location = await element.getLocation();
      const size = await element.getSize();
      y = Math.floor(location.y + size.height / 2);
      startX = Math.floor(location.x + size.width * startPercentage);
      endX = Math.floor(location.x + size.width * endPercentage);
    } else {
      const { width, height } = await driver.getWindowSize();
      y = Math.floor(height / 2);
      startX = Math.floor(width * startPercentage);
      endX = Math.floor(width * endPercentage);
    }

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration, x: endX, y },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Swipe left completed');
  }

  /**
   * Swipe right on the screen or element
   */
  static async swipeRight(element?: WebdriverIO.Element, options: SwipeOptions = {}): Promise<void> {
    const { startPercentage = 0.1, endPercentage = 0.9, duration = 500 } = options;

    Logger.debug('Performing swipe right');

    let startX: number, endX: number, y: number;

    if (element) {
      const location = await element.getLocation();
      const size = await element.getSize();
      y = Math.floor(location.y + size.height / 2);
      startX = Math.floor(location.x + size.width * startPercentage);
      endX = Math.floor(location.x + size.width * endPercentage);
    } else {
      const { width, height } = await driver.getWindowSize();
      y = Math.floor(height / 2);
      startX = Math.floor(width * startPercentage);
      endX = Math.floor(width * endPercentage);
    }

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration, x: endX, y },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Swipe right completed');
  }

  /**
   * Long press on an element
   */
  static async longPress(element: WebdriverIO.Element, durationMs = 2000): Promise<void> {
    Logger.debug(`Performing long press for ${durationMs}ms`);

    const location = await element.getLocation();
    const size = await element.getSize();
    const x = Math.floor(location.x + size.width / 2);
    const y = Math.floor(location.y + size.height / 2);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: durationMs },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Long press completed');
  }

  /**
   * Double tap on an element
   */
  static async doubleTap(element: WebdriverIO.Element): Promise<void> {
    Logger.debug('Performing double tap');

    const location = await element.getLocation();
    const size = await element.getSize();
    const x = Math.floor(location.x + size.width / 2);
    const y = Math.floor(location.y + size.height / 2);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Double tap completed');
  }

  /**
   * Pinch to zoom in
   */
  static async pinchOpen(element?: WebdriverIO.Element): Promise<void> {
    Logger.debug('Performing pinch open (zoom in)');

    let centerX: number, centerY: number;

    if (element) {
      const location = await element.getLocation();
      const size = await element.getSize();
      centerX = Math.floor(location.x + size.width / 2);
      centerY = Math.floor(location.y + size.height / 2);
    } else {
      const { width, height } = await driver.getWindowSize();
      centerX = Math.floor(width / 2);
      centerY = Math.floor(height / 2);
    }

    const offset = 100;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: centerX - offset, y: centerY - offset },
          { type: 'pointerUp', button: 0 },
        ],
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: centerX + offset, y: centerY + offset },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Pinch open completed');
  }

  /**
   * Pinch to zoom out
   */
  static async pinchClose(element?: WebdriverIO.Element): Promise<void> {
    Logger.debug('Performing pinch close (zoom out)');

    let centerX: number, centerY: number;

    if (element) {
      const location = await element.getLocation();
      const size = await element.getSize();
      centerX = Math.floor(location.x + size.width / 2);
      centerY = Math.floor(location.y + size.height / 2);
    } else {
      const { width, height } = await driver.getWindowSize();
      centerX = Math.floor(width / 2);
      centerY = Math.floor(height / 2);
    }

    const offset = 100;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - offset, y: centerY - offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: centerX, y: centerY },
          { type: 'pointerUp', button: 0 },
        ],
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + offset, y: centerY + offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 500, x: centerX, y: centerY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Pinch close completed');
  }

  /**
   * Scroll to element by swiping
   */
  static async scrollToElement(selector: string, maxScrolls = 10, direction: 'up' | 'down' = 'up'): Promise<WebdriverIO.Element> {
    Logger.debug(`Scrolling to find element: ${selector}`);

    for (let i = 0; i < maxScrolls; i++) {
      const element = await $(selector);

      if (await element.isDisplayed()) {
        Logger.debug(`Element found after ${i} scrolls`);
        return element;
      }

      if (direction === 'up') {
        await GestureHelper.swipeUp();
      } else {
        await GestureHelper.swipeDown();
      }

      await browser.pause(500);
    }

    throw new Error(`Element ${selector} not found after ${maxScrolls} scrolls`);
  }

  /**
   * Drag and drop
   */
  static async dragAndDrop(source: WebdriverIO.Element, target: WebdriverIO.Element): Promise<void> {
    Logger.debug('Performing drag and drop');

    const sourceLocation = await source.getLocation();
    const sourceSize = await source.getSize();
    const targetLocation = await target.getLocation();
    const targetSize = await target.getSize();

    const startX = Math.floor(sourceLocation.x + sourceSize.width / 2);
    const startY = Math.floor(sourceLocation.y + sourceSize.height / 2);
    const endX = Math.floor(targetLocation.x + targetSize.width / 2);
    const endY = Math.floor(targetLocation.y + targetSize.height / 2);

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 500 },
          { type: 'pointerMove', duration: 1000, x: endX, y: endY },
          { type: 'pause', duration: 200 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
    Logger.debug('Drag and drop completed');
  }
}

export default GestureHelper;
