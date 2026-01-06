# Appium Mobile Automation Framework

A production-ready, enterprise-grade mobile test automation framework supporting iOS and Android applications using TypeScript, Appium, and WebdriverIO.

## 🚀 Features

- **Cross-Platform Support**: iOS and Android native, hybrid, and mobile web apps
- **Dual Test Approach**: Both TDD (Mocha) and BDD (Cucumber) support
- **TypeScript**: Full type safety with strict mode
- **Page Object Model**: Clean separation of test logic and page interactions
- **Allure Reporting**: Rich, interactive test reports with screenshots
- **Cloud Integration**: BrowserStack ready for cloud device testing
- **Docker Ready**: Containerized test execution
- **CI/CD Integration**: GitHub Actions workflows included

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Java JDK**: 11 or higher (for Appium)
- **Android Studio**: For Android testing (with SDK and emulator)
- **Xcode**: For iOS testing (macOS only)
- **Appium**: v2.x (installed globally or via npx)

### Platform-Specific Requirements

#### Android
- Android SDK with platform-tools
- Android Emulator or physical device
- ANDROID_HOME environment variable set

#### iOS (macOS only)
- Xcode with Command Line Tools
- iOS Simulator or physical device with developer profile
- WebDriverAgent installed

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd appium-ts-framework
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Appium and Drivers

```bash
# Install Appium globally (optional)
npm install -g appium

# Install required drivers
appium driver install uiautomator2
appium driver install xcuitest
```

### 4. Configure Environment

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=development
TEST_ENV=dev

# Appium Configuration
APPIUM_HOST=localhost
APPIUM_PORT=4723

# Android Configuration
ANDROID_APP_PATH=./apps/android/app-debug.apk
ANDROID_APP_PACKAGE=com.example.app
ANDROID_APP_ACTIVITY=com.example.app.MainActivity
ANDROID_DEVICE_NAME=Pixel_7_API_34
ANDROID_PLATFORM_VERSION=14

# iOS Configuration
IOS_APP_PATH=./apps/ios/App.app
IOS_BUNDLE_ID=com.example.app
IOS_DEVICE_NAME=iPhone 15 Pro
IOS_PLATFORM_VERSION=17.0

# BrowserStack Configuration (optional)
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key
```

### 5. Add Your App

Place your application files in the `apps` directory:

```
apps/
├── android/
│   └── app-debug.apk
└── ios/
    └── App.app
```

## 🏃 Running Tests

### Start Appium Server

```bash
# Start Appium server
npm run appium

# Or with specific port
appium --port 4723
```

### Run Tests Locally

```bash
# Run all Android tests
npm run test:android

# Run all iOS tests
npm run test:ios

# Run specific test file
npm run test -- --spec tests/specs/android/login.spec.ts

# Run tests with specific tag (BDD)
npm run test:android -- --cucumberOpts.tagExpression='@smoke'
```

### Run Tests on BrowserStack

```bash
# Android on BrowserStack
npm run test:android:browserstack

# iOS on BrowserStack
npm run test:ios:browserstack
```

### Run Specific Test Types

```bash
# Run only TDD tests (Mocha)
npm run test:tdd

# Run only BDD tests (Cucumber)
npm run test:bdd
```

## 📊 Test Reports

### Generate Allure Report

```bash
# Generate and open Allure report
npm run allure:generate
npm run allure:open

# Or combined
npm run report
```

Reports are saved to `allure-report/` directory.

### View Test Logs

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error-level logs only

## 📁 Project Structure

```
├── src/
│   ├── base/                 # Base classes
│   │   ├── BaseTest.ts       # Test lifecycle management
│   │   └── ElementWrapper.ts # Enhanced element interactions
│   ├── config/               # Configuration files
│   │   └── environment.ts    # Environment configuration
│   ├── helpers/              # Helper utilities
│   │   ├── GestureHelper.ts  # Mobile gestures
│   │   └── WaitHelper.ts     # Wait utilities
│   ├── screens/              # Page Object Model
│   │   ├── BaseScreen.ts     # Base screen class
│   │   ├── LoginScreen.ts    # Login screen
│   │   ├── android/          # Android-specific screens
│   │   └── ios/              # iOS-specific screens
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility classes
│       ├── Logger.ts         # Winston logger
│       ├── AllureReporter.ts # Allure integration
│       ├── ApiHelper.ts      # API utilities
│       └── TestDataFactory.ts# Test data generation
├── tests/
│   ├── specs/                # TDD test files
│   │   ├── android/          # Android tests
│   │   └── ios/              # iOS tests
│   ├── features/             # BDD feature files
│   │   └── step-definitions/ # Cucumber step definitions
│   └── data/                 # Test data files
├── configs/                  # WDIO configurations
│   ├── wdio.conf.ts          # Base configuration
│   ├── wdio.android.conf.ts  # Android configuration
│   ├── wdio.ios.conf.ts      # iOS configuration
│   └── wdio.browserstack.conf.ts # BrowserStack config
├── reports/                  # Test reports output
├── logs/                     # Test execution logs
├── docker/                   # Docker configuration
└── .github/workflows/        # CI/CD pipelines
```

## 📝 Writing Tests

### TDD Approach (Mocha)

```typescript
// tests/specs/android/login.spec.ts
import { LoginScreen } from '../../../src/screens';
import { BaseTest } from '../../../src/base';

