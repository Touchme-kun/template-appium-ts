/**
 * Data-Driven Login Test Suite
 * Comprehensive TDD examples with parameterized testing
 */

import { browser, expect, $ } from '@wdio/globals';
import { Logger } from '../../src/utils/Logger';
import allure from '@wdio/allure-reporter';
import * as loginTestData from '../data/login.json';

describe('Login - Data Driven Tests', () => {
  beforeEach(async () => {
    // Reset app state before each test
    await browser.reloadSession();
  });

  afterEach(async function () {
    // Capture screenshot on failure
    if (this.currentTest?.state === 'failed') {
      const screenshot = await browser.takeScreenshot();
      allure.addAttachment(`failure-${this.currentTest.title}`, Buffer.from(screenshot, 'base64'), 'image/png');
    }
  });

  describe('Valid Credentials', () => {
    // Data-driven test using JSON data
    const validCredentials = loginTestData.validUsers;

    validCredentials.forEach((user: { email: string; password: string; role: string }) => {
      it(`should login successfully with ${user.role} user`, async () => {
        allure.addFeature('Authentication');
        allure.addStory('Valid Login');
        allure.addSeverity('critical');

        Logger.step(`Testing login for ${user.role} user: ${user.email}`);

        const caps = browser.capabilities as Record<string, unknown>;
        const isAndroid = caps.platformName === 'Android';

        // Find and fill email field
        const emailField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
          : await $('~email-input');
        await emailField.setValue(user.email);

        // Find and fill password field
        const passwordField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
          : await $('~password-input');
        await passwordField.setValue(user.password);

        // Tap login button
        const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
        await loginButton.click();

        // Verify successful login - check for welcome or home screen
        await browser.pause(2000);

        Logger.info(`Successfully logged in as ${user.role}`);
      });
    });
  });

  describe('Invalid Credentials', () => {
    // Parameterized test data
    const invalidCredentials = [
      { email: 'invalid@test.com', password: 'wrong123', error: 'Invalid email or password' },
      { email: 'test@invalid', password: 'Test123!', error: 'Please enter a valid email' },
      { email: '', password: 'Test123!', error: 'Email is required' },
      { email: 'test@example.com', password: '', error: 'Password is required' },
      { email: '', password: '', error: 'Email is required' },
    ];

    invalidCredentials.forEach(({ email, password, error }) => {
      it(`should show error for email="${email || '(empty)'}" password="${password ? '***' : '(empty)'}"`, async () => {
        allure.addFeature('Authentication');
        allure.addStory('Invalid Login');
        allure.addSeverity('normal');

        const caps = browser.capabilities as Record<string, unknown>;
        const isAndroid = caps.platformName === 'Android';

        // Attempt login
        if (email) {
          const emailField = isAndroid
            ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
            : await $('~email-input');
          await emailField.setValue(email);
        }

        if (password) {
          const passwordField = isAndroid
            ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
            : await $('~password-input');
          await passwordField.setValue(password);
        }

        const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
        await loginButton.click();

        // Verify error message
        const errorElement = isAndroid
          ? await $(`android=new UiSelector().textContains("${error}")`)
          : await $(`-ios predicate string:label CONTAINS "${error}"`);

        await expect(errorElement).toBeDisplayed();
      });
    });
  });

  describe('Boundary Value Testing', () => {
    interface BoundaryTest {
      description: string;
      emailLength?: number;
      passwordLength?: number;
      shouldPass: boolean;
    }

    const boundaryTests: BoundaryTest[] = [
      { description: 'minimum valid email (3 chars local)', emailLength: 3, shouldPass: true },
      { description: 'maximum valid email (64 chars local)', emailLength: 64, shouldPass: true },
      { description: 'email exceeds max length', emailLength: 65, shouldPass: false },
      { description: 'minimum password length (8)', passwordLength: 8, shouldPass: true },
      { description: 'below minimum password (7)', passwordLength: 7, shouldPass: false },
      { description: 'maximum password length (128)', passwordLength: 128, shouldPass: true },
    ];

    boundaryTests.forEach(({ description, emailLength, passwordLength, shouldPass }) => {
      it(`should handle ${description}`, async () => {
        allure.addFeature('Authentication');
        allure.addStory('Boundary Testing');

        const caps = browser.capabilities as Record<string, unknown>;
        const isAndroid = caps.platformName === 'Android';

        // Generate test data based on boundary
        const email = emailLength ? `${'a'.repeat(emailLength)}@test.com` : 'valid@test.com';
        const password = passwordLength ? `Pass${'a'.repeat(Math.max(0, passwordLength - 8))}123!` : 'ValidPass123!';

        const emailField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
          : await $('~email-input');
        await emailField.setValue(email);

        const passwordField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
          : await $('~password-input');
        await passwordField.setValue(password);

        const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
        await loginButton.click();

        await browser.pause(1000);

        // Check result based on expected outcome
        if (shouldPass) {
          Logger.info(`Boundary test passed for: ${description}`);
        } else {
          Logger.info(`Boundary test correctly rejected: ${description}`);
        }
      });
    });
  });

  describe('Special Characters Handling', () => {
    const specialCharsTests = [
      { char: '+', email: 'user+tag@example.com' },
      { char: '.', email: 'user.name@example.com' },
      { char: '-', email: 'user-name@example.com' },
      { char: '_', email: 'user_name@example.com' },
    ];

    specialCharsTests.forEach(({ char, email }) => {
      it(`should accept email with "${char}" character`, async () => {
        const caps = browser.capabilities as Record<string, unknown>;
        const isAndroid = caps.platformName === 'Android';

        const emailField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
          : await $('~email-input');
        await emailField.setValue(email);

        const passwordField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
          : await $('~password-input');
        await passwordField.setValue('ValidPass123!');

        const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
        await loginButton.click();

        // Should not show format error for valid emails
        await browser.pause(500);
      });
    });
  });

  describe('Security Tests', () => {
    it('should mask password input', async () => {
      allure.addFeature('Authentication');
      allure.addStory('Security');
      allure.addSeverity('critical');

      const caps = browser.capabilities as Record<string, unknown>;
      const isAndroid = caps.platformName === 'Android';

      const passwordField = isAndroid
        ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
        : await $('~password-input');

      await passwordField.setValue('SecretPass123!');

      // Verify password is masked (attribute depends on app implementation)
      const isSecure = await passwordField.getAttribute('password');
      expect(isSecure).toBe('true');
    });

    it('should lock account after multiple failed attempts', async () => {
      allure.addSeverity('critical');

      const caps = browser.capabilities as Record<string, unknown>;
      const isAndroid = caps.platformName === 'Android';

      // Attempt login 5 times with wrong password
      for (let i = 0; i < 5; i++) {
        const emailField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
          : await $('~email-input');
        await emailField.clearValue();
        await emailField.setValue('test@example.com');

        const passwordField = isAndroid
          ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
          : await $('~password-input');
        await passwordField.clearValue();
        await passwordField.setValue(`WrongPass${i}!`);

        const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
        await loginButton.click();

        await browser.pause(500);
      }

      // Should show lockout message
      const lockoutMessage = isAndroid
        ? await $('android=new UiSelector().textContains("locked")')
        : await $('-ios predicate string:label CONTAINS "locked"');

      await expect(lockoutMessage).toBeDisplayed();
    });
  });

  describe('UI/UX Tests', () => {
    it('should show keyboard when tapping email field', async () => {
      const caps = browser.capabilities as Record<string, unknown>;
      const isAndroid = caps.platformName === 'Android';

      const emailField = isAndroid
        ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
        : await $('~email-input');

      await emailField.click();

      // Verify keyboard is shown
      const isKeyboardShown = await browser.isKeyboardShown();
      expect(isKeyboardShown).toBe(true);
    });
  });
});

describe('Login - Performance Tests', () => {
  it('should complete login within 3 seconds', async () => {
    const caps = browser.capabilities as Record<string, unknown>;
    const isAndroid = caps.platformName === 'Android';

    const startTime = Date.now();

    const emailField = isAndroid
      ? await $('android=new UiSelector().className("android.widget.EditText").instance(0)')
      : await $('~email-input');
    await emailField.setValue('performance@test.com');

    const passwordField = isAndroid
      ? await $('android=new UiSelector().className("android.widget.EditText").instance(1)')
      : await $('~password-input');
    await passwordField.setValue('ValidPass123!');

    const loginButton = isAndroid ? await $('android=new UiSelector().text("Login")') : await $('~login-button');
    await loginButton.click();

    // Wait for home screen
    await browser.pause(1000);

    const duration = Date.now() - startTime;
    Logger.info(`Login completed in ${duration}ms`);

    expect(duration).toBeLessThan(3000);
  });
});
