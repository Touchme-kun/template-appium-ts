# GitHub Copilot Instructions - Mobile Automation Framework

## Framework Overview

This is a production-grade mobile automation framework built with **TypeScript 5.x**, **WebdriverIO 8.x**, and **Appium 2.x**. It supports both iOS and Android platforms with TDD (Mocha) and BDD (Cucumber) approaches.

**You MUST follow these instructions exactly when generating code for this framework.**

---

## Core Architecture Rules

### 1. Tech Stack Requirements

**ALWAYS use these technologies:**
- **Language**: TypeScript with strict mode enabled
- **Test Runner**: WebdriverIO 8.x
- **Mobile Driver**: Appium 2.x
- **TDD Framework**: Mocha 10.x
- **BDD Framework**: Cucumber 8.x
- **Assertions**: expect-webdriverio (built-in)
- **Reporting**: Allure Reports
- **Logging**: Winston 3.x

**NEVER:**
- Use JavaScript instead of TypeScript
- Use Selenium WebDriver directly
- Use other assertion libraries (Chai, Jest expect)
- Skip type definitions

---

## Design Patterns - MANDATORY

### 1. Page Object Model (POM)

**ALL screen interactions MUST use the Page Object Model.**

#### Screen Class Structure:

```typescript
import { BaseScreen } from '../base/BaseScreen';

export class LoginScreen extends BaseScreen {
  // 1. Screen identifier (REQUIRED)
  protected get screenLocator(): string {
    return '~login-screen'; // Accessibility ID preferred
  }

  // 2. Element locators (ALWAYS private getters)
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

  // 3. Action methods (ALWAYS public, async)
  async enterUsername(username: string): Promise<void> {
    await this.waitForElement(await this.usernameField);
    await (await this.usernameField).setValue(username);
    Logger.step(`Entered username: ${username}`);
  }

  async enterPassword(password: string): Promise<void> {
    await this.waitForElement(await this.passwordField);
    await (await this.passwordField).setValue(password);
    Logger.step('Entered password');
  }

  async tapLoginButton(): Promise<void> {
    await this.tap(await this.loginButton);
    Logger.step('Tapped login button');
  }

  // 4. High-level business actions (ALWAYS public)
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLoginButton();
  }

  // 5. State verification methods (ALWAYS public, return boolean/string)
  async isErrorDisplayed(): Promise<boolean> {
    return await (await this.errorMessage).isDisplayed();
  }

  async getErrorMessage(): Promise<string> {
    return await (await this.errorMessage).getText();
  }
}
```

**RULES:**
- ✅ Extend `BaseScreen`
- ✅ Define `screenLocator` getter
- ✅ Locators are private getters
- ✅ Actions are public async methods
- ✅ Log every action using `Logger.step()`
- ✅ Wait for elements before interaction
- ❌ NEVER expose raw WebdriverIO elements
- ❌ NEVER put test logic in screen classes
- ❌ NEVER hardcode values in screen classes

---

### 2. Factory Pattern - Cross-Platform Support

**ALWAYS use ScreenFactory for platform-specific implementations.**

#### When to Use Platform-Specific Screens:

```typescript
// screens/LoginScreen.ts (cross-platform - simple cases)
export class LoginScreen extends BaseScreen {
  private get usernameField() {
    // Use ScreenFactory for different locators
    return $(ScreenFactory.getLocator(
      'android=resourceId("com.app:id/username")', // Android
      '~username-field'                              // iOS
    ));
  }
}

// For significant platform differences, create separate classes:
// screens/android/AndroidLoginScreen.ts
export class AndroidLoginScreen extends BaseScreen {
  // Android-specific implementation
}

// screens/ios/IOSLoginScreen.ts
export class IOSLoginScreen extends BaseScreen {
  // iOS-specific implementation
}

// Usage in tests:
import { ScreenFactory } from '../screens/ScreenFactory';
const loginScreen = ScreenFactory.getScreen(AndroidLoginScreen, IOSLoginScreen);
```

**RULES:**
- ✅ Use `ScreenFactory.getLocator()` for different selectors
- ✅ Use `ScreenFactory.getScreen()` for platform-specific classes
- ✅ Use `ScreenFactory.getValue()` for platform-specific values
- ❌ NEVER use `if (driver.isAndroid)` in screen classes
- ❌ NEVER duplicate screen logic across platforms

---

### 3. Element Locator Strategy - STRICT PRIORITY

**Follow this locator priority order (MANDATORY):**

1. **Accessibility ID** (PREFERRED):
   ```typescript
   $('~element-accessibility-id')
   ```

