/**
 * Common Step Definitions
 * Reusable steps for all feature files
 */

import { Given, When, Then } from '@wdio/cucumber-framework';
import { browser, expect, $ } from '@wdio/globals';
import { Logger } from '../../../src/utils/Logger';
import { GestureHelper } from '../../../src/helpers/GestureHelper';
import { WaitHelper } from '../../../src/helpers/WaitHelper';
import { AllureReporter } from '../../../src/utils/AllureReporter';

// ===========================================
// Navigation Steps
// ===========================================

Given('I launch the application', async () => {
  Logger.step('Launch application');
  // App is launched automatically by Appium
  // Wait for initial screen
  await browser.pause(2000);
});

Given('I reset the application', async () => {
  Logger.step('Reset application');
  await browser.reloadSession();
});

When('I navigate back', async () => {
  Logger.step('Navigate back');
  await browser.back();
});

When('I close the application', async () => {
  Logger.step('Close application');
  const caps = browser.capabilities as Record<string, unknown>;
  const appId = (caps['appium:appPackage'] || caps['appium:bundleId']) as string;
  await browser.execute('mobile: terminateApp', { appId });
});

When('I put the application in background for {int} seconds', async (seconds: number) => {
  Logger.step(`Put app in background for ${seconds} seconds`);
  await browser.execute('mobile: backgroundApp', { seconds });
});

// ===========================================
// Wait Steps
// ===========================================

Given('I wait for {int} seconds', async (seconds: number) => {
  Logger.step(`Wait for ${seconds} seconds`);
  await browser.pause(seconds * 1000);
});

Then('I wait for element {string} to be displayed', async (selector: string) => {
  Logger.step(`Wait for element: ${selector}`);
  await WaitHelper.waitForDisplayed(selector, { timeout: 30000 });
});

Then('I wait for element {string} to disappear', async (selector: string) => {
  Logger.step(`Wait for element to disappear: ${selector}`);
  await WaitHelper.waitForNotDisplayed(selector, { timeout: 30000 });
});

// ===========================================
// Gesture Steps
// ===========================================

When('I swipe up', async () => {
  Logger.step('Swipe up');
  await GestureHelper.swipeUp();
});

When('I swipe down', async () => {
  Logger.step('Swipe down');
  await GestureHelper.swipeDown();
});

When('I swipe left', async () => {
  Logger.step('Swipe left');
  await GestureHelper.swipeLeft();
});

When('I swipe right', async () => {
  Logger.step('Swipe right');
  await GestureHelper.swipeRight();
});

When('I scroll to find text {string}', async (text: string) => {
  Logger.step(`Scroll to find text: ${text}`);
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  if (isAndroid) {
    const selector = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${text}"))`;
    await $(selector);
  } else {
    // iOS scroll using predicates
    let found = false;
    for (let i = 0; i < 10 && !found; i++) {
      const element = await $(`~${text}`);
      if (await element.isDisplayed()) {
        found = true;
      } else {
        await GestureHelper.swipeUp();
      }
    }
  }
});

// ===========================================
// Element Interaction Steps
// ===========================================

When('I tap on element {string}', async (selector: string) => {
  Logger.step(`Tap on element: ${selector}`);
  const element = await $(selector);
  await element.waitForDisplayed({ timeout: 10000 });
  await element.click();
});

When('I tap on text {string}', async (text: string) => {
  Logger.step(`Tap on text: ${text}`);
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const selector = isAndroid ? `android=new UiSelector().text("${text}")` : `-ios predicate string:label == "${text}"`;

  const element = await $(selector);
  await element.waitForDisplayed({ timeout: 10000 });
  await element.click();
});

When('I enter {string} into element {string}', async (text: string, selector: string) => {
  Logger.step(`Enter "${text}" into element: ${selector}`);
  const element = await $(selector);
  await element.waitForDisplayed({ timeout: 10000 });
  await element.clearValue();
  await element.setValue(text);
});

