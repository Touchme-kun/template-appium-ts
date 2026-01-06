# Troubleshooting Guide

This guide provides solutions to common issues you may encounter when using the Mobile Automation Framework.

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
10. [Performance Issues](#performance-issues)

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
# Check for errors
npx tsc --noEmit

# Common fixes:
# 1. Update TypeScript types
npm install @types/node@latest --save-dev

# 2. Clear TypeScript cache
rm -rf dist/
npm run build
```

### Permission Denied Errors

**Problem**: `EACCES` permission errors on npm install.

**Solution**:
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use npm with user permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

## Appium Server Issues

### Appium Won't Start

**Problem**: `appium` command not found or fails to start.

**Solution**:
```bash
# Install Appium globally
npm install -g appium

# Verify installation
appium --version

# If using npx
npx appium

# Check if port is in use
lsof -i :4723
kill -9 <PID>
```

### Appium Driver Not Found

**Problem**: "Could not find a driver for automationName 'UiAutomator2'"

**Solution**:
```bash
# List installed drivers
appium driver list

# Install required drivers
appium driver install uiautomator2
appium driver install xcuitest

# Verify installation
appium driver list --installed
```

### Session Creation Failed

**Problem**: "An unknown server-side error occurred"

**Solution**:
```bash
# Check Appium logs
appium --log-level debug

# Verify capabilities
# Ensure app path is correct and file exists
ls -la ./apps/android/app.apk

# Check device is connected
adb devices
```

---

## Android Issues

### ADB Device Not Found

**Problem**: `adb devices` shows no devices.

**Solution**:
```bash
# Restart ADB
adb kill-server
adb start-server

# Check USB debugging is enabled on device
# Settings > Developer Options > USB Debugging

# For emulator, ensure it's running
emulator -list-avds
emulator -avd <avd_name>
```

### ANDROID_HOME Not Set

**Problem**: "ANDROID_HOME is not set"

**Solution**:
```bash
# macOS/Linux - Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools

# Windows - Set Environment Variables
# ANDROID_HOME = C:\Users\<user>\AppData\Local\Android\Sdk
# Add to PATH: %ANDROID_HOME%\platform-tools
```

### App Package/Activity Not Found

**Problem**: "Could not start activity"

**Solution**:
```bash
# Find correct package and activity
# 1. Install app manually
adb install app.apk

# 2. Get package name
adb shell pm list packages | grep <app_name>

# 3. Get launch activity
adb shell dumpsys package <package_name> | grep -A 1 "MAIN"

# 4. Alternative: Use APK Analyzer
# Android Studio > Build > Analyze APK
```

### Emulator Not Starting

**Problem**: Emulator hangs or crashes.

**Solution**:
```bash
# Cold boot emulator
emulator -avd <avd_name> -no-snapshot-load

# Check for hardware acceleration
# macOS
/usr/bin/kextstat | grep intel

# Linux
apt install qemu-kvm
kvm-ok

# Windows: Enable Hyper-V or HAXM in BIOS
```

---

## iOS Issues

### Xcode Command Line Tools

**Problem**: "xcode-select: error: tool 'xcodebuild' requires Xcode"

**Solution**:
```bash
# Install Xcode from App Store first, then:
sudo xcode-select --install
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

# Accept license
sudo xcodebuild -license accept
```

### WebDriverAgent Build Failed

**Problem**: WebDriverAgent fails to build.

**Solution**:
```bash
# Navigate to WDA folder
cd ~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent

# Open in Xcode
open WebDriverAgent.xcodeproj

# In Xcode:
# 1. Select WebDriverAgentRunner target
# 2. Signing & Capabilities > Team > Select your team
# 3. Change Bundle Identifier to unique value
# 4. Build (Cmd+B)

# Alternative: Build from command line
xcodebuild -project WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination 'id=<device_udid>' \
  test
```

### iOS Simulator Not Found

**Problem**: "Could not find a device to launch"

**Solution**:
```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 15 Pro"

# Create new simulator if needed
xcrun simctl create "iPhone 15 Pro" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-17-0
```

### Trust Certificate Error

**Problem**: "Could not install app - untrusted developer"

**Solution**:
1. On device: Settings > General > VPN & Device Management
2. Tap your developer certificate
3. Tap "Trust"

Or use:
```bash
# Get device UDID
idevice_id -l

# Install app with trust
ios-deploy --bundle <path_to_app> --debug
```

---

## Test Execution Issues

### Tests Not Finding Elements

**Problem**: "Element not found" or timeout errors.

**Solution**:
```typescript
// 1. Increase timeout
await element.waitForDisplayed({ timeout: 30000 });

// 2. Check if element is in view
await element.scrollIntoView();

// 3. Verify selector in Appium Inspector
// Use Appium Inspector to validate locators

// 4. Check if app is in correct state
await loginScreen.waitForScreen();
```

### Flaky Tests

**Problem**: Tests pass/fail inconsistently.

**Solution**:
```typescript
// 1. Add explicit waits
await WaitHelper.waitForElementDisplayed(element, 10000);

// 2. Add retry logic
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await element.click();
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await browser.pause(1000);
  }
}