2. **Resource ID** (Android):
   ```typescript
   $('android=resourceId("com.app:id/element")')
   ```

3. **iOS Predicate** (iOS):
   ```typescript
   $('-ios predicate string:name == "Element"')
   ```

4. **XPath** (LAST RESORT - avoid when possible):
   ```typescript
   $('//android.widget.Button[@text="Login"]')
   ```

**RULES:**
- ✅ Always prefer accessibility IDs
- ✅ Use platform-specific selectors only when necessary
- ✅ Keep locators maintainable and readable
- ❌ NEVER use XPath unless absolutely no alternative
- ❌ NEVER use text-based locators (they break with i18n)
- ❌ NEVER use index-based selectors (brittle)

---

## Test Writing Standards

### 1. TDD (Mocha) Test Structure

**MANDATORY test structure:**

```typescript
import { BaseTest } from '../../src/base/BaseTest';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { TestDataFactory } from '../../src/utils/TestDataFactory';

describe('Login Functionality - Android', () => {
  let loginScreen: LoginScreen;
  let homeScreen: HomeScreen;
  
  // Suite setup (REQUIRED)
  before(async () => {
    await BaseTest.initializeSuite('Login Tests');
    loginScreen = new LoginScreen();
    homeScreen = new HomeScreen();
  });

  // Test setup (REQUIRED)
  beforeEach(async () => {
    await BaseTest.setupTest('Login test');
    await driver.reset(); // Fresh state
  });

  // Test teardown (REQUIRED)
  afterEach(async function() {
    await BaseTest.teardownTest(this.currentTest?.state === 'passed');
  });

  // Suite cleanup (REQUIRED)
  after(async () => {
    await BaseTest.cleanupSuite('Login Tests');
  });

  describe('Valid Login Scenarios', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const user = TestDataFactory.createUser({
        email: 'test@example.com',
        password: 'SecurePass123'
      });
      
      // Act
      await loginScreen.login(user.email, user.password);
      
      // Assert
      await expect(await homeScreen.welcomeMessage).toBeDisplayed();
      await expect(await homeScreen.welcomeMessage).toHaveText('Welcome back!');
    });
  });

  describe('Invalid Login Scenarios', () => {
    it('should show error for invalid credentials', async () => {
      // Arrange
      const invalidUser = TestDataFactory.createUser({
        email: 'invalid@example.com',
        password: 'wrong'
      });
      
      // Act
      await loginScreen.login(invalidUser.email, invalidUser.password);
      
      // Assert
      await expect(await loginScreen.isErrorDisplayed()).toBe(true);
      await expect(await loginScreen.getErrorMessage()).toContain('Invalid credentials');
    });
  });
});
```

**RULES:**
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Use `before`, `beforeEach`, `afterEach`, `after` hooks
- ✅ Call `BaseTest` lifecycle methods
- ✅ Use `describe` blocks to group related tests
- ✅ Test names start with "should"
- ✅ Use TestDataFactory for test data
- ✅ Each test is independent
- ❌ NEVER skip lifecycle hooks
- ❌ NEVER hardcode test data
- ❌ NEVER create test dependencies

---

### 2. BDD (Cucumber) Structure

**Feature File Structure:**

```gherkin
@smoke @android @ios
Feature: User Login
  As a mobile app user
  I want to log in to the application
  So that I can access my account

  Background:
    Given the app is launched
    And I am on the login screen

  @positive
  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123"
    And I tap the login button
    Then I should see the home screen
    And I should see welcome message "Welcome back!"

  @negative
  Scenario Outline: Login with invalid credentials
    When I enter username "<username>"
    And I enter password "<password>"
    And I tap the login button
    Then I should see error message "<error>"

    Examples:
      | username              | password    | error                    |
      | invalid@example.com   | wrong123    | Invalid credentials      |
      | testuser@example.com  |             | Password is required     |
```

**Step Definitions:**

```typescript
import { Given, When, Then } from '@wdio/cucumber-framework';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { HomeScreen } from '../../src/screens/HomeScreen';

let loginScreen: LoginScreen;
let homeScreen: HomeScreen;

Given('I am on the login screen', async () => {
  loginScreen = new LoginScreen();
  await loginScreen.waitForScreen();
});

When('I enter username {string}', async (username: string) => {
  await loginScreen.enterUsername(username);
});

When('I enter password {string}', async (password: string) => {
  await loginScreen.enterPassword(password);
});

When('I tap the login button', async () => {
  await loginScreen.tapLoginButton();
});

Then('I should see the home screen', async () => {
  homeScreen = new HomeScreen();
  await homeScreen.waitForScreen();
  await expect(await homeScreen.screenLocator).toBeDisplayed();
});

Then('I should see welcome message {string}', async (expectedMessage: string) => {
  const actualMessage = await homeScreen.getWelcomeMessage();
  expect(actualMessage).toBe(expectedMessage);
});

Then('I should see error message {string}', async (expectedError: string) => {
  const actualError = await loginScreen.getErrorMessage();
  expect(actualError).toContain(expectedError);
});
```

