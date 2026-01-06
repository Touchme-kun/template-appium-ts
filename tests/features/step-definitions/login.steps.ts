import { expect } from '@wdio/globals';
import { Given, When, Then } from '@wdio/cucumber-framework';
import { loginScreen } from '../../../src/screens/LoginScreen';
import { homeScreen } from '../../../src/screens/HomeScreen';
import { Logger } from '../../../src/utils/Logger';

/**
 * Login Step Definitions
 * Step implementations for login.feature
 */

// ===========================================
// Given Steps
// ===========================================

Given('I am on the login screen', async () => {
  Logger.step('Navigate to login screen');
  await loginScreen.waitForScreen();
});

// ===========================================
// When Steps
// ===========================================

When('I enter username {string}', async (username: string) => {
  Logger.step('Enter username', username);
  await loginScreen.enterUsername(username);
});

When('I enter password {string}', async (password: string) => {
  Logger.step('Enter password');
  await loginScreen.enterPassword(password);
});

When('I tap the login button', async () => {
  Logger.step('Tap login button');
  await loginScreen.tapLoginButton();
});

When('I tap the forgot password link', async () => {
  Logger.step('Tap forgot password link');
  await loginScreen.tapForgotPassword();
});

When('I tap the sign up link', async () => {
  Logger.step('Tap sign up link');
  await loginScreen.tapSignUp();
});

// ===========================================
// Then Steps
// ===========================================

Then('I should see the home screen', async () => {
  Logger.step('Verify home screen is displayed');
  await homeScreen.waitForScreen();
  const isDisplayed = await homeScreen.isScreenDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('I should see welcome message {string}', async (expectedMessage: string) => {
  Logger.step('Verify welcome message', expectedMessage);
  await homeScreen.verifyWelcomeMessage(expectedMessage);
});

Then('I should see error message {string}', async (expectedError: string) => {
  Logger.step('Verify error message', expectedError);
  await loginScreen.verifyErrorMessage(expectedError);
});

Then('I should see the forgot password screen', async () => {
  Logger.step('Verify forgot password screen is displayed');
  // TODO: Implement when ForgotPasswordScreen is created
  // await forgotPasswordScreen.waitForScreen();
});

Then('I should see the sign up screen', async () => {
  Logger.step('Verify sign up screen is displayed');
  // TODO: Implement when SignUpScreen is created
  // await signUpScreen.waitForScreen();
});