// 3. Wait for animations
await browser.pause(500); // After navigation

// 4. Check for loading indicators
await WaitHelper.waitForElementNotDisplayed(loadingSpinner);
```

### Session Timeout

**Problem**: "Session not created" or session expires.

**Solution**:
```typescript
// In wdio.conf.ts
capabilities: [{
  'appium:newCommandTimeout': 300, // 5 minutes
  'appium:noReset': true, // Keep app state
}],

// Handle session recreation
async function ensureSession() {
  if (!browser.sessionId) {
    await browser.reloadSession();
  }
}
```

### App Crashes During Test

**Problem**: App crashes and test fails.

**Solution**:
```typescript
// 1. Check app logs
// Android
adb logcat | grep -i crash

// iOS
idevicesyslog | grep -i crash

// 2. Add crash detection
afterEach(async function() {
  try {
    // Check if app is still running
    const contexts = await browser.getContexts();
    if (contexts.length === 0) {
      Logger.error('App appears to have crashed');
      await browser.reloadSession();
    }
  } catch (error) {
    await browser.reloadSession();
  }
});
```

---

## Element Location Issues

### Element Not Found

**Problem**: Cannot find element with any locator.

**Solution**:
```bash
# 1. Use Appium Inspector
# - Start Appium server
# - Open Appium Inspector
# - Connect to session
# - Inspect element hierarchy

# 2. Get page source
await browser.getPageSource();

# 3. Try different locator strategies
# Accessibility ID (preferred)
$('~accessibilityId')

# Android UIAutomator
$('android=new UiSelector().resourceId("...")')

# iOS Predicate
$('-ios predicate string:name == "..."')
```

### Stale Element Reference

**Problem**: "Stale element reference" error.

**Solution**:
```typescript
// Re-fetch element before interaction
async clickElement(selector: string): Promise<void> {
  const element = await $(selector);
  await element.waitForClickable();
  await element.click();
}

// Use ElementWrapper with caching disabled
const element = $e(selector, { 
  retries: 3,
  retryDelay: 500 
});
element.clearCache();
await element.click();
```

### Element Not Clickable

**Problem**: "Element is not clickable at point (x, y)"

**Solution**:
```typescript
// 1. Scroll element into view
await element.scrollIntoView();

// 2. Wait for any overlays to disappear
await WaitHelper.waitForElementNotDisplayed(overlay);

// 3. Use JavaScript click as fallback
await browser.execute((el) => el.click(), element);

// 4. Tap by coordinates
const location = await element.getLocation();
const size = await element.getSize();
await browser.touchAction({
  action: 'tap',
  x: location.x + size.width / 2,
  y: location.y + size.height / 2
});
```

---

## BrowserStack Issues

### Authentication Failed

**Problem**: "Unauthorized" error on BrowserStack.

**Solution**:
```bash
# Check credentials
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY

# Verify credentials in .env
BROWSERSTACK_USERNAME=your_username
BROWSERSTACK_ACCESS_KEY=your_access_key

# Test authentication
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  https://api.browserstack.com/app-automate/plan.json
```

### App Upload Failed

**Problem**: "Invalid app URL" or upload timeout.

**Solution**:
```bash
# Upload app manually
curl -u "user:key" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@/path/to/app.apk"

