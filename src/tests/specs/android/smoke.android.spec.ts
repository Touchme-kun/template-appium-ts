import { expect } from '@wdio/globals';
import { BaseTest } from '../../../core/BaseTest';
import { ExampleScreen } from '../../../screens/android';
import exampleTd from '../../data/example.json';

/**
 * Smoke Test Suite Template
 *
 * This file demonstrates the recommended structure for smoke test suites.
 *
 * Replace:
 * - `ExampleScreen` with your actual screen objects
 * - `exampleTd` with your actual test data file
 * - Suite/test names with your feature names
 * - The `before` block with your app's authentication/setup flow
 *
 * Smoke tests are the smallest, fastest subset of your test suite.
 * They verify that the app launches, core navigation works, and the
 * most critical user-facing features are not broken. If smoke fails,
 * there is no point running regression or E2E.
 *
 * Keep this suite:
 * - Fast (target < 2 minutes total)
 * - Focused on critical path only
 * - Free of edge cases (those belong in regression)
 */

describe('Smoke Test Suite (Android)', () => {

  let exampleScreen: ExampleScreen;

  // ─── Suite Setup ────────────────────────────────────────────────────────────
  // Runs once before all tests in this suite.
  // Use this for one-time setup such as login that all smoke tests share.

  before(async () => {
    await BaseTest.initializeSuite('Smoke Test Suite');
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
    await BaseTest.setupTest('Smoke Test', 'Smoke Test Suite');
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
    await BaseTest.cleanupSuite('Smoke Test Suite');
    await BaseTest.resetApp();
  });

  // ─── Tests ───────────────────────────────────────────────────────────────────
  // Keep smoke tests to critical path only.
  // Typically: app launches → user can authenticate → landing screen loads.

  it('should launch the app and display the initial screen', async () => {
    // Assert
    await expect(await exampleScreen.verifyScreenLoaded()).toBe(true);
  });

  it('should perform the primary action successfully', async () => {
    // Arrange
    const testData = { value: exampleTd.example.value };

    // Act
    await exampleScreen.performPrimaryAction(testData.value);

    // Assert
    await expect(await exampleScreen.verifyActionSuccess()).toBe(true);
  });

});