/**
 * Registration Step Definitions
 * Steps specific to user registration feature
 */

import { Given, When, Then, DataTable } from '@wdio/cucumber-framework';
import { browser, expect, $ } from '@wdio/globals';
import { Logger } from '../../../src/utils/Logger';
import { TestDataFactory } from '../../../src/utils/TestDataFactory';

// Store test data between steps
let registrationData: Record<string, string> = {};

Given('I am on the registration screen', async () => {
  Logger.step('Navigate to registration screen');
  // Navigate to registration - implementation depends on app structure
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const registerLink = isAndroid
    ? await $('android=new UiSelector().textContains("Register")')
    : await $('-ios predicate string:label CONTAINS "Register"');

  if (await registerLink.isDisplayed()) {
    await registerLink.click();
  }

  // Wait for registration form
  await browser.pause(1000);
});

When('I enter the following registration details:', async (dataTable: DataTable) => {
  Logger.step('Enter registration details from data table');

  const data = dataTable.rowsHash();
  registrationData = data;

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  for (const [field, value] of Object.entries(data)) {
    Logger.debug(`Entering ${field}: ${value}`);

    // Find field by label/hint/accessibility id
    const fieldSelector = isAndroid
      ? `android=new UiSelector().textContains("${field}")`
      : `-ios predicate string:label CONTAINS "${field}"`;

    const inputField = await $(fieldSelector);

    if (await inputField.isDisplayed()) {
      // Find associated input field (might be sibling or next element)
      await inputField.click();
      await browser.keys(value);
      await browser.hideKeyboard?.();
    }
  }
});

When('I enter email {string}', async (email: string) => {
  Logger.step(`Enter email: ${email}`);
  registrationData['email'] = email;

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const emailField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    : await $('~email-input');

  await emailField.clearValue();
  await emailField.setValue(email);
});

When('I enter password {string}', async (password: string) => {
  Logger.step('Enter password');
  registrationData['password'] = password;

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const passwordField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
    : await $('~password-input');

  await passwordField.clearValue();
  await passwordField.setValue(password);
});

When('I enter confirm password {string}', async (confirmPassword: string) => {
  Logger.step('Enter confirm password');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const confirmField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(2)')
    : await $('~confirm-password-input');

  await confirmField.clearValue();
  await confirmField.setValue(confirmPassword);
});

When('I enter first name with {int} characters', async (length: number) => {
  Logger.step(`Enter first name with ${length} characters`);

  // Generate a string of specified length
  const firstName = 'a'.repeat(length);
  registrationData['firstName'] = firstName;

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const nameField = isAndroid
    ? await $('android=new UiSelector().resourceId("firstName")')
    : await $('~first-name-input');

  await nameField.clearValue();
  await nameField.setValue(firstName);
});

When('I accept the terms and conditions', async () => {
  Logger.step('Accept terms and conditions');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const checkbox = isAndroid
    ? await $('android=new UiSelector().className("android.widget.CheckBox")')
    : await $('~terms-checkbox');

  if (await checkbox.isDisplayed()) {
    const isChecked = await checkbox.getAttribute('checked');
    if (isChecked !== 'true') {
      await checkbox.click();
    }
  }
});

When('I tap the register button', async () => {
  Logger.step('Tap register button');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const registerButton = isAndroid ? await $('android=new UiSelector().text("Register")') : await $('~register-button');

  await registerButton.click();
});

When('I complete registration', async () => {
  Logger.step('Complete registration with entered data');

  // Accept terms if visible
  await acceptTermsIfVisible();

  // Tap register button
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const registerButton = isAndroid ? await $('android=new UiSelector().text("Register")') : await $('~register-button');

  await registerButton.click();
});

When('I complete registration with valid details', async () => {
  Logger.step('Complete registration with valid details');

  // Fill remaining required fields with valid data
  const user = TestDataFactory.createUser();

  if (!registrationData['email']) {
    await enterEmail(user.email);
  }
  if (!registrationData['password']) {
    await enterPassword(user.password);
  }

  await acceptTermsIfVisible();

  // Tap register
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const registerButton = isAndroid ? await $('android=new UiSelector().text("Register")') : await $('~register-button');

  await registerButton.click();
});

Then('I should see the welcome screen', async () => {
  Logger.step('Verify welcome screen is displayed');

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const welcomeElement = isAndroid
    ? await $('android=new UiSelector().textContains("Welcome")')
    : await $('-ios predicate string:label CONTAINS "Welcome"');

  await expect(welcomeElement).toBeDisplayed();
});

Then('I should see error message {string}', async (errorMessage: string) => {
  Logger.step(`Verify error message: ${errorMessage}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const errorElement = isAndroid
    ? await $(`android=new UiSelector().textContains("${errorMessage}")`)
    : await $(`-ios predicate string:label CONTAINS "${errorMessage}"`);

  await expect(errorElement).toBeDisplayed();
});

Then('I should see {string}', async (expectedText: string) => {
  Logger.step(`Verify text is displayed: ${expectedText}`);

  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const element = isAndroid
    ? await $(`android=new UiSelector().textContains("${expectedText}")`)
    : await $(`-ios predicate string:label CONTAINS "${expectedText}"`);

  await expect(element).toBeDisplayed();
});

// Helper functions
async function enterEmail(email: string): Promise<void> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const emailField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    : await $('~email-input');

  await emailField.clearValue();
  await emailField.setValue(email);
}

async function enterPassword(password: string): Promise<void> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  const passwordField = isAndroid
    ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
    : await $('~password-input');

  await passwordField.clearValue();
  await passwordField.setValue(password);
}

async function acceptTermsIfVisible(): Promise<void> {
  const caps = browser.capabilities as Record<string, unknown>;
  const isAndroid = caps.platformName === 'Android';

  try {
    const checkbox = isAndroid
      ? await $('android=new UiSelector().className("android.widget.CheckBox")')
      : await $('~terms-checkbox');

    if (await checkbox.isDisplayed()) {
      const isChecked = await checkbox.getAttribute('checked');
      if (isChecked !== 'true') {
        await checkbox.click();
      }
    }
  } catch {
    Logger.debug('Terms checkbox not found or not visible');
  }
}
