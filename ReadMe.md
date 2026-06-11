# Appium TypeScript Mobile Automation Framework

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![WebdriverIO](https://img.shields.io/badge/WebdriverIO-9.x-orange.svg)](https://webdriver.io/)
[![Appium](https://img.shields.io/badge/Appium-3.x-purple.svg)](https://appium.io/)
[![BrowserStack](https://img.shields.io/badge/BrowserStack-Ready-brightgreen.svg)](https://browserstack.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-ready mobile test automation framework template built with TypeScript, WebdriverIO 9.x, and Appium 3.x. Supports Android and iOS native applications with TDD (Mocha) testing, multi-environment BrowserStack execution, and rich Allure reporting.

---

## 🚀 Features

- **Cross-Platform** — Android and iOS native app support
- **TypeScript** — Strict mode, full type safety throughout
- **Page Object Model** — Abstract `BaseScreen` with platform-specific screen implementations
- **Core Layer** — `BaseTest`, `ElementWrapper`, and `ScreenFactory` in `src/core/`
- **Gesture & Wait Utilities** — `GestureHelper` and `WaitHelper` in `src/utils/`
- **Multi-Environment** — `TEST_ENV=qa|preprod|prod` loads the correct `.env.*` file
- **BrowserStack** — Unified config with runtime platform selection (`BROWSERSTACK_PLATFORM=android|ios|all`)
- **Suite-Based Runs** — Named suites (`smoke`, `e2e`, `regression`) for targeted local execution
- **Allure Reports** — Step-level tracing, screenshots on failure, historical trends
- **Structured Logging** — Winston-based `Logger` with per-run log files and rotation
- **Docker Ready** — Docker + Docker Compose support included
- **CI/CD Ready** — GitHub Actions workflow included
- **Appium MCP** — `@gavrix/appium-mcp` integration for AI-assisted inspection

---

## 📋 Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18.x or higher | Required |
| Java JDK | 11 or higher | Required for Android |
| Android Studio + SDK | Latest | Required for Android |
| Appium | 3.x | Installed locally via npm |
| Xcode | 14.x or higher | macOS only, required for iOS |

---

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd template-appium-ts
npm install
```

### 2. Verify Appium Drivers

Appium 3.x and its drivers are installed locally as part of `npm install` via `appium`, `appium-uiautomator2-driver`, and `appium-xcuitest-driver` in `devDependencies`. No global install required.

```bash
# Verify drivers are available
npx appium driver list --installed
```

### 3. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.qa
```

Key variables in `.env.qa`:

```env
# Android
ANDROID_DEVICE_NAME=Pixel_7_API_33
ANDROID_PLATFORM_VERSION=13
ANDROID_APP_PATH=./apps/android/app.apk
ANDROID_APP_PACKAGE=com.example.app
ANDROID_APP_ACTIVITY=.MainActivity

# iOS
IOS_DEVICE_NAME=iPhone 15 Pro
IOS_PLATFORM_VERSION=17.0
IOS_APP_PATH=./apps/ios/App.app

# BrowserStack
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
BROWSERSTACK_APP_ID=bs://your-android-app-id
BROWSERSTACK_IOS_APP_ID=bs://your-ios-app-id

# Logging
LOG_LEVEL=warn
```

> `TEST_ENV` selects which env file to load — e.g. `TEST_ENV=qa` loads `.env.qa`.
> Never commit `.env.*` files — they are gitignored.

### 4. Run Tests

```bash
# Local Android — all tests
npm run test:android

# Local Android — smoke suite only
npm run test:android:smoke

# BrowserStack Android
npm run test:browserstack:android

# Generate and open Allure report
npm run allure:generate
npm run allure:open
```

---

## 📁 Project Structure

```
template-appium-ts/
├── src/
│   ├── core/                     # Framework foundation
│   │   ├── BaseTest.ts           # Test lifecycle management
│   │   ├── BaseScreen.ts         # Abstract base for all screens
│   │   ├── ElementWrapper.ts     # Enhanced element interactions
│   │   ├── ScreenFactory.ts      # Platform screen factory
│   │   └── index.ts
│   │
│   ├── screens/                  # Page Object Model
│   │   ├── android/              # Android screen implementations
│   │   └── ios/                  # iOS screen implementations
│   │
│   ├── utils/                    # All utilities
│   │   ├── Logger.ts             # Winston structured logger
│   │   ├── AllureReporter.ts     # Allure integration
│   │   ├── GestureHelper.ts      # Touch gestures (swipe, pinch, drag)
│   │   ├── WaitHelper.ts         # Smart wait utilities
│   │   ├── TestDataFactory.ts    # Test data generation
│   │   ├── ApiHelper.ts          # API utilities
│   │   ├── DeviceLogsHelper.ts   # Device log capture
│   │   ├── ScreenshotUtil.ts     # Screenshot utilities
│   │   └── index.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   └── framework.types.ts
│   │
│   └── tests/                    # Test files
│       ├── specs/
│       │   └── android/          # TDD spec files
│       └── data/                 # JSON test data files
│
├── configs/                      # WebdriverIO configurations
│   ├── wdio.conf.ts              # Base configuration
│   ├── wdio.android.conf.ts      # Local Android
│   ├── wdio.ios.conf.ts          # Local iOS
│   ├── wdio.docker.conf.ts       # Docker
│   ├── wdio.browserstack.conf.ts         # BrowserStack (platform via env)
│   ├── wdio.browserstack.android.conf.ts # BrowserStack Android (platform-locked)
│   └── wdio.browserstack.ios.conf.ts     # BrowserStack iOS (platform-locked)
│
├── scripts/                      # Utility scripts
│   ├── allure-utils.ts           # Allure history/categories helpers
│   └── cleanup-logs.ts           # Log archive and cleanup
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── apps/                         # App binaries (gitignored)
│   ├── android/
│   └── ios/
│
├── reports/                      # Test reports (gitignored)
│   ├── allure-results/
│   ├── allure-report/
│   └── screenshots/
│
├── log/                          # Winston logs (gitignored)
│   ├── test-execution.log
│   ├── error.log
│   └── runs/
│
└── .github/
    └── workflows/
        └── mobile-tests.yml
```

---

## 🧪 Writing Tests

### TDD — Mocha Spec

```typescript
// src/tests/specs/android/myfeature.android.spec.ts
import { expect } from '@wdio/globals';
import { BaseTest } from '../../../core/BaseTest';
import { LoginScreen, DashboardScreen } from '../../../screens/android';
import loginTd from '../../data/login.json';

describe('My Feature (Android)', () => {
  let loginScreen: LoginScreen;
  let dashboardScreen: DashboardScreen;

  before(async () => {
    await BaseTest.initializeSuite('My Feature Suite');
    loginScreen = new LoginScreen();
    dashboardScreen = new DashboardScreen();
  });

  beforeEach(async () => {
    await BaseTest.setupTest('My Test', 'My Feature Suite');
    await BaseTest.waitForAppReady();
  });

  it('should display dashboard after login', async () => {
    // Arrange
    const user = {
      mobile: loginTd.tiers[0].mobileNumber,
      pin: loginTd.tiers[0].pin,
    };

    // Act
    await loginScreen.enterMobileNumber(user.mobile);
    await loginScreen.tapLoginButton();

    // Assert
    await expect(await dashboardScreen.verifyDashboardLoaded()).toBe(true);
  });

  afterEach(async function () {
    await BaseTest.teardownTest(this.currentTest?.state === 'passed');
  });

  after(async () => {
    await BaseTest.cleanupSuite('My Feature Suite');
    await BaseTest.resetApp();
  });
});
```

### Adding a New Screen

```typescript
// src/screens/android/NewFeatureScreen.ts
import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';

export class NewFeatureScreen extends BaseScreen {
  protected get screenLocator(): string {
    return 'android=new UiSelector().resourceId("SCREEN_ID")';
  }

  private readonly actionButtonSelector = 'android=new UiSelector().text("Action")';

  async tapActionButton(): Promise<void> {
    await AllureReporter.step('Tap action button', async () => {
      Logger.step('Tapping action button');
      await this.tap(this.actionButtonSelector);
    });
  }

  async verifyScreenLoaded(): Promise<boolean> {
    await this.waitForScreen({ timeout: 30000, timeoutMsg: 'Screen not loaded within 30s' });
    return true;
  }
}
```

Export from `src/screens/android/index.ts`:
```typescript
export { NewFeatureScreen } from './NewFeatureScreen';
```

---

## 📋 Available Scripts

### Local Test Execution

| Command | Description |
|---------|-------------|
| `npm run test:android` | Run all tests on local Android emulator |
| `npm run test:android:smoke` | Run smoke suite on local Android |
| `npm run test:android:e2e` | Run e2e suite on local Android |
| `npm run test:android:regression` | Run regression suite on local Android |
| `npm run test:ios` | Run all tests on local iOS simulator |
| `npm run test:ios:smoke` | Run smoke suite on local iOS |
| `npm run test:ios:e2e` | Run e2e suite on local iOS |
| `npm run test:ios:regression` | Run regression suite on local iOS |

### BrowserStack

| Command | Description |
|---------|-------------|
| `npm run test:browserstack:android` | Run Android suite on BrowserStack (QA env) |
| `npm run test:browserstack:ios` | Run iOS suite on BrowserStack (QA env) |

> For other environments prefix with `cross-env TEST_ENV=preprod` or `TEST_ENV=prod`.
> Platform is controlled via `BROWSERSTACK_PLATFORM=android|ios|all` in `wdio.browserstack.conf.ts`.

### Build & Quality

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run clean` | Remove `dist/`, `allure-results/`, `allure-report/` |
| `npm run lint` | Run ESLint on `src/` and `tests/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Run Prettier on `src/`, `tests/`, `configs/` |
| `npm run prepare` | Install Husky git hooks |

### Reporting

| Command | Description |
|---------|-------------|
| `npm run allure:prepare` | Prepare results for CI |
| `npm run allure:history` | Preserve Allure trend history |
| `npm run allure:clean` | Clean old Allure results |
| `npm run allure:generate` | Generate Allure HTML report |
| `npm run allure:open` | Open report in browser |
| `npm run report` | History + generate + open (local use) |
| `npm run report:ci` | Prepare + generate (CI use) |

### Log Management

| Command | Description |
|---------|-------------|
| `npm run logs:cleanup` | Archive + clean (recommended) |
| `npm run logs:archive` | Archive logs older than 30 days |
| `npm run logs:clean` | Delete archives older than 90 days |

### Docker

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build development Docker image |
| `npm run docker:up` | Start Docker Compose services |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run docker:clean` | Stop services, remove volumes, prune system |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Values | Effect |
|----------|--------|--------|
| `TEST_ENV` | `qa`, `preprod`, `prod` | Selects `.env.<value>` to load |
| `BROWSERSTACK_PLATFORM` | `android`, `ios`, `all` | Selects capabilities in BrowserStack config |
| `LOG_LEVEL` | `error`, `warn`, `info`, `debug` | Controls log verbosity |
| `ANDROID_PLATFORM_VERSION` | e.g. `13`, `16` | Overrides default Android OS version |
| `BROWSERSTACK_ANDROID_DEVICES` | Comma-separated names | Overrides default Android device list |
| `BROWSERSTACK_IOS_DEVICES` | Comma-separated names | Overrides default iOS device list |
| `BUILD_NUMBER` | Any string | Used in BrowserStack build name |

### Configuration Hierarchy

```
wdio.conf.ts (Base)
    ├── wdio.android.conf.ts              Local Android
    ├── wdio.ios.conf.ts                  Local iOS
    ├── wdio.docker.conf.ts               Docker
    ├── wdio.browserstack.conf.ts         BrowserStack (platform via BROWSERSTACK_PLATFORM)
    ├── wdio.browserstack.android.conf.ts BrowserStack Android (platform-locked)
    └── wdio.browserstack.ios.conf.ts     BrowserStack iOS (platform-locked)
```

### Named Suites

Suites are defined in `wdio.conf.ts` and targeted with `--suite`:

```bash
npm run test:android:smoke       # --suite smoke
npm run test:android:e2e         # --suite e2e
npm run test:android:regression  # --suite regression
```

---

## 📊 Reporting

After a test run:

```bash
npm run allure:generate
npm run allure:open
```

Reports include step-level traces (via `AllureReporter.step()`), failure screenshots auto-attached from the `afterTest` hook, device logs, and historical trend data. Logs are in `log/` with automatic Winston rotation.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Folder structure, design patterns, core components |
| [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) | Test writing standards and locator guidelines |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branch strategy, commit conventions, PR process |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | Day-by-day new developer setup checklist |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |
| [docs/LOG_MANAGEMENT.md](docs/LOG_MANAGEMENT.md) | Logging architecture and cleanup |
| [ENVIRONMENTS.md](ENVIRONMENTS.md) | Environment setup and configuration reference |

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes. Key points:

- Import from `src/core/` — not `src/base/` or `src/helpers/`
- Use `Logger.*` — never `console.log`
- Wrap screen actions in `AllureReporter.step()`
- Define selectors as `private readonly` strings
- Follow commit convention: `type(scope): subject`

---

*Last Updated: June 2026*