**RULES:**
- ✅ Use Gherkin syntax correctly
- ✅ Add tags for test organization (@smoke, @android, @ios)
- ✅ Use Background for common steps
- ✅ Use Scenario Outline for data-driven tests
- ✅ Step definitions call screen methods
- ✅ One assertion per Then step
- ❌ NEVER put business logic in step definitions
- ❌ NEVER use technical language in feature files
- ❌ NEVER create overly specific step definitions

---

## Wait Strategy - CRITICAL

**ALWAYS use explicit waits, NEVER use hardcoded pauses.**

### Correct Wait Patterns:

```typescript
// ✅ Wait for element to be displayed
await (await element).waitForDisplayed({ timeout: 10000 });

// ✅ Wait for element to be clickable
await (await element).waitForClickable({ timeout: 10000 });

// ✅ Wait for element to exist
await (await element).waitForExist({ timeout: 10000 });

// ✅ Custom wait condition
await browser.waitUntil(
  async () => await (await element).isDisplayed(),
  {
    timeout: 10000,
    timeoutMsg: 'Element not displayed after 10s'
  }
);

// ✅ Using BaseScreen wait methods
await this.waitForElement(await element);
```

### FORBIDDEN Wait Patterns:

```typescript
// ❌ NEVER use pause
await browser.pause(5000);

// ❌ NEVER use sleep/setTimeout
await new Promise(resolve => setTimeout(resolve, 5000));

// ❌ NEVER use try-catch as wait strategy
try {
  await element.click();
} catch (e) {
  await browser.pause(2000);
  await element.click();
}
```

**RULES:**
- ✅ Always use WebdriverIO wait methods
- ✅ Set meaningful timeout messages
- ✅ Use appropriate timeout values (5-30s)
- ❌ NEVER use `pause()`, `sleep()`, or `setTimeout()`
- ❌ NEVER use empty catch blocks

---

## Gestures and Interactions

**Use GestureHelper for mobile-specific gestures:**

```typescript
import { GestureHelper } from '../../src/utils/GestureHelper';

// ✅ Swipe gestures
await GestureHelper.swipeUp();
await GestureHelper.swipeDown();
await GestureHelper.swipeLeft(element);
await GestureHelper.swipeRight(element);

// ✅ Multi-touch
await GestureHelper.pinchOpen(element);
await GestureHelper.pinchClose(element);

// ✅ Tap gestures
await GestureHelper.longPress(element, 3000);
await GestureHelper.doubleTap(element);

// ✅ Drag and drop
await GestureHelper.dragAndDrop(sourceElement, targetElement);
```

**RULES:**
- ✅ Use GestureHelper for complex gestures
- ✅ Use BaseScreen methods for simple taps
- ❌ NEVER implement custom gesture code
- ❌ NEVER use TouchAction directly

---

## Logging Requirements

**MANDATORY logging for all actions:**

```typescript
import { Logger } from '../../src/utils/Logger';

// ✅ Log test steps
Logger.step('Navigating to login screen');

// ✅ Log important actions
Logger.info('User logged in successfully', { username: user.email });

// ✅ Log errors with context
Logger.error('Login failed', error);

// ✅ Log debug information
Logger.debug('Element attributes', { text: elementText, enabled: isEnabled });
```

**RULES:**
- ✅ Log every test step
- ✅ Log every user action in screens
- ✅ Include context in log messages
- ✅ Use appropriate log levels
- ❌ NEVER log sensitive data (passwords, tokens)
- ❌ NEVER use console.log

---

## Configuration Usage

**Access configuration through EnvironmentConfig:**

```typescript
import { EnvironmentConfig } from '../../src/config/environment';

const config = EnvironmentConfig.getInstance();

// ✅ Access environment variables
const appiumUrl = config.appiumUrl;
const appPath = config.androidAppPath;
const bsCredentials = config.browserStackCredentials;
```

**RULES:**
- ✅ Use EnvironmentConfig singleton
- ✅ Store all environment-specific values in config
- ❌ NEVER hardcode URLs, paths, or credentials
- ❌ NEVER access process.env directly in tests

