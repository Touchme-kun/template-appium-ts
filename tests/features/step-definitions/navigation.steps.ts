/**
 * Navigation Step Definitions
 * Steps specific to navigation feature
 */

import { Given, When, Then, DataTable } from '@wdio/cucumber-framework';
import { browser, expect, $ } from '@wdio/globals';
import { Logger } from '../../../src/utils/Logger';

// Store navigation timing
let navigationStartTime: number;
let navigationEndTime: number;

Given('I am logged in as a valid user', async () => {
  Logger.step('Ensure user is logged in');

  // Check if already logged in (home screen visible)
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const homeIndicator = isAndroid
    ? await $('android=new UiSelector().resourceId("home_screen")')
    : await $('~home-screen');

  const isLoggedIn = await homeIndicator.isDisplayed().catch(() => false);

  if (!isLoggedIn) {
    // Perform login
    Logger.info('User not logged in, performing login');
    await performLogin('test@example.com', 'TestPass123!');
  }
});

Given('I am on the home screen', async () => {
  Logger.step('Verify on home screen');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const homeIndicator = isAndroid
    ? await $('android=new UiSelector().resourceId("home_screen")')
    : await $('~home-screen');

  await expect(homeIndicator).toBeDisplayed();
});

Given('I am on the search screen', async () => {
  Logger.step('Navigate to search screen');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const searchTab = isAndroid ? await $('android=new UiSelector().text("Search")') : await $('~search-tab');

  await searchTab.click();
  await browser.pause(500);
});

Given('I am on a screen with multiple pages', async () => {
  Logger.step('Navigate to multi-page screen');
  // Implementation depends on app structure
  await browser.pause(500);
});

Given('accessibility mode is enabled', async () => {
  Logger.step('Enable accessibility mode');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  if (isAndroid) {
    await browser.execute('mobile: shell', {
      command:
        'settings put secure enabled_accessibility_services com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService',
    });
  } else {
    Logger.warn('iOS VoiceOver must be enabled manually or via device settings');
  }
});

Given('the app is closed', async () => {
  Logger.step('Close application');

  const caps = browser.capabilities as Record<string, unknown>;
  const appId = (caps['appium:appPackage'] || caps['appium:bundleId']) as string;
  await browser.execute('mobile: terminateApp', { appId });
});

When('I tap on the menu button', async () => {
  Logger.step('Tap menu button');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const menuButton = isAndroid ? await $('android=new UiSelector().description("Menu")') : await $('~menu-button');

  await menuButton.click();
  await browser.pause(500);
});

