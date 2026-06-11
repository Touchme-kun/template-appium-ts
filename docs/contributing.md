# Contributing Guide

Thank you for considering contributing to this Mobile Automation Framework! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Writing Tests](#writing-tests)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

### Our Pledge

We are committed to providing a friendly, safe, and welcoming environment for all contributors. We expect everyone to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or insulting comments
- Publishing others' private information
- Other conduct that could be considered inappropriate

---

## Getting Started

### Prerequisites

1. **Node.js** v18.x or higher
2. **Git** for version control
3. **VS Code** (recommended) with extensions: ESLint, Prettier, TypeScript
4. **Appium** and required drivers

### Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Copy the appropriate env file
cp .env.example .env.qa

# Verify setup
npm run lint
npm run build
```

### Understanding the Codebase

Before contributing, familiarize yourself with:

1. [Architecture Guide](./architecture.md) — Framework design and patterns
2. [Best Practices Guide](./best-practices.md) — Coding and test standards
3. Existing code in `src/core/`, `src/screens/`, and `src/utils/`

---

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

```
main
 └── develop
      ├── feature/add-new-screen
      ├── feature/improve-gestures
      ├── bugfix/fix-swipe-issue
      └── hotfix/critical-fix
```

### Creating a Branch

```bash
# Sync with latest
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-new-screen` |
| Bug Fix | `bugfix/description` | `bugfix/fix-otp-scroll` |
| Hotfix | `hotfix/description` | `hotfix/critical-login-fix` |
| Refactor | `refactor/description` | `refactor/simplify-base-screen` |
| Docs | `docs/description` | `docs/update-architecture` |

---

## Coding Standards

### TypeScript Guidelines

#### 1. Type Safety

```typescript
// ✅ Good: Explicit types
async function enterMobileNumber(mobile: string): Promise<void> {
  // implementation
}

// ✅ Good: Interface for complex objects
interface LoginCredentials {
  mobile: string;
  pin: string;
  otp?: string;
}

// ❌ Bad: Using 'any'
async function login(mobile: any, pin: any): Promise<any> {
  // implementation
}
```

#### 2. Naming Conventions

```typescript
// Classes: PascalCase
class DashboardScreen extends BaseScreen {}

// Methods/Functions: camelCase
async function enterMobileNumber(mobile: string): Promise<void> {}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = 10000;

// Selectors: private readonly UPPER_SNAKE_CASE
private readonly SUBMIT_BUTTON = '~submit-button';

// Interfaces: PascalCase
interface WaitOptions {
  timeout?: number;
  timeoutMsg?: string;
}
```

#### 3. File Organization

```typescript
// 1. Imports — external first, then internal
import { $ } from '@wdio/globals';
import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';

// 2. Types/Interfaces (if file-local)
interface ActionOptions {
  retry?: number;
}

// 3. Class definition
export class ExampleScreen extends BaseScreen {
  // 3a. Screen locator (required)
  protected get screenLocator(): string {
    return '~example-screen';
  }

  // 3b. Private readonly selectors
  private readonly SUBMIT_BUTTON = '~submit-button';
  private readonly TEXT_INPUT = '~text-input';

  // 3c. Public action methods
  async submitForm(value: string): Promise<void> {
    Logger.step(`Submitting form: ${value}`);
    await this.enterText(this.TEXT_INPUT, value);
    await this.tap(this.SUBMIT_BUTTON);
  }

  // 3d. Verification methods
  async verifyScreenLoaded(): Promise<boolean> {
    await this.waitForScreen({ timeout: 30000 });
    return true;
  }
}
```

### ESLint Rules

The project uses ESLint with TypeScript support. Key rules:

```json
{
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

Run linting:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier Formatting

The project uses Prettier for consistent formatting:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Format code:

```bash
npm run format
```

---

## Writing Tests

### Test File Structure

```typescript
// src/tests/specs/android/feature.android.spec.ts
import { expect } from '@wdio/globals';
import { BaseTest } from '../../../core/BaseTest';
import { ExampleScreen } from '../../../screens/android';
import exampleTd from '../../data/example.json';

describe('Feature Name (Android)', () => {
  let exampleScreen: ExampleScreen;

  before(async () => {
    await BaseTest.initializeSuite('Feature Test Suite');
    exampleScreen = new ExampleScreen();
    // TODO: Add authentication/setup flow here
  });

  beforeEach(async () => {
    await BaseTest.setupTest('Feature Test', 'Feature Test Suite');
    await BaseTest.waitForAppReady();
    // TODO: Navigate to starting screen
  });

  describe('Happy Path', () => {
    it('should perform action successfully', async () => {
      // Arrange
      const testData = { value: exampleTd.example.value };

      // Act
      await exampleScreen.performPrimaryAction(testData.value);

      // Assert
      await expect(await exampleScreen.verifyActionSuccess()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      // Act
      await exampleScreen.performPrimaryAction('');

      // Assert
      await expect(await exampleScreen.verifyErrorDisplayed()).toBe(true);
    });
  });

  afterEach(async function () {
    await BaseTest.teardownTest(this.currentTest?.state === 'passed');
  });

  after(async () => {
    await BaseTest.cleanupSuite('Feature Test Suite');
    await BaseTest.resetApp();
  });
});
```

### Test Best Practices

#### 1. Test Independence

```typescript
// ✅ Good: Each test resets to a known state
beforeEach(async () => {
  await BaseTest.setupTest('Test Name', 'Suite Name');
  await BaseTest.waitForAppReady();
});

after(async () => {
  await BaseTest.cleanupSuite('Suite Name');
  await BaseTest.resetApp();
});

// ❌ Bad: Depends on previous test state
it('should be on dashboard from previous test', async () => {
  // Assumes login happened in another test
});
```

#### 2. Clear Test Names

```typescript
// ✅ Good: Descriptive names following "should [behavior] when [condition]"
it('should show dashboard when login credentials are valid', async () => {});
it('should show error when OTP is incorrect', async () => {});

// ❌ Bad: Vague names
it('should work', async () => {});
it('test login', async () => {});
```

#### 3. AAA Pattern

```typescript
it('should complete flow successfully', async () => {
  // Arrange — set up test data and preconditions
  const testData = { value: exampleTd.example.value };

  // Act — perform the action being tested
  await featureScreen.performPrimaryAction(testData.value);

  // Assert — verify the expected outcome
  await expect(await featureScreen.verifyActionSuccess()).toBe(true);
});
```

---

## Pull Request Process

1. **Ensure your branch is up to date** with `develop`
2. **Run lint and build** before creating PR:
   ```bash
   npm run lint
   npm run build
   ```
3. **Write a clear PR description** explaining:
   - What changed and why
   - How to test
   - Screenshots if UI-related
4. **Add reviewers** familiar with the codebase
5. **Address review feedback** promptly
6. **Merge only after** all discussions resolved and CI passes

---

## Commit Message Guidelines

We follow conventional commits:

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Maintenance, dependencies, config |

### Examples

```
feat(screen): add login screen with OTP verification
fix(gesture): correct swipe direction on iOS
docs(readme): update installation instructions
refactor(base): simplify waitForElement logic
test(smoke): add login flow smoke test
```

---

*Last Updated: June 2026*