describe('Login Feature', () => {
  const loginScreen = new LoginScreen();

  before(async () => {
    await BaseTest.initializeSuite('Login Tests');
  });

  beforeEach(async () => {
    await BaseTest.setupTest('Login Test');
  });

  it('should login with valid credentials', async () => {
    await loginScreen.waitForScreen();
    await loginScreen.login('user@example.com', 'password123');
    
    // Assertions
    await expect(homeScreen.welcomeMessage).toBeDisplayed();
  });

  afterEach(async () => {
    await BaseTest.teardownTest(true);
  });
});
```

### BDD Approach (Cucumber)

```gherkin
# tests/features/login.feature
@smoke @login
Feature: User Login
  As a user
  I want to log in to the app
  So that I can access my account

  Scenario: Successful login
    Given I am on the login screen
    When I enter username "user@example.com"
    And I enter password "password123"
    And I tap the login button
    Then I should see the home screen
```

```typescript
// tests/features/step-definitions/login.steps.ts
import { Given, When, Then } from '@wdio/cucumber-framework';
import { LoginScreen, HomeScreen } from '../../../src/screens';

const loginScreen = new LoginScreen();
const homeScreen = new HomeScreen();

Given('I am on the login screen', async () => {
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
  await homeScreen.waitForScreen();
});
```

## 🎯 Page Object Model

### Creating a Screen Object

```typescript
// src/screens/MyScreen.ts
import { BaseScreen } from './BaseScreen';
import { ScreenFactory } from './ScreenFactory';

export class MyScreen extends BaseScreen {
  protected get screenLocator(): string {
    return ScreenFactory.getLocator(
      'android=resourceId("my_screen")',
      '~myScreenAccessibilityId'
    );
  }

  // Locators
  private get myButton() {
    return $(ScreenFactory.getLocator(
      'android=resourceId("my_button")',
      '~myButton'
    ));
  }

  // Actions
  async tapMyButton(): Promise<void> {
    await this.tap(await this.myButton);
  }
}
```

## 🔧 Configuration

### WebdriverIO Configuration

The framework uses a hierarchical configuration:

1. **Base Config** (`wdio.conf.ts`): Common settings
2. **Platform Config** (`wdio.android.conf.ts`, `wdio.ios.conf.ts`): Platform-specific
3. **Cloud Config** (`wdio.browserstack.conf.ts`): Cloud testing

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `TEST_ENV` | Test environment | `dev` |
| `APPIUM_HOST` | Appium server host | `localhost` |
| `APPIUM_PORT` | Appium server port | `4723` |
| `LOG_LEVEL` | Logging level | `info` |

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t mobile-automation -f docker/Dockerfile .
```

### Run Tests in Docker

```bash
docker-compose up test-runner
```

## 🔄 CI/CD Integration

The framework includes GitHub Actions workflows for:

- **Pull Request Validation**: Run tests on every PR
- **Scheduled Regression**: Daily test runs
- **Multi-Device Matrix**: Parallel execution on multiple devices

### Secrets Required

Configure these secrets in your GitHub repository:

- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`
- `SLACK_WEBHOOK` (optional, for notifications)

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test` | Run all tests |
| `npm run test:android` | Run Android tests |
| `npm run test:ios` | Run iOS tests |
| `npm run test:android:browserstack` | Run on BrowserStack (Android) |
| `npm run test:ios:browserstack` | Run on BrowserStack (iOS) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run build` | Compile TypeScript |
| `npm run allure:generate` | Generate Allure report |
| `npm run allure:open` | Open Allure report |
| `npm run appium` | Start Appium server |

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