---

## Test Data Management

**Use TestDataFactory for all test data:**

```typescript
import { TestDataFactory } from '../../src/utils/TestDataFactory';

// ✅ Create test data with defaults
const user = TestDataFactory.createUser();

// ✅ Override specific properties
const customUser = TestDataFactory.createUser({
  email: 'custom@example.com',
  firstName: 'John'
});

// ✅ Load data from files
const testUsers = TestDataFactory.loadTestData<User[]>('users');
```

**RULES:**
- ✅ Use TestDataFactory for all test data
- ✅ Store static data in JSON files
- ✅ Use Faker for dynamic data
- ❌ NEVER hardcode test data in tests
- ❌ NEVER use production data

---

## Reporting and Allure Integration

**Enhance reports with Allure annotations:**

```typescript
import { AllureReporter } from '../../src/utils/AllureReporter';

// ✅ Add test steps
AllureReporter.addStep('Navigate to login screen');

// ✅ Attach screenshots
await AllureReporter.captureScreenshot('login-screen');

// ✅ Add attachments
AllureReporter.addAttachment('Request', JSON.stringify(request), 'application/json');

// ✅ Add environment info
AllureReporter.addEnvironment('Platform', 'Android');
AllureReporter.addEnvironment('OS Version', '13.0');
```

**RULES:**
- ✅ Use Allure for rich reporting
- ✅ Attach screenshots on failure
- ✅ Add meaningful step descriptions
- ❌ NEVER skip screenshot capture on failures

---

## Error Handling

**Proper error handling pattern:**

```typescript
// ✅ Handle errors with context and screenshots
async login(username: string, password: string): Promise<void> {
  try {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLoginButton();
    Logger.step('Login successful');
  } catch (error) {
    Logger.error('Login failed', error as Error);
    await ScreenshotUtil.captureOnFailure('login_failure');
    throw error; // Re-throw for test framework
  }
}
```

**RULES:**
- ✅ Catch errors for logging/screenshots
- ✅ Always re-throw errors
- ✅ Provide meaningful error messages
- ❌ NEVER swallow errors silently
- ❌ NEVER use empty catch blocks

---

## File Organization

**STRICT folder structure:**

```
src/
├── base/              # BaseTest, BaseScreen, ElementWrapper
├── config/            # Environment configuration
├── helpers/           # GestureHelper, WaitHelper
├── screens/           # Page objects
│   ├── android/       # Android-specific screens
│   ├── ios/           # iOS-specific screens
│   └── *.ts           # Cross-platform screens
├── types/             # TypeScript type definitions
└── utils/             # Logger, AllureReporter, etc.

tests/
├── specs/             # Mocha test files
│   ├── android/       # Android tests
│   └── ios/           # iOS tests
├── features/          # Cucumber feature files
└── data/              # Test data JSON files
```

**RULES:**
- ✅ Follow the established folder structure
- ✅ Group by feature/screen
- ✅ Keep platform-specific code separated
- ❌ NEVER mix test frameworks in the same file
- ❌ NEVER create new top-level folders without review

---

## Naming Conventions

### Files and Classes:

```typescript
// ✅ PascalCase for classes
export class LoginScreen extends BaseScreen { }

// ✅ camelCase for methods and variables
async enterUsername(username: string): Promise<void> { }

// ✅ UPPER_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;

// ✅ File names match class names
// LoginScreen.ts → export class LoginScreen
```

### Test Names:

```typescript
// ✅ TDD: Descriptive with 'should'
it('should login successfully with valid credentials', async () => { });

// ✅ BDD: Plain English
Scenario: Successful login with valid credentials
```

**RULES:**
- ✅ Be descriptive and clear
- ✅ Follow TypeScript naming conventions
- ❌ NEVER use abbreviations unless widely known
- ❌ NEVER use single-letter variables (except i, j in loops)

---

## TypeScript Best Practices

**MANDATORY TypeScript practices:**

```typescript
// ✅ Always use types
async login(username: string, password: string): Promise<void> { }

// ✅ Use interfaces for complex types
interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ✅ Use generics when appropriate
static async loadTestData<T>(fileName: string): Promise<T> { }

// ✅ Enable strict mode (tsconfig.json)
"strict": true

// ❌ NEVER use 'any' type
async getData(): Promise<any> { } // ❌ BAD

// ✅ Use unknown or specific type
async getData(): Promise<User> { } // ✅ GOOD
```

