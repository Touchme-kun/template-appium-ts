# Best Practices Guide

This guide outlines the best practices for writing maintainable, reliable, and efficient mobile automation tests.

## Table of Contents

1. [General Principles](#general-principles)
2. [Element Locators](#element-locators)
3. [Page Object Model](#page-object-model)
4. [Test Design](#test-design)
5. [Wait Strategies](#wait-strategies)
6. [Test Data Management](#test-data-management)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Code Review Checklist](#code-review-checklist)

---

## General Principles

### ✅ DO

- Write tests that are **independent** and can run in any order
- Use **meaningful names** for tests, methods, and variables
- Keep tests **focused** on one functionality
- Use **version control** for all test code
- **Document** complex logic and business rules
- **Clean up** test data after each test
- Use **configuration** for environment-specific values
- Log all screen actions via `Logger.step()` for traceability

### ❌ DON'T

- Create tests with dependencies on other tests
- Use hardcoded values (credentials, URLs, IDs)
- Write overly long test methods
- Ignore failing tests
- Skip error handling
- Commit sensitive data (passwords, API keys)
- Use `console.log` — use `Logger.*` instead

---

## Element Locators

### Locator Priority (Best to Worst)

1. **Accessibility ID** (Best)
   ```typescript
   // Preferred — works cross-platform
   await $('~login-button');
   ```

2. **UIAutomator2 Resource ID** (Android)
   ```typescript
   await $('android=new UiSelector().resourceId("com.app:id/login")');
   ```

3. **UIAutomator2 Text** (Android)
   ```typescript
   await $('android=new UiSelector().text("Login")');
   ```

4. **iOS Predicate** (iOS)
   ```typescript
   await $('-ios predicate string:name == "loginButton"');
   ```

5. **XPath** (Avoid if possible)
   ```typescript
   // Use only as last resort
   await $('//android.widget.Button[@text="Login"]');
   ```

### ✅ DO

```typescript
// Good: UIAutomator text selector
private readonly SUBMIT_SELECTOR = 'android=new UiSelector().text("Submit")';

// Good: Resource ID
private readonly SCREEN_LOCATOR = 'android=new UiSelector().resourceId("SCREEN_ID")';

// Good: Accessibility ID (cross-platform)
private readonly NEXT_BUTTON = '~Next';

// Good: Platform-specific via ScreenFactory
const locator = ScreenFactory.getLocator(
  'android=new UiSelector().text("Confirm")',
  '~confirmButton'
);
```

### ❌ DON'T

```typescript
// Bad: Fragile XPath with indexes
get button() {
  return $('//android.view.ViewGroup[3]/android.widget.Button[2]');
}

// Bad: Index-based selectors
get item() {
  return $$('~list-item')[2]; // Brittle if order changes
}
```

---

## Page Object Model

### Screen Class Structure

```typescript
// src/screens/android/ExampleScreen.ts
import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';

export class ExampleScreen extends BaseScreen {
  // 1. Screen locator (required — uniquely identifies the screen)
  protected get screenLocator(): string {
    return '~example-screen';
  }

  // 2. Element selectors (private readonly strings — not element getters)
  private readonly SUBMIT_BUTTON = '~submit-button';
  private readonly TEXT_INPUT = '~text-input';
  private readonly ERROR_MESSAGE = '~error-message';

  // 3. Action methods (public, async, logged)
  async enterValue(value: string): Promise<void> {
    Logger.step(`Entering value: ${value}`);
    await this.enterText(this.TEXT_INPUT, value);
  }

  async tapSubmit(): Promise<void> {
    Logger.step('Tapping submit button');
    await this.tap(this.SUBMIT_BUTTON);
  }

  // 4. Composite actions
  async submitForm(value: string): Promise<void> {
    await this.enterValue(value);
    await this.tapSubmit();
  }

  // 5. Verification methods (return boolean)
  async verifyScreenLoaded(): Promise<boolean> {
    Logger.step('Verifying screen is displayed');
    await this.waitForScreen({
      timeout: 30000,
      timeoutMsg: 'Example screen not displayed within 30s',
    });
    return true;
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isElementDisplayed(this.ERROR_MESSAGE);
  }
}
```

### ✅ DO

- Keep screens focused on a single screen/view
- Use `private readonly` string constants for selectors
- Use descriptive method names that reflect user actions
- Return `Promise<void>` for actions, `Promise<boolean>` for verifications
- Log all public actions with `Logger.step()` or `Logger.action()`
- Call `waitForScreen()` in verification methods, not action methods

### ❌ DON'T

- Add test assertions (`expect`) inside screen classes
- Create screens that span multiple pages
- Use raw `console.log` — always `Logger.*`
- Use `browser.pause()` inside screen methods
- Expose raw WebdriverIO elements from screen classes

---

## Test Design

### Test Structure (AAA Pattern)

```typescript
it('should submit form successfully with valid data', async () => {
  // Arrange
  const testData = { value: 'sample input' };

  // Act
  await formScreen.submitForm(testData.value);

  // Assert
  await expect(await formScreen.verifyActionSuccess()).toBe(true);
});
```

### Test Naming Conventions

```typescript
// Pattern: should [expected behavior] when [condition]
describe('Feature Name - Login Flow', () => {
  it('should login successfully with valid credentials', async () => {});
  it('should show error when OTP is incorrect', async () => {});
  it('should navigate to dashboard after successful login', async () => {});
  it('should display error when PIN is incorrect', async () => {});
});
```

### Test Independence

```typescript
// ✅ Good: Each test resets to a known state
beforeEach(async () => {
  await BaseTest.setupTest('Test Name', 'Feature Test Suite');
  await BaseTest.waitForAppReady();
  // Navigate to starting screen
});

after(async () => {
  await BaseTest.cleanupSuite('Feature Test Suite');
  await BaseTest.resetApp(); // Clean for next suite
});

// ❌ Bad: Tests depend on previous test state
describe('User Flow', () => {
  it('step 1: login', async () => {});
  it('step 2: do action', async () => {}); // Assumes step 1 passed!
  it('step 3: verify result', async () => {}); // Assumes step 2 passed!
});
```

---

## Wait Strategies

### Explicit Waits (Preferred)

```typescript
// Via BaseScreen (inside screen classes)
await this.waitForScreen({ timeout: 30000, timeoutMsg: 'Dashboard not loaded' });
await this.waitForElement(selector, { timeout: 10000 });

// Via WaitHelper (in specs or composite flows)
await WaitHelper.waitForDisplayed(selector, { timeout: 10000 });
await WaitHelper.waitForNotDisplayed(loadingSelector, { timeout: 30000 });

// Custom condition
await browser.waitUntil(
  async () => (await element.getText()) === 'Expected Text',
  { timeout: 10000, timeoutMsg: 'Text did not match within 10s' }
);
```

### Smart Wait Patterns

```typescript
// Wait for loading spinner to disappear
async waitForLoadingComplete(): Promise<void> {
  const spinner = await $('~loading-spinner');
  if (await spinner.isExisting()) {
    await spinner.waitForDisplayed({ timeout: 5000 });
    await spinner.waitForDisplayed({ timeout: 30000, reverse: true });
  }
}

// Wait for list to populate
async waitForDataLoad(): Promise<void> {
  await browser.waitUntil(
    async () => {
      const items = await $$('~list-item');
      return items.length > 0;
    },
    { timeout: 15000, timeoutMsg: 'Data did not load within 15s' }
  );
}
```

### ❌ DON'T Use Hard Waits

```typescript
// Bad: Hardcoded pause
await browser.pause(5000);

// These cause:
// - Slower test execution
// - Flaky tests (may not wait long enough)
// - Wasted time (always waits full duration)
```

---

## Test Data Management

### Use JSON Files + Factory Pattern

```typescript
// Load from JSON (src/tests/data/)
import testData from '../../data/testData.json';

const user = {
  email: testData.users.validUser.email,
  password: testData.users.validUser.password,
};

// Create dynamic test data via factory
const user = TestDataFactory.createUser();
const customUser = TestDataFactory.createUser({ email: 'specific@test.com' });
```

### Environment-Specific Data

```typescript
// Loaded automatically from .env.${TEST_ENV}
// TEST_ENV=qa    → .env.qa
// TEST_ENV=preprod → .env.preprod
// TEST_ENV=prod  → .env.prod

const apiUrl = process.env.API_URL;
```

### Sensitive Data Handling

```typescript
// ✅ Good: Environment variables
const apiKey = process.env.API_KEY;

// ✅ Good: CI secrets via GitHub Actions
process.env.BROWSERSTACK_ACCESS_KEY;

// ❌ Bad: Hardcoded credentials in source
const password = 'hardcoded123';
```

---

## Error Handling

### Graceful Failure

```typescript
// Tap only if element exists (e.g. dismissing optional alerts)
async dismissAlertIfPresent(): Promise<void> {
  try {
    const btn = await $('android=new UiSelector().resourceId("android:id/button1")');
    if (await btn.isDisplayed()) {
      await btn.click();
    }
  } catch {
    Logger.warn('No alert to dismiss');
  }
}
```

### Meaningful Error Messages

```typescript
// ✅ Good: Descriptive timeout messages
await this.waitForScreen({
  timeout: 30000,
  timeoutMsg: 'Screen not displayed within 30s',
});

// ✅ Good: Context preserved in thrown errors
async performFlow(amount: number): Promise<void> {
  try {
    await this.tapOption();
    await this.enterAmount(amount);
    await this.tapConfirm();
  } catch (error) {
    Logger.error(`Flow failed for amount: ${amount}`, error as Error);
    await AllureReporter.captureScreenshot('flow_failure');
    throw error;
  }
}
```

---

## Performance Optimization

### Parallel Execution on BrowserStack

```typescript
// wdio.browserstack.android.conf.ts
maxInstances: 5,

// Drive devices from env var
// BROWSERSTACK_ANDROID_DEVICES=Samsung Galaxy S23,Google Pixel 7
```

### Efficient Element Queries

```typescript
// ✅ Good: String selectors resolved fresh via this.tap() / this.enterText()
private readonly INPUT_SELECTOR = 'android=new UiSelector().text("0.00")';

async enterValue(amount: number): Promise<void> {
  await this.enterText(this.INPUT_SELECTOR, amount.toString());
}

// ❌ Bad: Re-querying the same element in every call
async fillInput(amount: number): Promise<void> {
  await (await $('android=new UiSelector().text("0.00")')).click();
  await (await $('android=new UiSelector().text("0.00")')).setValue(amount.toString());
}
```

### Minimize App Restarts

```typescript
// ✅ Good: Reset to known state without full session reload
beforeEach(async () => {
  await BaseTest.waitForAppReady();
});

after(async () => {
  await BaseTest.resetApp(); // Full reset only at suite level
});

// ❌ Bad: Full session reload per test
beforeEach(async () => {
  await browser.reloadSession(); // Slow — avoid
});
```

---

## Code Review Checklist

Before submitting code, verify:

- [ ] Extends appropriate base class (`BaseScreen` for screens)
- [ ] Uses Page Object Model (no direct element access in tests)
- [ ] Has proper TypeScript types (no `any`)
- [ ] Uses explicit waits (no `browser.pause()`)
- [ ] Logs all actions via `Logger.step()` or `Logger.action()`
- [ ] Handles errors properly (catch, log, re-throw)
- [ ] Uses `TestDataFactory` or JSON for test data
- [ ] Follows naming conventions (PascalCase classes, camelCase methods)
- [ ] Platform-agnostic or uses `ScreenFactory` for differences
- [ ] Has meaningful assertions
- [ ] No hardcoded credentials
- [ ] No `console.log` statements
- [ ] No `any` types
- [ ] Selectors are `private readonly` strings (not element getters)

---

*Last Updated: June 2026*