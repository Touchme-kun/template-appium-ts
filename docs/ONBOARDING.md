# Developer Onboarding Checklist

Welcome to the Mobile Automation Framework team! This checklist will help you get up to speed quickly.

## Pre-Onboarding Checklist

### System Requirements
- [ ] **Operating System**: Windows 10+, macOS 12+, or Ubuntu 20.04+
- [ ] **RAM**: Minimum 8GB (16GB recommended for emulators)
- [ ] **Disk Space**: At least 50GB free space

### Required Accounts
- [ ] GitHub access to the repository
- [ ] BrowserStack account (optional, for cloud testing)

---

## Day 1: Environment Setup

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

### 3. Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.qa

# Verify build
npm run build
npm run lint
```

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment file configured
- [ ] Build successful
- [ ] Lint passes

### 4. VS Code Extensions

Install these recommended extensions:

- [ ] ESLint (`dbaeumer.vscode-eslint`)
- [ ] Prettier (`esbenp.prettier-vscode`)
- [ ] TypeScript (`ms-vscode.vscode-typescript-next`)
- [ ] Docker (`ms-azuretools.vscode-docker`)

---

## Day 2: Framework Understanding

### 1. Read Documentation
- [ ] [README.md](../README.md) — Project overview
- [ ] [Architecture Guide](./architecture.md) — Framework design
- [ ] [Best Practices](./best-practices.md) — Test writing guidelines
- [ ] [Contributing Guide](./contributing.md) — Contribution guidelines
- [ ] [Troubleshooting Guide](./troubleshooting.md) — Common issues

### 2. Explore Project Structure
- [ ] Understand folder structure in `src/`
- [ ] Review core classes in `src/core/`
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

## Day 3: Running Tests

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

### 2. Generate and View Reports

```bash
npm run report
```

- [ ] Generated Allure report
- [ ] Opened and explored report
- [ ] Located screenshots in failed tests

### 3. Run Tests on BrowserStack

```bash
# Ensure .env.qa has BrowserStack credentials
npm run test:browserstack:android
```

- [ ] Successfully connected to BrowserStack
- [ ] Ran a test on cloud device
- [ ] Viewed results in BrowserStack dashboard

---

## Additional Resources

- [Architecture Guide](./architecture.md) — Detailed framework design
- [Best Practices](./best-practices.md) — Coding and test standards
- [Log Structure Guide](./log-structure.md) — Logging and log management
- [Troubleshooting Guide](./troubleshooting.md) — Solutions to common issues

---

*Last Updated: June 2026*