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

---

## Overview

The framework is built on the following technology stack:

| Component | Technology | Version |
|-----------|------------|---------|
| Language | TypeScript | 5.x |
| Test Runner | WebdriverIO | 9.x |
| Mobile Automation | Appium | 3.x |
| TDD Framework | Mocha | 10.x |
| Assertions | Expect-WebdriverIO | Built-in |
| Reporting | Allure | 2.x |
| Logging | Winston | 3.x |
| Cloud Platform | BrowserStack | - |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Test Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────────────────┐ │
│  │   Mocha Specs    │  │     Test Data (JSON / Factories)     │ │
│  └──────────────────┘  └──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Page Object Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     BaseScreen                               ││
│  │  ┌──────────────────┐  ┌──────────────────┐                ││
│  │  │  Android Screens │  │   iOS Screens    │                ││
│  │  └──────────────────┘  └──────────────────┘                ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        Core Layer                                │
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
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                      Device Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐│
│  │   Android Emulator/     │  │   iOS Simulator/                ││
│  │   Physical Device       │  │   Physical Device               ││
│  └─────────────────────────┘  └─────────────────────────────────┘│
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
- Reusable page object methods

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
src/
├── core/                     # Framework foundation
│   ├── BaseTest.ts           # Test lifecycle management
│   ├── BaseScreen.ts         # Abstract base for all screens
│   ├── ElementWrapper.ts     # Enhanced element interactions
│   ├── ScreenFactory.ts      # Platform screen factory
│   └── index.ts
│
├── screens/                  # Page Object Model
│   ├── android/              # Android screen implementations
│   │   ├── ExampleScreen.ts  # Replace with your screens
│   │   └── index.ts
│   └── ios/                  # iOS screen implementations
│       ├── ExampleScreen.ts
│       └── index.ts
│
├── utils/                    # All utilities
│   ├── Logger.ts             # Winston structured logger
│   ├── AllureReporter.ts     # Allure integration
│   ├── GestureHelper.ts      # Touch gestures
│   ├── WaitHelper.ts         # Smart wait utilities
│   ├── TestDataFactory.ts    # Test data generation
│   ├── ApiHelper.ts          # API utilities
│   ├── DeviceLogsHelper.ts   # Device log capture
│   ├── ScreenshotUtil.ts     # Screenshot utilities
│   └── index.ts
│
├── types/                    # TypeScript type definitions
│   └── framework.types.ts
│
└── tests/                    # Test files
    ├── specs/
    │   └── android/          # TDD spec files
    └── data/                 # JSON test data files

configs/                      # WebdriverIO configurations
├── wdio.conf.ts              # Base configuration
├── wdio.android.conf.ts      # Local Android
├── wdio.ios.conf.ts          # Local iOS
├── wdio.docker.conf.ts       # Docker
├── wdio.browserstack.conf.ts         # BrowserStack (platform via env)
├── wdio.browserstack.android.conf.ts # BrowserStack Android
└── wdio.browserstack.ios.conf.ts     # BrowserStack iOS

scripts/                      # Utility scripts
├── allure-utils.ts
└── cleanup-logs.ts

docker/
├── Dockerfile
└── docker-compose.yml

apps/                         # App binaries (gitignored)
├── android/
└── ios/

reports/                      # Test reports (gitignored)
├── allure-results/
├── allure-report/
└── screenshots/

log/                          # Winston logs (gitignored)

.github/
└── workflows/
    └── mobile-tests.yml