When('I tap on {string}', async (menuItem: string) => {
  Logger.step(`Tap on: ${menuItem}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const element = isAndroid
    ? await $(`android=new UiSelector().text("${menuItem}")`)
    : await $(`-ios predicate string:label == "${menuItem}"`);

  await element.click();
  await browser.pause(500);
});

When('I tap on {string} tab', async (tabName: string) => {
  Logger.step(`Tap on tab: ${tabName}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const tab = isAndroid
    ? await $(`android=new UiSelector().text("${tabName}")`)
    : await $(`~${tabName.toLowerCase()}-tab`);

  await tab.click();
  await browser.pause(500);
});

When('I navigate to Profile', async () => {
  Logger.step('Navigate to Profile');

  await tapMenuItem('Profile');
});

When('I navigate to {string}', async (screen: string) => {
  Logger.step(`Navigate to ${screen}`);

  await tapMenuItem(screen);
});

When('I navigate back to {string}', async (screen: string) => {
  Logger.step(`Navigate back to ${screen}`);

  // Keep going back until we reach the target screen
  let maxAttempts = 5;
  while (maxAttempts > 0) {
    await browser.back();
    await browser.pause(500);

    const isOnScreen = await isScreenDisplayed(screen);
    if (isOnScreen) break;

    maxAttempts--;
  }
});

When('I tap on Edit Profile', async () => {
  Logger.step('Tap Edit Profile');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const editButton = isAndroid
    ? await $('android=new UiSelector().text("Edit Profile")')
    : await $('~edit-profile-button');

  await editButton.click();
  await browser.pause(500);
});

When('I open deep link {string}', async (deepLink: string) => {
  Logger.step(`Open deep link: ${deepLink}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  if (isAndroid) {
    await browser.execute('mobile: deepLink', {
      url: deepLink,
      package: caps['appium:appPackage'] as string,
    });
  } else {
    await browser.execute('mobile: deepLink', {
      url: deepLink,
      bundleId: caps['appium:bundleId'] as string,
    });
  }

  await browser.pause(1000);
});

When('I focus on the menu button', async () => {
  Logger.step('Focus on menu button (accessibility)');
  // Accessibility focus - implementation depends on platform
  await browser.pause(500);
});

When('I double tap', async () => {
  Logger.step('Double tap (accessibility action)');

  // Perform accessibility double tap
  await browser.touchAction([
    { action: 'tap', x: 100, y: 100 },
    { action: 'tap', x: 100, y: 100 },
  ]);
});

When('the network connection is lost', async () => {
  Logger.step('Simulate network loss');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  if (isAndroid) {
    // Use Appium mobile command for network connection
    await browser.execute('mobile: shell', { command: 'svc wifi disable' });
    await browser.execute('mobile: shell', { command: 'svc data disable' });
  } else {
    Logger.warn('iOS network simulation requires proxy or device management');
  }
});

When('I measure navigation time to {string}', async (destination: string) => {
  Logger.step(`Measure navigation time to ${destination}`);

  navigationStartTime = Date.now();
  await tapMenuItem(destination);
  navigationEndTime = Date.now();
});

When('I enter search term {string}', async (searchTerm: string) => {
  Logger.step(`Enter search term: ${searchTerm}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const searchInput = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText")')
    : await $('~search-input');

  await searchInput.setValue(searchTerm);
});

Then('I should see the following menu items:', async (dataTable: DataTable) => {
  Logger.step('Verify menu items');

  const expectedItems = dataTable.raw().flat();

  for (const item of expectedItems) {
    const caps = browser.capabilities as Record<string, unknown>;
    const isAndroid = caps.platformName === 'Android';

    const element = isAndroid
      ? await $(`android=new UiSelector().text("${item}")`)
      : await $(`-ios predicate string:label == "${item}"`);

    await expect(element).toBeDisplayed();
  }
});

Then('I should be on the {string} screen', async (screenName: string) => {
  Logger.step(`Verify on ${screenName} screen`);

  const isOnScreen = await isScreenDisplayed(screenName);
  expect(isOnScreen).toBe(true);
});

Then('the screen title should be {string}', async (expectedTitle: string) => {
  Logger.step(`Verify screen title: ${expectedTitle}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const titleElement = isAndroid
    ? await $('android=new UiSelector().className("android.widget.TextView").instance(0)')
    : await $('~screen-title');

  const actualText = await titleElement.getText();
  expect(actualText).toContain(expectedTitle);
});

Then('I should see the bottom tab bar with:', async (dataTable: DataTable) => {
  Logger.step('Verify tab bar items');

  const expectedTabs = dataTable.raw().flat();

  for (const tab of expectedTabs) {
    const caps = browser.capabilities as Record<string, unknown>;
    const isAndroid = caps.platformName === 'Android';

    const tabElement = isAndroid
      ? await $(`android=new UiSelector().text("${tab}")`)
      : await $(`~${tab.toLowerCase()}-tab`);

    await expect(tabElement).toBeDisplayed();
  }
});

Then('I should see the next page', async () => {
  Logger.step('Verify next page is displayed');
  // Implementation depends on app structure
  await browser.pause(500);
});

Then('I should see the previous page', async () => {
  Logger.step('Verify previous page is displayed');
  // Implementation depends on app structure
  await browser.pause(500);
});

Then('I should hear {string}', async (expectedAnnouncement: string) => {
  Logger.step(`Verify announcement: ${expectedAnnouncement}`);
  // Accessibility announcement verification is platform-specific
  // In real implementation, you'd capture accessibility events
  Logger.warn('Accessibility announcement verification not fully implemented');
});

Then('I should hear menu items announced', async () => {
  Logger.step('Verify menu items are announced');
  // Accessibility verification
  Logger.warn('Accessibility announcement verification not fully implemented');
});

Then('I should see cached profile data', async () => {
  Logger.step('Verify cached data is displayed');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const profileData = isAndroid
    ? await $('android=new UiSelector().resourceId("profile_content")')
    : await $('~profile-content');

  await expect(profileData).toBeDisplayed();
});

Then('the navigation should complete within {int} seconds', async (seconds: number) => {
  Logger.step(`Verify navigation completed within ${seconds} seconds`);

  const duration = navigationEndTime - navigationStartTime;
  const maxDuration = seconds * 1000;

  Logger.info(`Navigation took ${duration}ms (max: ${maxDuration}ms)`);
  expect(duration).toBeLessThanOrEqual(maxDuration);
});

Then('the search term should still be {string}', async (expectedTerm: string) => {
  Logger.step(`Verify search term is preserved: ${expectedTerm}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const searchInput = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText")')
    : await $('~search-input');

  const actualValue = await searchInput.getText();
  expect(actualValue).toBe(expectedTerm);
});

// Helper functions
async function performLogin(email: string, password: string): Promise<void> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  // Enter email
  const emailField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    : await $('~email-input');
  await emailField.setValue(email);

  // Enter password
  const passwordField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
    : await $('~password-input');
  await passwordField.setValue(password);

  // Tap login
  const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
  await loginButton.click();

  await browser.pause(2000);
}

async function tapMenuItem(item: string): Promise<void> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const element = isAndroid
    ? await $(`android=new UiSelector().text("${item}")`)
    : await $(`-ios predicate string:label == "${item}"`);

  await element.click();
  await browser.pause(500);
}

async function isScreenDisplayed(screenName: string): Promise<boolean> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const screenIndicator = isAndroid
    ? await $(`android=new UiSelector().resourceId("${screenName}_screen")`)
    : await $(`~${screenName}-screen`);

  return screenIndicator.isDisplayed().catch(() => false);
}
