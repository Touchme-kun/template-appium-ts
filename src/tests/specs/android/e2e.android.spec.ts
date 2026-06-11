import { expect } from '@wdio/globals';
import { BaseTest } from '../../../core/BaseTest';
import { ExampleScreen } from '../../../screens/android';
import exampleTd from '../../data/example.json';

/**
 * E2E Test Suite Template
 *
 * This file demonstrates the recommended structure for end-to-end test suites.
 *
 * Replace:
 * - `ExampleScreen` with your actual screen objects
 * - `exampleTd` with your actual test data file
 * - Suite/test names with your feature names
 * - The `before` block login flow with your app's authentication flow
 *
 * E2E tests cover full user journeys across multiple screens.
 * Each `it` block should represent one complete user action/outcome.
 */

describe('E2E Test Suite (Android)', () => {

  let exampleScreen: ExampleScreen;

  // ─── Suite Setup ────────────────────────────────────────────────────────────
  // Runs once before all tests in this suite.
  // Use this for one-time app setup such as login or initial navigation
  // that all tests in this suite depend on.

  before(async () => {
    await BaseTest.initializeSuite('E2E Test Suite');
    exampleScreen = new ExampleScreen();

    // TODO: Replace with your app's authentication/setup flow
    // Example:
    // await loginScreen.enterCredentials(exampleTd.user.mobile);
    // await loginScreen.tapLoginButton();
    // await otpScreen.enterOTP(exampleTd.user.otp);
  });

  // ─── Test Setup ─────────────────────────────────────────────────────────────
  // Runs before each individual test.
  // Use this to reset app to a known starting state before each test.

  beforeEach(async () => {
    await BaseTest.setupTest('E2E Test', 'E2E Test Suite');
    await BaseTest.waitForAppReady();

    // TODO: Navigate to your starting screen
    // Example: await pinScreen.enterPin(exampleTd.user.pin);
    // Example: await expect(await dashboardScreen.verifyDashboardLoaded()).toBe(true);
  });

  // ─── Test Teardown ───────────────────────────────────────────────────────────
  afterEach(async function () {
    await BaseTest.teardownTest(this.currentTest?.state === 'passed');
  });

  // ─── Suite Cleanup ───────────────────────────────────────────────────────────
  after(async () => {
    await BaseTest.cleanupSuite('E2E Test Suite');
    await BaseTest.resetApp();
  });

  // ─── Tests ───────────────────────────────────────────────────────────────────

  describe('Happy Path', () => {

    it('should complete the primary user flow successfully', async () => {
      // Arrange
      const testData = {
        value: exampleTd.example.value,
      };

      // Act
      await exampleScreen.performPrimaryAction(testData.value);

      // Assert
      await expect(await exampleScreen.verifyActionSuccess()).toBe(true);
    });

  });

  describe('Negative Path', () => {

    it('should show error when action is performed with invalid data', async () => {
      // Arrange
      const invalidData = exampleTd.example.invalidValue;

      // Act
      await exampleScreen.performPrimaryAction(invalidData);

      // Assert
      await expect(await exampleScreen.verifyErrorDisplayed()).toBe(true);
    });

  });

});