```

---

## Core Components

### BaseScreen (`src/core/BaseScreen.ts`)

Abstract base class providing common element interaction methods:

- `waitForScreen()` — Wait for screen identifier to be visible
- `waitForElement()` — Wait for a specific element using string selector
- `tap()` — Click an element identified by selector string
- `enterText()` — Type into an input field
- `getText()` — Retrieve element text
- `isElementDisplayed()` — Check visibility with timeout
- `scrollToElement()` — Scroll to find an element
- `waitForElementNotDisplayed()` — Wait for disappearance (loading spinners)

Screen classes extend BaseScreen and provide:
1. A `screenLocator` getter (uniquely identifies the screen)
2. `private readonly` string selectors for elements
3. Public action methods wrapping `this.tap()`, `this.enterText()`, etc.
4. Verification methods returning `Promise<boolean>`

### BaseTest (`src/core/BaseTest.ts`)

Test lifecycle manager providing:

- `initializeSuite()` — Suite-level setup (Allure environment info)
- `setupTest()` — Per-test setup (context, logging, Allure annotations)
- `teardownTest()` — Per-test cleanup (screenshots on failure)
- `cleanupSuite()` — Suite-level cleanup
- `waitForAppReady()` — Poll until app responds
- `resetApp()` — Terminate + relaunch without reinstalling
- `getPlatform()` — Detect Android/iOS at runtime

### ScreenFactory (`src/core/ScreenFactory.ts`)

Platform abstraction layer:

- `ScreenFactory.getScreen(AndroidScreen, IOScreen)` — Returns platform-appropriate instance
- `ScreenFactory.getLocator(androidLocator, iosLocator)` — Returns platform-specific selector
- `ScreenFactory.getValue(androidValue, iosValue)` — Returns platform-specific value
- Singleton caching per screen type per platform

---

## Design Patterns

### Page Object Model

Every screen in the app has a corresponding class in `src/screens/<platform>/`. Screen classes:

- Encapsulate all element locators (private readonly string constants)
- Expose business-level action methods (public, async)
- Provide state verification methods (return `Promise<boolean>`)
- Log all actions via `Logger.step()`
- Never contain test assertions

See [best-practices.md](./best-practices.md) for detailed screen class examples.

### Factory Pattern

The `ScreenFactory` handles platform differences transparently:

- **Simple locator differences**: `ScreenFactory.getLocator()` returns a string selector
- **Different behavior**: `ScreenFactory.getValue()` returns a typed value
- **Entirely different screens**: `ScreenFactory.getScreen()` instantiates the right class

---

## Configuration Architecture

```
wdio.conf.ts (Base)
    ├── wdio.android.conf.ts              Local Android
    ├── wdio.ios.conf.ts                  Local iOS
    ├── wdio.docker.conf.ts               Docker
    ├── wdio.browserstack.conf.ts         BrowserStack (platform via BROWSERSTACK_PLATFORM)
    ├── wdio.browserstack.android.conf.ts BrowserStack Android (platform-locked)
    └── wdio.browserstack.ios.conf.ts     BrowserStack iOS (platform-locked)
```

Environment-specific values are loaded from `.env.${TEST_ENV}` files:

```bash
TEST_ENV=qa     → .env.qa
TEST_ENV=preprod → .env.preprod
TEST_ENV=prod   → .env.prod
```

---

## Test Execution Flow

```
1. User runs npm run test:android
2. WebdriverIO loads wdio.android.conf.ts
   └── Extends wdio.conf.ts (base)
3. .env.${TEST_ENV} is loaded via dotenv
4. Appium service starts (local) or BrowserStack connects
5. Session is created on device/emulator
6. before() hook: BaseTest.initializeSuite() → Allure environment info
7. beforeEach() hook: BaseTest.setupTest() → context, start time
8. Test executes:
   a. Screen methods interact with app via Appium/WDIO
   b. All actions logged via Logger
   c. Allure steps recorded
9. afterEach() hook:
   a. BaseTest.teardownTest() → screenshot on failure
   b. Page source attached on failure
10. after() hook: BaseTest.cleanupSuite()
11. Reports generated via Allure
```

---

## Cross-Platform Strategy

### Detection

Platform is detected from `browser.capabilities.platformName`:

```typescript
const platform = BaseTest.getPlatform(); // 'android' | 'ios'
```

### Screen Selection

Use `ScreenFactory` to select platform-specific implementations:

```typescript
const screen = ScreenFactory.getScreen(AndroidScreen, IOScreen);
```

### Locator Selection

Use `ScreenFactory.getLocator()` for platform-specific selectors:

```typescript
await $(ScreenFactory.getLocator(
  'android=new UiSelector().text("Confirm")',
  '~confirmButton'
));
```

---

## Reporting Architecture

### Allure Integration

- `AllureReporter` utility wraps the Allure API
- Each test step is tracked (via `AllureReporter.step()` or `AllureReporter.addStep()`)
- Screenshots captured automatically on test failure
- Device and environment info attached at suite start
- Page source attached on failure for debugging

### Report Generation

```bash
npm run allure:generate    # Build HTML report from results
npm run allure:open        # Open in browser
npm run report             # History + generate + open (local)
npm run report:ci          # Prepare + generate (CI)
```

---

*Last Updated: June 2026*