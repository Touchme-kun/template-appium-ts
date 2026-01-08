/**
 * Gesture Test Suite
 * Comprehensive tests for mobile gestures and interactions
 */

import { browser, expect, $ } from '@wdio/globals';
import { GestureHelper } from '../../src/helpers/GestureHelper';
import { Logger } from '../../src/utils/Logger';
import allure from '@wdio/allure-reporter';

describe('Gesture Tests', () => {
  before(async () => {
    Logger.info('Starting Gesture Test Suite');
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const screenshot = await browser.takeScreenshot();
      allure.addAttachment(`gesture-failure-${Date.now()}`, Buffer.from(screenshot, 'base64'), 'image/png');
    }
  });

  describe('Swipe Gestures', () => {
    it('should swipe up to scroll content down', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Swipe');

      // Get initial position of a reference element
      const referenceElement = await $('~scrollable-content');
      const initialY = await referenceElement.getLocation('y');

      // Swipe up
      await GestureHelper.swipeUp();
      await browser.pause(500);

      // Verify scroll happened
      const newY = await referenceElement.getLocation('y');
      expect(newY).toBeLessThan(initialY);
    });

    it('should swipe down to scroll content up', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Swipe');

      // First scroll down
      await GestureHelper.swipeUp();
      await browser.pause(500);

      const referenceElement = await $('~scrollable-content');
      const initialY = await referenceElement.getLocation('y');

      // Swipe down
      await GestureHelper.swipeDown();
      await browser.pause(500);

      // Verify scroll back up
      const newY = await referenceElement.getLocation('y');
      expect(newY).toBeGreaterThan(initialY);
    });

    it('should swipe left to navigate to next page', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Swipe Navigation');

      const pageIndicator = await $('~page-indicator');
      const initialPage = await pageIndicator.getText();

      await GestureHelper.swipeLeft();
      await browser.pause(500);

      const newPage = await pageIndicator.getText();
      expect(parseInt(newPage)).toBe(parseInt(initialPage) + 1);
    });

    it('should swipe right to navigate to previous page', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Swipe Navigation');

      // Navigate to page 2 first
      await GestureHelper.swipeLeft();
      await browser.pause(500);

      const pageIndicator = await $('~page-indicator');
      const initialPage = await pageIndicator.getText();

      await GestureHelper.swipeRight();
      await browser.pause(500);

      const newPage = await pageIndicator.getText();
      expect(parseInt(newPage)).toBe(parseInt(initialPage) - 1);
    });

    it('should perform swipe with custom options', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Custom Swipe');

      // Custom swipe with specific percentages
      await GestureHelper.swipeUp({
        startPercentage: 0.9,
        endPercentage: 0.1,
        duration: 300,
      });

      await browser.pause(500);
    });
  });

  describe('Tap Gestures', () => {
    it('should perform double tap', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Double Tap');

      const element = await $('~double-tap-target');
      await GestureHelper.doubleTap(element);

      // Verify double tap action (e.g., zoom)
      const result = await $('~zoom-level');
      const zoomLevel = await result.getText();
      expect(parseFloat(zoomLevel)).toBeGreaterThan(1);
    });

    it('should perform long press', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Long Press');

      const element = await $('~long-press-target');
      await GestureHelper.longPress(element, 2000);

      // Verify context menu appears
      const contextMenu = await $('~context-menu');
      await expect(contextMenu).toBeDisplayed();
    });
  });

  describe('Drag and Drop', () => {
    it('should drag element to target location', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Drag and Drop');

      const draggable = await $('~draggable-item');
      const dropTarget = await $('~drop-zone');

      await GestureHelper.dragAndDrop(draggable, dropTarget);

      await browser.pause(500);

      // Verify element was moved
      const result = await $('~drop-result');
      await expect(result).toHaveText('Item dropped');
    });
  });

  describe('Scroll Tests', () => {
    it('should scroll to element not visible on screen', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Scroll');

      const caps = browser.capabilities as Record<string, unknown>;
      const isAndroid = caps.platformName === 'Android';

      if (isAndroid) {
        // Use UIAutomator scroll
        const element = await $(
          'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("Hidden Element"))'
        );
        await expect(element).toBeDisplayed();
      } else {
        // iOS: scroll using swipes
        let found = false;
        for (let i = 0; i < 5 && !found; i++) {
          const hiddenElement = await $('~hidden-element');
          found = await hiddenElement.isDisplayed().catch(() => false);
          if (!found) {
            await GestureHelper.swipeUp();
            await browser.pause(300);
          }
        }
      }
    });

    it('should scroll within a specific container element', async () => {
      allure.addFeature('Gestures');
      allure.addStory('Container Scroll');

      // Scroll within container by swiping
      await GestureHelper.swipeUp({ startPercentage: 0.8, endPercentage: 0.2 });
      await browser.pause(500);

      // Verify scrolled content
      const bottomElement = await $('~bottom-item');
      await expect(bottomElement).toBeDisplayed();
    });
  });
});

describe('Multi-Touch Gestures', () => {
  it('should handle two-finger tap', async () => {
    allure.addFeature('Gestures');
    allure.addStory('Multi-Touch');

    const element = await $('~multi-touch-target');
    const location = await element.getLocation();
    const size = await element.getSize();

    // Two finger tap simulation using actions
    await browser
      .action('pointer', {
        parameters: { pointerType: 'touch' },
      })
      .move({ x: location.x + 20, y: location.y + size.height / 2 })
      .down()
      .up()
      .perform();

    await browser
      .action('pointer', {
        parameters: { pointerType: 'touch' },
      })
      .move({ x: location.x + size.width - 20, y: location.y + size.height / 2 })
      .down()
      .up()
      .perform();

    // Verify action
    const result = await $('~gesture-result');
    const resultText = await result.getText();
    expect(resultText).toContain('Two-finger');
  });
});