When('I clear element {string}', async (selector: string) => {
  Logger.step(`Clear element: ${selector}`);
  const element = await $(selector);
  await element.clearValue();
});

When('I long press on element {string}', async (selector: string) => {
  Logger.step(`Long press on element: ${selector}`);
  const element = await $(selector);
  await element.waitForDisplayed({ timeout: 10000 });
  await GestureHelper.longPress(element);
});

// ===========================================
// Assertion Steps
// ===========================================

Then('I should see element {string}', async (selector: string) => {
  Logger.step(`Verify element is displayed: ${selector}`);
  const element = await $(selector);
  await expect(element).toBeDisplayed();
});

Then('I should not see element {string}', async (selector: string) => {
  Logger.step(`Verify element is not displayed: ${selector}`);
  const element = await $(selector);
  await expect(element).not.toBeDisplayed();
});

Then('I should see text {string}', async (text: string) => {
  Logger.step(`Verify text is displayed: ${text}`);
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const selector = isAndroid
    ? `android=new UiSelector().textContains("${text}")`
    : `-ios predicate string:label CONTAINS "${text}"`;

  const element = await $(selector);
  await expect(element).toBeDisplayed();
});

Then('element {string} should have text {string}', async (selector: string, expectedText: string) => {
  Logger.step(`Verify element has text: ${expectedText}`);
  const element = await $(selector);
  await expect(element).toHaveText(expectedText);
});

Then('element {string} should contain text {string}', async (selector: string, expectedText: string) => {
  Logger.step(`Verify element contains text: ${expectedText}`);
  const element = await $(selector);
  const actualText = await element.getText();
  expect(actualText).toContain(expectedText);
});

Then('element {string} should be enabled', async (selector: string) => {
  Logger.step(`Verify element is enabled: ${selector}`);
  const element = await $(selector);
  await expect(element).toBeEnabled();
});

Then('element {string} should be disabled', async (selector: string) => {
  Logger.step(`Verify element is disabled: ${selector}`);
  const element = await $(selector);
  await expect(element).not.toBeEnabled();
});

// ===========================================
// Screenshot Steps
// ===========================================

Then('I take a screenshot named {string}', async (name: string) => {
  Logger.step(`Take screenshot: ${name}`);
  await AllureReporter.captureScreenshot(name);
});

// ===========================================
// Alert/Dialog Steps
// ===========================================

When('I accept the alert', async () => {
  Logger.step('Accept alert');
  await browser.acceptAlert();
});

When('I dismiss the alert', async () => {
  Logger.step('Dismiss alert');
  await browser.dismissAlert();
});

Then('I should see alert with text {string}', async (expectedText: string) => {
  Logger.step(`Verify alert text: ${expectedText}`);
  const alertText = await browser.getAlertText();
  expect(alertText).toContain(expectedText);
});

// ===========================================
// Keyboard Steps
// ===========================================

When('I hide the keyboard', async () => {
  Logger.step('Hide keyboard');
  try {
    await browser.hideKeyboard();
  } catch {
    Logger.debug('Keyboard not visible or already hidden');
  }
});

When('I press the enter key', async () => {
  Logger.step('Press enter key');
  await browser.keys('\n');
});

// ===========================================
// Context Steps (for hybrid apps)
// ===========================================

When('I switch to webview context', async () => {
  Logger.step('Switch to webview context');
  const contexts = await browser.getContexts();
  const webviewContext = contexts.find((ctx) => typeof ctx === 'string' && ctx.includes('WEBVIEW'));

  if (webviewContext) {
    await browser.switchContext(webviewContext as string);
    Logger.info(`Switched to context: ${webviewContext}`);
  } else {
    throw new Error('No webview context found');
  }
});

When('I switch to native context', async () => {
  Logger.step('Switch to native context');
  await browser.switchContext('NATIVE_APP');
});
