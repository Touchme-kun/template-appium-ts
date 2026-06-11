# Troubleshooting Guide

This guide provides solutions to common issues you may encounter when using this mobile automation framework.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Appium Server Issues](#appium-server-issues)
3. [Android Issues](#android-issues)
4. [iOS Issues](#ios-issues)
5. [Test Execution Issues](#test-execution-issues)
6. [Element Location Issues](#element-location-issues)
7. [BrowserStack Issues](#browserstack-issues)
8. [Reporting Issues](#reporting-issues)
9. [CI/CD Issues](#cicd-issues)

---

## Installation Issues

### Node.js Version Mismatch

**Problem**: `npm install` fails with Node version errors.

**Solution**:
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm install 18
nvm use 18

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors

**Problem**: `npm run build` shows TypeScript errors.

**Solution**:
```bash
# Check for errors without emitting
npx tsc --noEmit

# Common fixes:
# 1. Update TypeScript types
npm install @types/node@latest --save-dev

# 2. Clear build cache and rebuild
rm -rf dist/
npm run build
```

---

## Appium Server Issues

### Appium Won't Start

**Problem**: Appium command not found or fails to start.

**Solution**:
```bash
# Verify Appium is installed
npx appium --version

# Check if port 4723 is already in use
# macOS/Linux
lsof -i :4723
kill -9 <PID>

# Windows (PowerShell)
netstat -ano | findstr :4723
taskkill /PID <PID> /F
```

### Appium Driver Not Found

**Problem**: "Could not find a driver for automationName 'UiAutomator2'"

**Solution**:
```bash
# List installed drivers
npx appium driver list

# Install required drivers (npm packages handle this automatically)
# Verify they are present in node_modules
npx appium driver list --installed
```

---

## Android Issues

### ADB Device Not Found

**Problem**: `adb devices` shows no devices or `unauthorized`.

**Solution**:
```bash
# Restart ADB server
adb kill-server
adb start-server
adb devices

# For emulator — ensure it's running
emulator -list-avds
emulator -avd <avd_name>

# For physical device — enable USB Debugging
# Settings > Developer Options > USB Debugging
```

### ANDROID_HOME Not Set

**Problem**: "ANDROID_HOME is not set"

**Solution**:
```bash
# macOS/Linux — add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows — set via System Environment Variables
# ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
# Add to PATH: %ANDROID_HOME%\platform-tools
```

### App Package/Activity Not Found

**Problem**: "Could not start activity" or app doesn't launch.

**Solution**:
```bash
# Install app and find package name
adb install apps/android/app.apk
adb shell pm list packages | grep <app_name>

# Get the launch activity
adb shell dumpsys package <package_name> | grep -A 1 "MAIN"

# Verify capabilities in wdio.android.conf.ts match
# 'appium:appPackage' and 'appium:appActivity'
```

---

## iOS Issues

### Xcode Command Line Tools

**Problem**: "xcode-select: error: tool 'xcodebuild' requires Xcode"

**Solution**:
```bash
sudo xcode-select --install
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### WebDriverAgent Build Failed

**Problem**: WebDriverAgent fails to build.

**Solution**:
```bash
# Navigate to WDA folder
cd node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent

# Open in Xcode
open WebDriverAgent.xcodeproj

# In Xcode:
# 1. Select WebDriverAgentRunner target
# 2. Signing & Capabilities > Team > Select your team
# 3. Change Bundle Identifier to a unique value
# 4. Build (Cmd+B)
```

### iOS Simulator Not Found

**Problem**: "Could not find a device to launch"

**Solution**:
```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 15 Pro"

# Create a new simulator if needed
xcrun simctl create "iPhone 15 Pro" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-17-0
```

---

## Test Execution Issues

### Tests Not Finding Elements

**Problem**: `Element not found` or timeout errors.

**Solution**:
```typescript
// 1. Increase timeout on waitForScreen
await this.waitForScreen({
  timeout: 30000,
  timeoutMsg: 'Screen not displayed within 30s'
});

// 2. Validate your selector in Appium Inspector first
// Connect Inspector to a running session and inspect the element tree

// 3. Try alternative locator strategies
await $('android=new UiSelector().resourceId("RESOURCE_ID")');
await $('android=new UiSelector().text("Button Text")');
await $('android=new UiSelector().description("content-desc")');

// 4. Check app state — ensure you're on the expected screen
await exampleScreen.verifyScreenLoaded();
```

### Flaky Tests

**Problem**: Tests pass/fail inconsistently.

**Solution**:
```typescript
// 1. Use waitForScreen with a descriptive timeoutMsg
await this.waitForScreen({
  timeout: 30000,
  timeoutMsg: 'Screen not loaded — app may still be animating'
});

// 2. Use WaitHelper for custom conditions
import { WaitHelper } from '../../utils/WaitHelper';
await WaitHelper.waitForDisplayed(selector, { timeout: 15000 });

// 3. Wait for loading indicators to disappear before acting
await WaitHelper.waitForNotDisplayed(loadingSpinnerSelector, { timeout: 30000 });

// 4. Use retry logic for intermittent network-dependent actions
await WaitHelper.retryWithWait(async () => {
  await this.tap(this.confirmButtonSelector);
}, 3, 1000);
```

### App Crashes During Test

**Problem**: App crashes and test fails with session error.

**Solution**:
```bash
# Check Android crash logs
adb logcat | grep -i "AndroidRuntime\|FATAL\|crash"

# Or filter by app package
adb logcat | grep <app_package>
```

---

## Element Location Issues

### Element Not Found

**Problem**: Cannot find element with any locator strategy.

**Solution**:

1. Open **Appium Inspector** and connect to a running session
2. Inspect the element and note `resource-id`, `text`, or `content-desc`
3. Try each locator strategy in order:

```typescript
// 1. Accessibility ID (content-desc)
await $('~accessibilityId');

// 2. UIAutomator2 resource ID
await $('android=new UiSelector().resourceId("com.app:id/element")');

// 3. UIAutomator2 text
await $('android=new UiSelector().text("Button Text")');

// 4. Dump page source for manual inspection
const source = await browser.getPageSource();
console.log(source); // Search for your element
```

### Stale Element Reference

**Problem**: "Stale element reference" error after navigation or animation.

**Solution**:
```typescript
// Use string selectors + this.tap() / this.enterText() instead of holding element references
// BaseScreen re-resolves the selector on each call

// ✅ Good: selector string resolved fresh each call
await this.tap(this.actionButtonSelector);

// ❌ Bad: element reference goes stale after navigation
const btn = await $(this.actionButtonSelector);
await navigateAway();
await btn.click(); // Stale!
```

---

## BrowserStack Issues

### Authentication Failed

**Problem**: "Unauthorized" error when connecting to BrowserStack.

**Solution**:
```bash
# Verify credentials are set in your env file
cat .env.qa | grep BROWSERSTACK

# Test authentication directly
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  https://api.browserstack.com/app-automate/plan.json
```

### App Upload Failed

**Problem**: "Invalid app URL" or upload timeout.

**Solution**:
```bash
# Upload APK manually and get bs:// URL
curl -u "username:key" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/android/app.apk"

# Set the returned app_url in your env file
BROWSERSTACK_APP_ID=bs://xxxxxxxxxx
```

---

## Reporting Issues

### Allure Report Not Generating

**Problem**: Allure report is empty or command fails.

**Solution**:
```bash
# Check allure-results folder has content
ls -la allure-results/

# Regenerate report
rm -rf allure-report/
npm run allure:generate

# Install Allure CLI globally if missing
npm install -g allure-commandline
```

### Screenshots Not Attached to Report

**Problem**: Screenshots missing from failed test entries in Allure.

**Solution**:
```typescript
// Screenshot capture is handled in wdio.conf.ts afterTest hook
afterTest: async function (test, _context, { passed }) {
  if (!passed) {
    await AllureReporter.captureScreenshot(`${test.title}_failure`);
  }
}
```

---

## CI/CD Issues

### GitHub Actions Failing

**Problem**: Tests fail in CI but pass locally.

**Solution**:
```yaml
# 1. Ensure secrets are set in GitHub Settings > Secrets
env:
  BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
  BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
  TEST_ENV: qa

# 2. Add sufficient job timeout
jobs:
  test:
    timeout-minutes: 30

# 3. Cache npm dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 4. Upload logs on failure
- name: Upload logs
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: test-logs
    path: log/
```

### Environment Variables Not Picked Up

**Problem**: Tests run but credentials or app config missing.

**Solution**:

The framework loads `.env.${TEST_ENV}` (e.g. `.env.qa`) — not a plain `.env` file. Ensure `TEST_ENV` is set:

```bash
TEST_ENV=qa npm run test:android
```

---

## Quick Reference

### Common Commands

```bash
# Appium
npx appium --version                    # Check version
npx appium driver list --installed      # Verify drivers

# Android
adb devices                             # List connected devices/emulators
adb logcat | grep -i crash              # Watch for crash logs
adb shell pm list packages              # Find app package

# iOS (macOS only)
xcrun simctl list devices               # List simulators

# Tests
npm run test:android                    # Run local Android tests
npm run test:browserstack:android       # Run on BrowserStack
npm run logs:report                     # Check log statistics
npm run allure:open                     # View Allure report

# Logs
Get-Content log\error.log               # Windows: view error log
tail -f log/test-execution.log          # macOS/Linux: follow test log
npm run logs:cleanup                    # Archive and clean old logs
```

### Useful Links

- [Appium Documentation](http://appium.io/docs/en/latest/)
- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [BrowserStack App Automate](https://www.browserstack.com/docs/app-automate)
- [Allure Framework](https://docs.qameta.io/allure/)

---

## Getting Help

If you're still stuck:

1. **Check logs first**: `log/error.log` is the fastest path to root cause
2. **Open the Allure report**: `npm run allure:open` — check the step trace and failure screenshot
3. **Search GitHub Issues** for similar problems
4. **Open a GitHub Issue** with:
   - Description of the problem
   - Steps to reproduce
   - Environment details (OS, Node version, Android/iOS version)
   - Relevant log output from `log/error.log`

---

*Last Updated: June 2026*