# Architecture Guide

This document describes the architecture, design patterns, and technical decisions made in this mobile automation framework.

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Folder Structure](#folder-structure)
4. [Core Components](#core-components)
5. [Design Patterns](#design-patterns)
6. [Configuration Architecture](#configuration-architecture)
7. [Test Execution Flow](#test-execution-flow)
8. [Cross-Platform Strategy](#cross-platform-strategy)
9. [Reporting Architecture](#reporting-architecture)
10. [Best Practices](#best-practices)

---

## Overview

The framework is built on the following technology stack:

| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | 5.x |
| Test Runner | WebdriverIO | 8.x |
| Mobile Automation | Appium | 2.x |
| TDD Framework | Mocha | 10.x |
| BDD Framework | Cucumber | 8.x |
| Assertions | Expect-WebdriverIO | Built-in |
| Reporting | Allure | 2.x |
| Logging | Winston | 3.x |
| Cloud Platform | BrowserStack | - |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Mocha     │  │  Cucumber   │  │     Test Data           │  │
│  │   Specs     │  │  Features   │  │     (JSON/Factories)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Page Object Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     BaseScreen                               ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         ││
│  │  │ LoginScreen │  │ HomeScreen  │  │ SettingsScreen│        ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘         ││
│  │  ┌───────────────────────┐  ┌───────────────────────┐      ││
│  │  │   Android Screens     │  │     iOS Screens       │      ││
│  │  └───────────────────────┘  └───────────────────────┘      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      Framework Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  BaseTest   │  │  Element    │  │   ScreenFactory         │  │
│  │             │  │  Wrapper    │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Utility Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │  Logger  │ │ Gestures │ │  Waits   │ │ Reporter │ │  API   ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      Driver Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    WebdriverIO                               ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ││
│  │  │   Appium    │  │ BrowserStack│  │   Local Runner      │  ││
│  │  │   Service   │  │   Service   │  │                     │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      Device Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────────┤
│  │   Android Emulator/     │  │   iOS Simulator/                │
│  │   Physical Device       │  │   Physical Device               │
│  └─────────────────────────┘  └─────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. SOLID Principles

- **Single Responsibility**: Each class has one purpose
- **Open/Closed**: Classes are open for extension, closed for modification
- **Liskov Substitution**: Screen classes can be substituted for their base class
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### 2. DRY (Don't Repeat Yourself)

- Common functionality in base classes
- Shared utilities for cross-cutting concerns
- Reusable step definitions

### 3. KISS (Keep It Simple, Stupid)

- Clear, readable code
- Avoid over-engineering
- Self-documenting method names

### 4. Fail Fast

- Immediate feedback on failures
- Clear error messages
- Screenshots on failure

---

## Folder Structure

```
mobile-automation-framework/
├── src/                          # Source code
│   ├── base/                     # Base classes
│   │   ├── BaseTest.ts           # Test lifecycle management
│   │   ├── ElementWrapper.ts     # Enhanced element interactions
│   │   └── index.ts              # Module exports
│   │
│   ├── config/                   # Configuration
│   │   ├── environment.ts        # Environment variables
│   │   └── index.ts              # Module exports
│   │
│   ├── helpers/                  # Helper utilities
│   │   ├── GestureHelper.ts      # Mobile gestures (swipe, pinch, etc.)
│   │   ├── WaitHelper.ts         # Wait utilities
│   │   └── index.ts              # Module exports
│   │
│   ├── screens/                  # Page Object Model
│   │   ├── BaseScreen.ts         # Abstract base screen
│   │   ├── LoginScreen.ts        # Login screen (cross-platform)
│   │   ├── HomeScreen.ts         # Home screen (cross-platform)
│   │   ├── ScreenFactory.ts      # Factory for platform screens
│   │   ├── android/              # Android-specific screens
│   │   │   └── AndroidLoginScreen.ts
│   │   ├── ios/                  # iOS-specific screens
│   │   │   └── IOSLoginScreen.ts
│   │   └── index.ts              # Module exports
│   │
│   ├── types/                    # TypeScript types
│   │   ├── framework.types.ts    # Framework type definitions
│   │   └── index.ts              # Module exports
│   │
│   └── utils/                    # Utilities
│       ├── Logger.ts             # Winston logger
│       ├── AllureReporter.ts     # Allure integration
│       ├── TestDataFactory.ts    # Test data generation
│       ├── DateTimeUtil.ts       # Date/time utilities
│       ├── ScreenshotUtil.ts     # Screenshot utilities
│       ├── ApiHelper.ts          # API utilities
│       ├── PerformanceUtil.ts    # Performance measurement
│       └── index.ts              # Module exports
│
├── tests/                        # Test files
│   ├── specs/                    # TDD test specs
│   │   ├── android/              # Android tests
│   │   │   └── login.spec.ts
│   │   └── ios/                  # iOS tests
│   │       └── login.spec.ts
│   │
│   ├── features/                 # BDD feature files
│   │   ├── login.feature         # Feature files
│   │   └── step-definitions/     # Step definitions
│   │       └── login.steps.ts
│   │
│   └── data/                     # Test data
│       └── users.json            # Test data files
│
├── configs/                      # WebdriverIO configurations
│   ├── wdio.conf.ts              # Base configuration
│   ├── wdio.android.conf.ts      # Android configuration
│   ├── wdio.ios.conf.ts          # iOS configuration
│   └── wdio.browserstack.conf.ts # BrowserStack configuration
│
├── apps/                         # Application binaries
│   ├── android/                  # Android APK files
│   └── ios/                      # iOS APP/IPA files
│
├── reports/                      # Test reports
│   ├── allure-results/           # Raw Allure results
│   ├── allure-report/            # Generated HTML report
│   └── screenshots/              # Screenshot captures
│
├── logs/                         # Log files
│   ├── combined.log              # All logs
│   └── error.log                 # Error logs only
│
├── docker/                       # Docker configuration
│   └── Dockerfile                # Container definition
│
└── .github/                      # GitHub configuration
    └── workflows/                # CI/CD workflows
        └── mobile-tests.yml      # Test automation workflow
```

---

## Core Components

### 1. BaseTest

Manages test lifecycle and provides common test utilities.

```typescript
class BaseTest {
  // Lifecycle management
  static initializeSuite(suiteName: string): Promise<void>
  static setupTest(testName: string): Promise<void>
  static teardownTest(testPassed: boolean): Promise<void>
  static cleanupSuite(suiteName: string): Promise<void>

  // Platform detection
  static getPlatform(): 'android' | 'ios'
  static isAndroid(): boolean
  static isIOS(): boolean

  // App management
  static resetApp(): Promise<void>
  static relaunchApp(): Promise<void>
  static closeApp(): Promise<void>

  // Context management
  static setTestData(key: string, value: unknown): void
  static getTestData<T>(key: string): T | undefined
}
```

### 2. BaseScreen

Abstract base class for all screen objects.

```typescript
abstract class BaseScreen {
  // Must be implemented by subclasses
  protected abstract get screenLocator(): string;

  // Wait utilities
  async waitForScreen(timeout?: number): Promise<void>
  async waitForElement(element: WebdriverIO.Element, timeout?: number): Promise<void>

  // Interaction utilities
  async tap(element: WebdriverIO.Element): Promise<void>
  async enterText(element: WebdriverIO.Element, text: string): Promise<void>
  async getText(element: WebdriverIO.Element): Promise<string>

  // Scroll utilities
  async scrollDown(): Promise<void>
  async scrollUp(): Promise<void>
  async scrollToElement(selector: string): Promise<void>

  // State checks
  async isDisplayed(element: WebdriverIO.Element): Promise<boolean>
  async isEnabled(element: WebdriverIO.Element): Promise<boolean>
}
```

### 3. ElementWrapper

Enhanced element interactions with retry logic and error handling.

```typescript
class ElementWrapper {
  // Factory method
  static $(selector: string, options?: ElementOptions): ElementWrapper

  // Wait methods
  async waitForExist(timeout?: number): Promise<boolean>
  async waitForDisplayed(timeout?: number): Promise<boolean>
  async waitForClickable(timeout?: number): Promise<boolean>

  // Interaction methods
  async click(): Promise<void>
  async setValue(value: string): Promise<void>
  async getText(): Promise<string>
  async getAttribute(name: string): Promise<string | null>

  // State checks
  async exists(): Promise<boolean>
  async isDisplayed(): Promise<boolean>
  async isEnabled(): Promise<boolean>
}
```

### 4. ScreenFactory

Factory pattern for creating platform-specific screens.

```typescript
class ScreenFactory {
  // Screen creation
  static getScreen<T>(androidScreen: Constructor<T>, iosScreen: Constructor<T>): T
  static createScreen<T>(androidScreen: Constructor<T>, iosScreen: Constructor<T>): T

  // Locator utilities
  static getLocator(androidLocator: string, iosLocator: string): string
  static getValue<T>(androidValue: T, iosValue: T): T

  // Cache management
  static clearCache(): void
}
```

### 5. GestureHelper

Mobile-specific gesture interactions.

```typescript
class GestureHelper {
  // Swipe gestures
  static swipeUp(options?: SwipeOptions): Promise<void>
  static swipeDown(options?: SwipeOptions): Promise<void>
  static swipeLeft(element?: Element, options?: SwipeOptions): Promise<void>
  static swipeRight(element?: Element, options?: SwipeOptions): Promise<void>

  // Multi-touch gestures
  static pinchOpen(element?: Element): Promise<void>
  static pinchClose(element?: Element): Promise<void>

  // Tap gestures
  static longPress(element: Element, duration?: number): Promise<void>
  static doubleTap(element: Element): Promise<void>

  // Drag and drop
  static dragAndDrop(source: Element, target: Element): Promise<void>
}
```

### 6. Logger

Winston-based structured logging.

```typescript
class Logger {
  // Log levels
  static debug(message: string, data?: any): void
  static info(message: string, metadata?: object): void
  static warn(message: string, error?: Error): void
  static error(message: string, error?: Error): void

  // Test context
  static step(stepName: string): void
  static setTestContext(testName: string): void
}
```

---

## Design Patterns

### 1. Page Object Model (POM)

Each screen is represented by a class that encapsulates:
- Element locators
- User actions
- Screen-specific logic

```typescript
class LoginScreen extends BaseScreen {
  // Locators (private)
  private get usernameField() { return $('~username'); }
  private get passwordField() { return $('~password'); }
  private get loginButton() { return $('~login'); }

  // Actions (public)
  async enterUsername(username: string): Promise<void> {
    await this.enterText(await this.usernameField, username);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLoginButton();
  }
}
```

### 2. Factory Pattern

Used for creating platform-specific screen instances:

```typescript
// Cross-platform screen creation
const loginScreen = ScreenFactory.getScreen(
  AndroidLoginScreen,
  IOSLoginScreen
);

// Platform-specific locators
const locator = ScreenFactory.getLocator(
  'android=resourceId("button")',  // Android
  '~buttonAccessibilityId'         // iOS
);
```

### 3. Singleton Pattern

Used for utilities that maintain state:

```typescript
class EnvironmentConfig {
  private static instance: EnvironmentConfig;

  static getInstance(): EnvironmentConfig {
    if (!this.instance) {
      this.instance = new EnvironmentConfig();
    }
    return this.instance;
  }
}
```

### 4. Builder Pattern

Used for test data creation:

```typescript
const user = TestDataFactory.createUser({
  email: 'custom@example.com',
  // Other properties use defaults
});
```

### 5. Template Method Pattern

BaseScreen defines the algorithm structure, subclasses implement specifics:

```typescript
abstract class BaseScreen {
  // Template method
  async waitForScreen(): Promise<void> {
    await this.waitForElement($(this.screenLocator));
  }

  // Abstract method - implemented by subclasses
  protected abstract get screenLocator(): string;
}
```

---

## Configuration Architecture

### Configuration Hierarchy

```
wdio.conf.ts (Base)
    ├── wdio.android.conf.ts (Android)
    ├── wdio.ios.conf.ts (iOS)
    └── wdio.browserstack.conf.ts (Cloud)
```

### Base Configuration

Contains common settings:
- Test framework (Mocha)
- Reporters (Allure, Spec)
- Timeouts
- Hooks
- Services

### Platform Configuration

Extends base with platform-specific:
- Capabilities
- App path
- Device settings
- Platform-specific services

### Environment Variables

Managed through `EnvironmentConfig` class:

```typescript
class EnvironmentConfig {
  get appiumUrl(): string
  get androidAppPath(): string
  get iosAppPath(): string
  get browserStackCredentials(): { username: string; accessKey: string }
}
```

---

## Test Execution Flow

```
1. Test Initialization
   └── Load configuration
   └── Start Appium server (if local)
   └── Initialize reporter

2. Suite Setup (before)
   └── BaseTest.initializeSuite()
   └── Create session
   └── Install app (if needed)

3. Test Setup (beforeEach)
   └── BaseTest.setupTest()
   └── Reset app state
   └── Navigate to starting screen

4. Test Execution
   └── Execute test steps
   └── Take screenshots
   └── Log actions

5. Test Teardown (afterEach)
   └── BaseTest.teardownTest()
   └── Capture failure screenshot
   └── Attach logs

6. Suite Cleanup (after)
   └── BaseTest.cleanupSuite()
   └── Close session
   └── Generate reports
```

---

## Cross-Platform Strategy

### 1. Locator Strategy Priority

1. **Accessibility ID** (preferred): Works on both platforms
2. **Resource ID** (Android): `android=resourceId("...")`
3. **iOS Predicate** (iOS): `-ios predicate string:...`
4. **XPath** (fallback): Least performant, avoid when possible

### 2. Platform Detection

```typescript
// Using ScreenFactory
if (ScreenFactory.isAndroid()) {
  // Android-specific code
} else {
  // iOS-specific code
}

// Or using platform-specific values
const timeout = ScreenFactory.getValue(5000, 7000); // Android, iOS
```

### 3. Platform-Specific Screens

For significant UI differences, create separate screen classes:

```
screens/
├── LoginScreen.ts           # Cross-platform (common)
├── android/
│   └── AndroidLoginScreen.ts # Android-specific
└── ios/
    └── IOSLoginScreen.ts     # iOS-specific
```

---

## Reporting Architecture

### Allure Integration

```
Test Execution
     │
     ▼
┌─────────────────┐
│  AllureReporter │
│  - addStep()    │
│  - addAttachment│
│  - addFeature() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ allure-results/ │
│ (JSON files)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ allure generate │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ allure-report/  │
│ (HTML Report)   │
└─────────────────┘
```

### Report Features

- Test execution timeline
- Screenshots on failure
- Step-by-step test flow
- Environment information
- Device details
- Test categorization
- Historical trends

---

## Best Practices

### 1. Locator Best Practices

```typescript
// ✅ Good: Accessibility ID
$('~loginButton')

// ✅ Good: Resource ID (Android)
$('android=resourceId("com.app:id/login_button")')

// ⚠️ Acceptable: iOS Predicate
$('-ios predicate string:name == "Login"')

// ❌ Avoid: XPath (slow, brittle)
$('//android.widget.Button[@text="Login"]')
```

### 2. Wait Strategy

```typescript
// ✅ Explicit waits
await element.waitForDisplayed({ timeout: 10000 });

// ✅ Custom wait conditions
await browser.waitUntil(
  async () => await element.isDisplayed(),
  { timeout: 10000, timeoutMsg: 'Element not displayed' }
);

// ❌ Avoid: Hardcoded pauses
await browser.pause(5000);
```

### 3. Test Independence

```typescript
// ✅ Each test is independent
beforeEach(async () => {
  await BaseTest.setupTest('Test Name');
  await app.reset(); // Fresh state
});

// ❌ Avoid: Tests depending on previous test state
```

### 4. Meaningful Assertions

```typescript
// ✅ Clear assertion messages
await expect(loginButton).toBeDisplayed();
await expect(welcomeText).toHaveText('Welcome, User!');

// ❌ Avoid: Generic assertions
await expect(element).toBeTruthy();
```

### 5. Error Handling

```typescript
// ✅ Proper error handling with context
try {
  await loginScreen.login(user, pass);
} catch (error) {
  Logger.error('Login failed', error);
  await ScreenshotUtil.captureOnFailure('login_failure');
  throw error;
}
```

---

## Extending the Framework

### Adding a New Screen

1. Create screen class extending `BaseScreen`
2. Define `screenLocator`
3. Add locators as getters
4. Implement action methods
5. Export from `screens/index.ts`

### Adding a New Utility

1. Create utility class in `src/utils/`
2. Use static methods for stateless utilities
3. Add proper TypeScript types
4. Export from `utils/index.ts`
5. Add unit tests

### Adding a New Helper

1. Create helper in `src/helpers/`
2. Follow existing patterns
3. Add comprehensive logging
4. Export from `helpers/index.ts`

---

## Performance Considerations

1. **Element Caching**: ElementWrapper caches element references
2. **Screen Singleton**: ScreenFactory uses singleton pattern
3. **Parallel Execution**: Supported via WebdriverIO capabilities
4. **Lazy Loading**: Screens created on demand
5. **Efficient Waits**: Smart waits instead of fixed pauses

---

## Security Considerations

1. **No Hardcoded Credentials**: Use environment variables
2. **Secure Storage**: BrowserStack keys in CI secrets
3. **Log Sanitization**: Passwords masked in logs
4. **Git Ignore**: Sensitive files excluded

---

*Last Updated: January 2026*
