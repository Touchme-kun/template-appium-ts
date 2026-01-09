# Developer Onboarding Checklist

Welcome to the Mobile Automation Framework team! This checklist will help you get up to speed quickly.

## 📋 Pre-Onboarding Checklist

### System Requirements
- [ ] **Operating System**: Windows 10+, macOS 12+, or Ubuntu 20.04+
- [ ] **RAM**: Minimum 8GB (16GB recommended for emulators)
- [ ] **Disk Space**: At least 50GB free space
- [ ] **Display**: 1920x1080 or higher resolution

### Required Accounts
- [ ] GitHub access to the repository
- [ ] BrowserStack account (request credentials from team lead)
- [ ] Slack access to #mobile-automation channel

---

## 🛠️ Day 1: Environment Setup

### 1. Install Core Tools

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org) or `nvm install 18` |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com) |
| Java JDK | 11+ | [adoptium.net](https://adoptium.net) |

**Verification Steps:**
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show git version 2.x.x
java --version    # Should show openjdk 11 or higher
```

- [ ] Node.js installed and verified
- [ ] Git installed and verified
- [ ] VS Code installed
- [ ] Java JDK installed and verified

### 2. Install Platform-Specific Tools

#### For Android Testing:
- [ ] Android Studio installed
- [ ] Android SDK installed (via Android Studio)
- [ ] Android Emulator configured
- [ ] ANDROID_HOME environment variable set
- [ ] platform-tools added to PATH

**Verify Android Setup:**
```bash
adb --version
emulator -list-avds
```

#### For iOS Testing (macOS only):
- [ ] Xcode installed from App Store
- [ ] Xcode Command Line Tools: `xcode-select --install`
- [ ] iOS Simulator available

### 3. Install Appium

```bash
# Install Appium globally
npm install -g appium@latest

# Install required drivers
appium driver install uiautomator2
appium driver install xcuitest

# Verify installation
appium --version
appium driver list --installed
```

- [ ] Appium installed
- [ ] UiAutomator2 driver installed (Android)
- [ ] XCUITest driver installed (iOS)

### 4. Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd "Appium TS"

# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env

# Verify build
npm run build
npm run lint
```

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment file configured
- [ ] Build successful
- [ ] Lint passes

### 5. VS Code Extensions

Install these recommended extensions:

- [ ] ESLint (`dbaeumer.vscode-eslint`)
- [ ] Prettier (`esbenp.prettier-vscode`)
- [ ] TypeScript (`ms-vscode.vscode-typescript-next`)
- [ ] Cucumber (`alexkrechik.cucumberautocomplete`)
- [ ] GitLens (`eamodio.gitlens`)
- [ ] Docker (`ms-azuretools.vscode-docker`)

---

## 📖 Day 2: Framework Understanding

### 1. Read Documentation
- [ ] [README.md](./README.md) - Project overview
- [ ] [docs/README.md](./docs/README.md) - Detailed user guide
- [ ] [ARCHITECTURE.md](./ARCHITECTURE.md) - Framework design
- [ ] [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [ ] [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues

### 2. Explore Project Structure
- [ ] Understand folder structure in `src/`
- [ ] Review base classes in `src/base/`
- [ ] Explore screen objects in `src/screens/`
- [ ] Check utilities in `src/utils/`
- [ ] Review configurations in `configs/`

### 3. Key Concepts to Understand
- [ ] Page Object Model (POM) pattern
- [ ] BaseScreen and screen inheritance
- [ ] ScreenFactory for platform abstraction
- [ ] GestureHelper for mobile interactions
- [ ] Test data management with TestDataFactory

---

## 🧪 Day 3: Running Tests

### 1. Run Your First Local Test

```bash
# Start Appium server (in separate terminal)
npm run appium

# Run Android tests
npm run test:android

# Run iOS tests (macOS only)
npm run test:ios
```

- [ ] Started Appium server successfully
- [ ] Ran Android tests locally
- [ ] Ran iOS tests locally (if on macOS)

### 2. Run BDD (Cucumber) Tests

```bash
# Run all BDD tests
npm run test:bdd

# Run with specific tag
npm run test:cucumber:smoke
```

- [ ] Ran BDD tests successfully
- [ ] Understand feature file structure
- [ ] Understand step definitions

### 3. Generate and View Reports

```bash
npm run report
```

- [ ] Generated Allure report
- [ ] Opened and explored report
- [ ] Located screenshots in failed tests

### 4. Run Tests on BrowserStack

```bash
# Ensure .env has BrowserStack credentials
npm run test:cucumber:dry:browserstack:android
```

- [ ] Successfully connected to BrowserStack
- [ ] Ran a test on cloud device
- [ ] Viewed results in BrowserStack dashboard

---

## ✍️ Day 4: Writing Your First Test

### 1. Create a Simple TDD Test

Create `tests/specs/android/my-first-test.spec.ts`:

```typescript
import { BaseTest } from '../../../src/base';
import { LoginScreen } from '../../../src/screens';

describe('My First Test Suite', () => {
  const loginScreen = new LoginScreen();

  before(async () => {
    await BaseTest.initializeSuite('My First Tests');
  });

  it('should display login screen', async () => {
    await loginScreen.waitForScreen();
    await expect(loginScreen.usernameField).toBeDisplayed();
  });
});
```

- [ ] Created test file
- [ ] Ran test successfully
- [ ] Understood test structure

### 2. Create a Simple BDD Test

Create `tests/features/my-feature.feature`:

```gherkin
@smoke
Feature: My First Feature

  Scenario: Verify app launch
    Given I launch the application
    Then I should see the login screen
```

Create step definitions in `tests/features/step-definitions/my-feature.steps.ts`:

```typescript
import { Given, Then } from '@wdio/cucumber-framework';
import { LoginScreen } from '../../../src/screens';

const loginScreen = new LoginScreen();

Given('I launch the application', async () => {
  // App launches automatically
});

Then('I should see the login screen', async () => {
  await loginScreen.waitForScreen();
  await expect(loginScreen.screenContainer).toBeDisplayed();
});
```

- [ ] Created feature file
- [ ] Created step definitions
- [ ] Ran BDD test successfully

### 3. Create a Page Object

If needed, create a new screen object:

```typescript
// src/screens/NewScreen.ts
import { BaseScreen } from './BaseScreen';

export class NewScreen extends BaseScreen {
  // Define the main screen locator
  protected get screenLocator(): string {
    return '~new-screen-container';
  }

  // Define element locators
  get headerTitle() {
    return $('~header-title');
  }

  // Define actions
  async verifyScreenLoaded(): Promise<boolean> {
    await this.waitForScreen();
    return (await this.headerTitle).isDisplayed();
  }
}
```

- [ ] Created page object class
- [ ] Exported from `src/screens/index.ts`
- [ ] Used in a test

---

## 🐳 Day 5: Docker & CI/CD

### 1. Run Tests in Docker

```bash
# Build Docker image
npm run docker:build

# Run tests in container (BrowserStack)
npm run docker:browserstack:smoke:qa
```

- [ ] Built Docker image
- [ ] Ran containerized tests

### 2. Understand CI/CD Pipeline

Review `.github/workflows/mobile-tests.yml`:

- [ ] Understand workflow triggers
- [ ] Understand job structure
- [ ] Understand matrix strategy for devices
- [ ] Know where artifacts are stored
- [ ] Understand Allure report deployment

### 3. Create a Pull Request

Make a small change and submit a PR:

```bash
git checkout -b feature/my-first-contribution
# Make changes
git add .
git commit -m "feat: add my first test"
git push origin feature/my-first-contribution
```

- [ ] Created feature branch
- [ ] Made changes
- [ ] Pushed and created PR
- [ ] CI pipeline ran successfully

---

## 📚 Recommended Learning Path

### Week 1
- [ ] Complete all onboarding tasks above
- [ ] Pair program with a senior team member
- [ ] Write 2-3 simple test cases

### Week 2
- [ ] Learn advanced element locators (XPath, CSS)
- [ ] Master gesture helpers (swipe, scroll, pinch)
- [ ] Understand wait strategies
- [ ] Write a complete feature test

### Week 3
- [ ] Learn visual testing concepts
- [ ] Understand API test setup utilities
- [ ] Explore performance measurement
- [ ] Contribute to existing test coverage

### Week 4
- [ ] Debug and fix flaky tests
- [ ] Optimize test execution time
- [ ] Document your learnings
- [ ] Present to the team

---

## 🆘 Getting Help

### Resources
- **Documentation**: Check `docs/` folder first
- **Troubleshooting**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Slack**: Post in #mobile-automation channel
- **Pair Programming**: Request a session with team members

### Common First-Week Questions

1. **Why is my test flaky?**
   → Check wait strategies, add explicit waits

2. **How do I find element locators?**
   → Use Appium Inspector or platform tools

3. **Why won't BrowserStack connect?**
   → Check `.env` credentials and network

4. **How do I debug a failing test?**
   → Check logs, screenshots, and Allure report

---

## ✅ Onboarding Completion

Once you've completed all items:

- [ ] Submit completed checklist to team lead
- [ ] Schedule 1:1 to discuss learning experience
- [ ] Identify areas for framework improvement
- [ ] Start assigned test automation tasks

**Congratulations! You're now ready to contribute to the Mobile Automation Framework! 🎉**
