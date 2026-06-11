import { expect } from '@wdio/globals';
import { BaseTest } from '../../../core/BaseTest';
import { ExampleScreen } from '../../../screens/android';
import exampleTd from '../../data/example.json';

/**
 * Regression Test Suite Template
 *
 * This file demonstrates the recommended structure for regression test suites.
 *
 * Replace:
 * - `ExampleScreen` with your actual screen objects
 * - `exampleTd` with your actual test data file
 * - Suite/test names with your feature names
 * - The `before` block with your app's authentication/setup flow
 *
 * Regression tests verify that existing functionality still works correctly
 * after new changes are introduced. They are typically broader than smoke tests
 * but more granular than E2E tests — each `it` block covers one specific
 * behaviour or edge case.
 */

describe('Regression Test Suite (Android)', () => {

  let exampleScreen: ExampleScreen;

  // ─── Suite Setup ────────────────────────────────────────────────────────────
  // Runs once before all tests in this suite.
  // Use this for one-time setup such as login that all regression tests share.

  before(async () => {
    await BaseTest.initializeSuite('Regression Test Suite');
    exampleScreen = new ExampleScreen();

    // TODO: Replace with your app's authentication/setup flow
    // Example:
    // await loginScreen.enterCredentials(exampleTd.user.mobile);
    // await loginScreen.tapLoginButton();
    // await otpScreen.enterOTP(exampleTd.user.otp);
  });

  // ─── Test Setup ─────────────────────────────────────────────────────────────
  // Runs before each test. Reset to a known starting state.

  beforeEach(async () => {
    await BaseTest.setupTest('Regression Test', 'Regression Test Suite');
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
    await BaseTest.cleanupSuite('Regression Test Suite');
    await BaseTest.resetApp();
  });

  // ─── Tests ───────────────────────────────────────────────────────────────────
  // Group related regression cases under a describe block per feature/module.
  // Each it() should cover one specific behaviour or edge case.

  describe('Feature A — Core Behaviour', () => {

    it('should display the correct initial state', async () => {
      // Assert
      await expect(await exampleScreen.verifyScreenLoaded()).toBe(true);
    });

    it('should perform primary action and return expected result', async () => {
      // Arrange
      const testData = { value: exampleTd.example.value };

      // Act
      await exampleScreen.performPrimaryAction(testData.value);

      // Assert
      await expect(await exampleScreen.verifyActionSuccess()).toBe(true);
    });

  });

  describe('Feature A — Edge Cases', () => {

    it('should handle empty input gracefully', async () => {
      // Act
      await exampleScreen.performPrimaryAction('');

      // Assert
      await expect(await exampleScreen.verifyErrorDisplayed()).toBe(true);
    });

    it('should handle invalid input gracefully', async () => {
      // Arrange
      const invalidData = exampleTd.example.invalidValue;

      // Act
      await exampleScreen.performPrimaryAction(invalidData);

      // Assert
      await expect(await exampleScreen.verifyErrorDisplayed()).toBe(true);
    });

  });

});