# Use returned app_url in config
capabilities: [{
  'bstack:options': {
    app: 'bs://xxxxxxxxxx'
  }
}]
```

### Device Not Available

**Problem**: "No device available" error.

**Solution**:
```typescript
// 1. Check device availability
// https://www.browserstack.com/list-of-browsers-and-platforms/app_automate

// 2. Use device matrix
capabilities: [
  { deviceName: 'Samsung Galaxy S23', platformVersion: '13.0' },
  { deviceName: 'Samsung Galaxy S22', platformVersion: '12.0' }, // Fallback
]

// 3. Use BrowserStack queuing
'bstack:options': {
  queueTimeout: 600 // Wait up to 10 minutes
}
```

---

## Reporting Issues

### Allure Report Not Generating

**Problem**: Allure report is empty or not created.

**Solution**:
```bash
# Check allure-results folder exists
ls -la allure-results/

# Regenerate report
rm -rf allure-report/
npm run allure:generate

# Install Allure CLI if missing
npm install -g allure-commandline

# Check Allure is in reporter config
# wdio.conf.ts
reporters: [
  ['allure', {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: false,
  }]
]
```

### Screenshots Not Attached

**Problem**: Screenshots missing from reports.

**Solution**:
```typescript
// Ensure screenshot on failure is enabled
afterEach(async function() {
  if (this.currentTest?.state === 'failed') {
    await AllureReporter.captureScreenshot('Failure');
  }
});

// Verify screenshot utility
import { ScreenshotUtil } from '../src/utils';

await ScreenshotUtil.capture('test-screenshot', {
  attachToReport: true
});
```

---

## CI/CD Issues

### GitHub Actions Failing

**Problem**: Tests fail in CI but pass locally.

**Solution**:
```yaml
# .github/workflows/test.yml

# 1. Add sufficient timeout
jobs:
  test:
    timeout-minutes: 30

# 2. Cache dependencies
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}

# 3. Add retry on failure
- uses: nick-invision/retry@v2
  with:
    timeout_minutes: 15
    max_attempts: 3
    command: npm run test

# 4. Debug with SSH
- uses: mxschmitt/action-tmate@v3
  if: failure()
```

### Environment Variables Not Set

**Problem**: Missing env vars in CI.

**Solution**:
```yaml
# Set secrets in GitHub Settings > Secrets

# Reference in workflow
env:
  BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
  BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}

# Or in job
jobs:
  test:
    env:
      NODE_ENV: test
```

---

## Performance Issues

### Tests Running Slowly

**Problem**: Test execution takes too long.

**Solution**:
```typescript
// 1. Reduce waits
const FAST_TIMEOUT = 5000; // Instead of default 30000

// 2. Use parallel execution
// wdio.conf.ts
maxInstances: 5,

// 3. Disable unnecessary features
capabilities: [{
  'appium:noReset': true, // Don't reinstall app
  'appium:fullReset': false,
}]

// 4. Skip animations (Android)
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
```

### Memory Leaks

**Problem**: Node.js process consuming too much memory.

**Solution**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run test

# Clear caches between tests
afterEach(async () => {
  ScreenFactory.clearCache();
});

# Monitor memory
npm run test -- --logLevel=debug
```

---

## Quick Reference

### Common Commands

```bash
# Appium
appium                          # Start server
appium driver list              # List drivers
appium driver install uiautomator2  # Install driver

# Android
adb devices                     # List devices
adb logcat                      # View logs
adb shell pm list packages      # List packages

# iOS
xcrun simctl list devices       # List simulators
idevice_id -l                   # List connected devices

# Tests
npm run test                    # Run all tests
npm run test:android            # Run Android tests
npm run lint                    # Check code style
npm run allure:open             # View report
```

### Useful Links

- [Appium Documentation](http://appium.io/docs/en/latest/)
- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [BrowserStack App Automate](https://www.browserstack.com/docs/app-automate)
- [Allure Framework](https://docs.qameta.io/allure/)

---

## Getting Help

If you're still stuck:

1. **Check logs**: Look at Appium and test logs for details
2. **Search issues**: Check GitHub issues for similar problems
3. **Ask the team**: Post in #mobile-automation Slack channel
4. **Create issue**: Open a GitHub issue with:
   - Description of the problem
   - Steps to reproduce
   - Environment details
   - Relevant logs

---

*Last Updated: January 2026*