**RULES:**
- ✅ Always use explicit types
- ✅ Enable strict mode
- ✅ Use interfaces for data structures
- ❌ NEVER use `any` type
- ❌ NEVER disable TypeScript errors with @ts-ignore

---

## Performance Guidelines

```typescript
// ✅ Cache screen instances
private static loginScreen: LoginScreen;

static getLoginScreen(): LoginScreen {
  if (!this.loginScreen) {
    this.loginScreen = new LoginScreen();
  }
  return this.loginScreen;
}

// ✅ Use efficient selectors
$('~accessibility-id') // Fast

// ❌ Avoid expensive selectors
$('//android.widget.Button[contains(@text, "partial")]') // Slow
```

**RULES:**
- ✅ Cache frequently used objects
- ✅ Use efficient locators
- ✅ Minimize API calls
- ❌ NEVER create unnecessary object instances

---

## Security Rules

**CRITICAL security requirements:**

```typescript
// ✅ Use environment variables
const username = process.env.TEST_USERNAME;

// ✅ Mask sensitive data in logs
Logger.info('Login attempt', { username: user.email, password: '***' });

// ❌ NEVER hardcode credentials
const password = 'SecurePass123'; // ❌ FORBIDDEN

// ❌ NEVER log sensitive data
Logger.info('User data', { password: user.password }); // ❌ FORBIDDEN
```

**RULES:**
- ✅ All credentials in environment variables
- ✅ Mask passwords in logs
- ✅ Use .gitignore for sensitive files
- ❌ NEVER commit credentials
- ❌ NEVER log sensitive information

---

## Common Mistakes to Avoid

### ❌ DON'T:

```typescript
// ❌ Accessing driver directly in tests
await driver.click('~button');

// ❌ Hardcoded waits
await browser.pause(5000);

// ❌ Using any type
async getData(): Promise<any> { }

// ❌ Exposing WebDriver elements
getElement() { return this.element; }

// ❌ Platform checks in screens
if (driver.isAndroid) { }

// ❌ Empty catch blocks
try { } catch (e) { }

// ❌ Console.log
console.log('Debug info');

// ❌ Hardcoded test data
const email = 'test@example.com';
```

### ✅ DO:

```typescript
// ✅ Use screen methods
await loginScreen.tapLoginButton();

// ✅ Explicit waits
await element.waitForDisplayed();

// ✅ Proper types
async getData(): Promise<User> { }

// ✅ Encapsulate interactions
async tapButton(): Promise<void> { }

// ✅ Use ScreenFactory
ScreenFactory.getLocator(androidLoc, iosLoc);

// ✅ Handle and re-throw errors
try { } catch (e) { Logger.error('Failed', e); throw e; }

// ✅ Use Logger
Logger.info('Debug info');

// ✅ Use TestDataFactory
const email = TestDataFactory.createUser().email;
```

---

## Code Review Checklist

Before suggesting code, verify:

- [ ] Extends appropriate base class
- [ ] Uses Page Object Model
- [ ] Has proper TypeScript types
- [ ] Uses explicit waits (no pause)
- [ ] Logs all actions
- [ ] Handles errors properly
- [ ] Uses TestDataFactory for data
- [ ] Follows naming conventions
- [ ] Platform-agnostic or uses ScreenFactory
- [ ] Has meaningful assertions
- [ ] No hardcoded credentials
- [ ] No console.log statements
- [ ] No 'any' types

---

## Summary - Quick Reference

**When creating a screen:**
1. Extend BaseScreen
2. Define screenLocator
3. Private getters for locators
4. Public async action methods
5. Log every action

**When writing a test:**
1. Use BaseTest lifecycle methods
2. Follow AAA pattern
3. Use TestDataFactory
4. Explicit waits only
5. Meaningful assertions

**When using locators:**
1. Prefer accessibility ID
2. Use ScreenFactory for platform differences
3. Avoid XPath
4. Never use text-based selectors

**Always:**
- Log actions
- Handle errors
- Use TypeScript types
- Wait explicitly
- Test independently

**Never:**
- Use hardcoded waits
- Skip type definitions
- Log sensitive data
- Use 'any' type
- Skip lifecycle hooks

---

## Framework Philosophy

> **"Write code that is readable, maintainable, and scalable. Every test should be independent, every screen should be reusable, and every interaction should be logged."**

When in doubt:
1. Check existing implementations
2. Follow SOLID principles
3. Prioritize maintainability over cleverness
4. Ask: "Will someone understand this in 6 months?"

---

**Last Updated: January 2026**
**Framework Version: 1.0**
**Compliance Level: MANDATORY**
