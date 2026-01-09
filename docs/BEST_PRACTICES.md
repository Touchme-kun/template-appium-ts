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
9. [BDD Best Practices](#bdd-best-practices)
10. [Code Review Checklist](#code-review-checklist)

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

### ❌ DON'T

- Create tests with dependencies on other tests
- Use hardcoded values (credentials, URLs, IDs)
- Write overly long test methods
- Ignore failing tests
- Skip error handling
- Commit sensitive data (passwords, API keys)

---

## Element Locators

### Locator Priority (Best to Worst)

1. **Accessibility ID** (Best)
   ```typescript
   // Preferred - works cross-platform
   await $('~login-button');
   ```

2. **Resource ID (Android) / Name (iOS)**
   ```typescript
   // Android
   await $('android=new UiSelector().resourceId("com.app:id/login")');
   // iOS
   await $('-ios predicate string:name == "loginButton"');
   ```

3. **Class + Text**
   ```typescript
   await $('android=new UiSelector().text("Login")');
   await $('-ios predicate string:label == "Login"');
   ```

4. **XPath** (Avoid if possible)
   ```typescript
   // Use only when necessary
   await $('//android.widget.Button[@text="Login"]');
   ```

### ✅ DO

```typescript
// Good: Use accessibility ID
get loginButton() {
  return $('~login-button');
}

// Good: Platform-specific when needed
get submitButton() {
  return driver.isAndroid
    ? $('~submit-btn')
    : $('-ios predicate string:name == "submit"');
}
```

### ❌ DON'T

```typescript
// Bad: Fragile XPath with indexes
get button() {
  return $('//android.view.ViewGroup[3]/android.widget.Button[2]');
}

// Bad: Dynamic IDs
get element() {
  return $('//*[contains(@resource-id, "random123")]');
}
```

---

## Page Object Model

### Screen Class Structure

```typescript
import { BaseScreen } from './BaseScreen';
import { GestureHelper } from '../helpers';

export class LoginScreen extends BaseScreen {
  // 1. Screen locator (required)
  protected get screenLocator(): string {
    return '~login-screen';
  }

  // 2. Element getters (private elements)
  private get usernameField() {
    return $('~username-input');
  }

  private get passwordField() {
    return $('~password-input');
  }

  private get loginButton() {
    return $('~login-button');
  }

  private get errorMessage() {
    return $('~error-message');
  }

  // 3. Public element getters (for assertions)
  get welcomeMessage() {
    return $('~welcome-message');
  }

  // 4. Action methods (public)
  async enterUsername(username: string): Promise<void> {
    const field = await this.usernameField;
    await field.setValue(username);
  }

  async enterPassword(password: string): Promise<void> {
    const field = await this.passwordField;
    await field.setValue(password);
  }

  async tapLogin(): Promise<void> {
    const button = await this.loginButton;
    await button.click();
  }

  // 5. Composite actions (combine multiple actions)
  async login(username: string, password: string): Promise<void> {
    await this.waitForScreen();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  // 6. Validation methods
  async getErrorMessage(): Promise<string> {
    const element = await this.errorMessage;
    await element.waitForDisplayed({ timeout: 5000 });
    return element.getText();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const welcome = await this.welcomeMessage;
      return welcome.isDisplayed();
    } catch {
      return false;
    }
  }
}
```

### ✅ DO

- Keep screens focused on a single page/view
- Use descriptive method names that reflect user actions
- Return `Promise<void>` for actions, `Promise<boolean/string>` for queries
- Handle loading states within screen methods

### ❌ DON'T

- Add test assertions inside page objects
- Create "god" screens that span multiple pages
- Expose internal implementation details
- Use `sleep()` or hardcoded waits

---

## Test Design

### Test Structure (AAA Pattern)

```typescript
it('should display error for invalid login', async () => {
  // Arrange - Setup test data and preconditions
  const invalidUser = TestDataFactory.createUser({
    email: 'invalid@test.com',
    password: 'wrong'
  });

  // Act - Perform the action being tested
  await loginScreen.login(invalidUser.email, invalidUser.password);

  // Assert - Verify the expected outcome
  const errorMessage = await loginScreen.getErrorMessage();
  expect(errorMessage).toContain('Invalid credentials');
});
```

### Test Naming Conventions

```typescript
// Pattern: should [expected behavior] when [condition]
describe('Login Screen', () => {
  it('should display home screen when credentials are valid', async () => {});
  it('should show error message when password is empty', async () => {});
  it('should disable login button when username is invalid', async () => {});
  it('should navigate to forgot password when link is tapped', async () => {});
});
```

### Test Independence

```typescript
// ✅ Good: Each test is independent
describe('User Registration', () => {
  beforeEach(async () => {
    await BaseTest.setupTest('Registration Test');
    await app.reset(); // Start fresh
  });

  it('should register with valid data', async () => {
    const user = TestDataFactory.createUser();
    await registrationScreen.register(user);
    // ...
  });

  it('should show error for existing email', async () => {
    const user = TestDataFactory.createUser({ email: 'existing@test.com' });
    await registrationScreen.register(user);
    // ...
  });
});

// ❌ Bad: Tests depend on each other
describe('User Flow', () => {
  it('step 1: register user', async () => {});
  it('step 2: login with registered user', async () => {}); // Depends on step 1!
  it('step 3: update profile', async () => {}); // Depends on step 2!
});
```

---

## Wait Strategies

### Explicit Waits (Preferred)

```typescript
// Wait for element to be displayed
await element.waitForDisplayed({ timeout: 10000 });

// Wait for element to be clickable
await element.waitForClickable({ timeout: 10000 });

// Wait for element to exist in DOM
await element.waitForExist({ timeout: 10000 });

// Wait with custom condition
await browser.waitUntil(
  async () => (await element.getText()) === 'Expected Text',
  { timeout: 10000, timeoutMsg: 'Text did not match' }
);
```

### Smart Wait Patterns

```typescript
// Wait for loading to complete
async waitForLoading(): Promise<void> {
  const spinner = await $('~loading-spinner');
  await spinner.waitForDisplayed({ timeout: 5000 });
  await spinner.waitForDisplayed({ timeout: 30000, reverse: true });
}

// Wait for network request
async waitForDataLoad(): Promise<void> {
  await browser.waitUntil(
    async () => {
      const items = await $$('~list-item');
      return items.length > 0;
    },
    { timeout: 15000, timeoutMsg: 'Data did not load' }
  );
}
```

### ❌ DON'T Use Hard Waits

```typescript
// Bad: Hardcoded sleep
await browser.pause(5000);
await driver.sleep(3000);

// These cause:
// - Slower test execution
// - Flaky tests (may not wait long enough)
// - Wasted time (always waits full duration)
```

---

## Test Data Management

### Use Factory Pattern

```typescript
// Create dynamic test data
const user = TestDataFactory.createUser();
const user = TestDataFactory.createUser({ email: 'specific@test.com' });

// Load from JSON files
const loginData = TestDataFactory.loadTestData<LoginData>('login');

// Environment-specific data
const envData = TestDataFactory.getEnvironmentData<Config>('apiConfig');
```

### Data Isolation

```typescript
// Each test creates its own data
it('should update user profile', async () => {
  // Create unique test data
  const user = TestDataFactory.createUser({
    email: `test-${Date.now()}@example.com`
  });
  
  // Use in test
  await registrationScreen.register(user);
  
  // Cleanup (if needed)
  await ApiHelper.deleteUser(user.id);
});
```

### Sensitive Data Handling

```typescript
// ✅ Good: Use environment variables
const password = process.env.TEST_PASSWORD || 'default_test_pass';

// ✅ Good: Use encrypted secrets in CI
process.env.API_KEY; // From GitHub Secrets

// ❌ Bad: Hardcoded credentials
const password = 'MySecretPassword123!';
```

---

## Error Handling

### Graceful Failure

```typescript
async tapIfExists(locator: string): Promise<boolean> {
  try {
    const element = await $(locator);
    if (await element.isDisplayed()) {
      await element.click();
      return true;
    }
    return false;
  } catch {
    Logger.debug(`Element ${locator} not found, skipping tap`);
    return false;
  }
}
```

### Meaningful Error Messages

```typescript
// ✅ Good: Custom error messages
await element.waitForDisplayed({
  timeout: 10000,
  timeoutMsg: 'Login button not visible after 10 seconds'
});

// ✅ Good: Context in errors
async login(username: string, password: string): Promise<void> {
  try {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLogin();
  } catch (error) {
    Logger.error(`Login failed for user: ${username}`, error);
    await ScreenshotUtil.captureOnFailure('login_failure');
    throw new Error(`Login failed for ${username}: ${error.message}`);
  }
}
```

---

## Performance Optimization

### Parallel Execution

```typescript
// wdio.conf.ts
export const config = {
  maxInstances: 5, // Run up to 5 tests in parallel
  // ...
};
```

### Efficient Element Queries

```typescript
// ✅ Good: Cache element references
async fillForm(data: FormData): Promise<void> {
  const nameField = await this.nameField;
  const emailField = await this.emailField;
  
  await nameField.setValue(data.name);
  await emailField.setValue(data.email);
}

// ❌ Bad: Query element multiple times
async fillForm(data: FormData): Promise<void> {
  await (await this.nameField).setValue(data.name);
  await (await this.nameField).click(); // Queries again!
}
```

### Minimize App Restarts

```typescript
// ✅ Good: Reset app state without full restart
beforeEach(async () => {
  await loginScreen.logout();
  await homeScreen.navigateToLogin();
});

// ❌ Bad: Full restart for each test
beforeEach(async () => {
  await driver.reloadSession(); // Slow!
});
```

---

## BDD Best Practices

### Feature File Structure

```gherkin
@smoke @login
Feature: User Login
  As a registered user
  I want to login to the application
  So that I can access my account

  Background:
    Given the application is launched
    And I am on the login screen

  @positive
  Scenario: Successful login with valid credentials
    When I enter username "user@example.com"
    And I enter password "SecurePass123"
    And I tap the login button
    Then I should see the home screen
    And I should see welcome message "Hello, User"

  @negative
  Scenario Outline: Login with invalid credentials
    When I enter username "<username>"
    And I enter password "<password>"
    And I tap the login button
    Then I should see error message "<error>"

    Examples:
      | username            | password  | error                |
      | invalid@test.com    | wrong123  | Invalid credentials  |
      | user@example.com    |           | Password is required |
```

### Step Definition Guidelines

```typescript
// ✅ Good: Reusable, focused steps
Given('I am on the login screen', async () => {
  await loginScreen.waitForScreen();
});

When('I enter username {string}', async (username: string) => {
  await loginScreen.enterUsername(username);
});

// ❌ Bad: Steps with hardcoded values
When('I login with admin credentials', async () => {
  await loginScreen.login('admin@test.com', 'admin123');
});
```

### Use Tags Effectively

```gherkin
@smoke         # Quick sanity tests
@regression    # Full test suite
@wip           # Work in progress (skip in CI)
@android       # Android-specific tests
@ios           # iOS-specific tests
@flaky         # Known flaky tests
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] All tests pass locally
- [ ] No hardcoded values or credentials
- [ ] Proper error handling in place
- [ ] Screenshots captured on failure
- [ ] Meaningful test names
- [ ] Code follows naming conventions
- [ ] No console.log statements (use Logger)
- [ ] New code has appropriate comments
- [ ] No TODO comments left unaddressed
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)

### Reviewing Others' Code

- [ ] Tests are independent and isolated
- [ ] Wait strategies are appropriate (no hard waits)
- [ ] Locators follow best practices
- [ ] Page objects are focused and maintainable
- [ ] Error messages are descriptive
- [ ] Test data is properly managed
- [ ] No duplicate code (check utilities)
- [ ] Performance is considered

---

## Quick Reference Card

### Element Locators
```typescript
$('~accessibility-id')                    // Best
$('android=new UiSelector().text("X")')   // Good
$('-ios predicate string:name == "X"')    // Good
$('//xpath')                              // Avoid
```

### Wait Commands
```typescript
await el.waitForDisplayed()               // Wait for visible
await el.waitForClickable()               // Wait for clickable
await el.waitForExist()                   // Wait for in DOM
await browser.waitUntil(() => condition)  // Custom wait
```

### Assertions
```typescript
await expect(el).toBeDisplayed()          // Is visible
await expect(el).toHaveText('text')       // Has text
await expect(el).toBeClickable()          // Is clickable
await expect(el).toExist()                // Exists in DOM
```

### Logging
```typescript
Logger.info('Message')                    // Info level
Logger.debug('Details', data)             // Debug level
Logger.error('Error', error)              // Error level
Logger.step('Step name')                  // Test step
```

---

**Remember**: Good tests are readable, maintainable, and reliable. When in doubt, ask for a code review!
