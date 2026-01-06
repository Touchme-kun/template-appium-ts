# Contributing Guide

Thank you for considering contributing to the Mobile Automation Framework! This document provides guidelines and best practices for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Writing Tests](#writing-tests)
6. [Pull Request Process](#pull-request-process)
7. [Commit Message Guidelines](#commit-message-guidelines)
8. [Review Process](#review-process)

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
3. **VS Code** (recommended) with extensions:
   - ESLint
   - Prettier
   - TypeScript
4. **Appium** and required drivers

### Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd appium-ts-framework

# Install dependencies
npm install

# Set up Git hooks
npm run prepare

# Verify setup
npm run lint
npm run build
```

### Understanding the Codebase

Before contributing, familiarize yourself with:

1. [Architecture Guide](./ARCHITECTURE.md) - Framework design and patterns
2. [README.md](./docs/README.md) - Project overview and usage
3. Existing code in `src/` directory

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
| Feature | `feature/description` | `feature/add-biometric-auth` |
| Bug Fix | `bugfix/description` | `bugfix/fix-scroll-timeout` |
| Hotfix | `hotfix/description` | `hotfix/critical-login-fix` |
| Refactor | `refactor/description` | `refactor/improve-base-screen` |
| Docs | `docs/description` | `docs/update-readme` |

---

## Coding Standards

### TypeScript Guidelines

#### 1. Type Safety

```typescript
// ✅ Good: Explicit types
async function login(username: string, password: string): Promise<void> {
  // implementation
}

// ✅ Good: Interface for complex objects
interface UserCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// ❌ Bad: Using 'any'
async function login(username: any, password: any): Promise<any> {
  // implementation
}
```

#### 2. Naming Conventions

```typescript
// Classes: PascalCase
class LoginScreen extends BaseScreen {}

// Methods/Functions: camelCase
async function enterUsername(username: string): Promise<void> {}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = 10000;

// Private members: prefix with underscore or use private keyword
private _cachedElement: WebdriverIO.Element | null = null;

// Interfaces: PascalCase, descriptive names
interface ScreenOptions {
  timeout?: number;
  retries?: number;
}
```

#### 3. File Organization

```typescript
// 1. Imports (external, then internal)
import { Logger } from '../utils/Logger';
import { BaseScreen } from './BaseScreen';

// 2. Types/Interfaces
interface LoginOptions {
  rememberMe?: boolean;
}

// 3. Constants
const DEFAULT_TIMEOUT = 10000;

// 4. Class definition
export class LoginScreen extends BaseScreen {
  // 4a. Static properties
  static readonly screenName = 'Login';

  // 4b. Instance properties
  private timeout: number;

  // 4c. Constructor
  constructor(options?: LoginOptions) {
    super();
  }

  // 4d. Abstract implementations
  protected get screenLocator(): string {
    return '~loginScreen';
  }

  // 4e. Public methods
  async login(username: string, password: string): Promise<void> {}

  // 4f. Private methods
  private async validateCredentials(): Promise<boolean> {}
}

// 5. Exports (if not using export on class)
export default LoginScreen;
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

#### TDD (Mocha) Tests

```typescript
// tests/specs/android/feature.spec.ts
import { FeatureScreen } from '../../../src/screens';
import { BaseTest } from '../../../src/base';
import { TestDataFactory } from '../../../src/utils';

describe('Feature Name', () => {
  let featureScreen: FeatureScreen;
  
  before(async () => {
    await BaseTest.initializeSuite('Feature Tests');
    featureScreen = new FeatureScreen();
  });

  beforeEach(async () => {
    await BaseTest.setupTest('Test Name');
  });

  describe('Scenario Group', () => {
    it('should do something specific', async () => {
      // Arrange
      const testData = TestDataFactory.createUser();
      
      // Act
      await featureScreen.performAction(testData);
      
      // Assert
      await expect(featureScreen.resultElement).toBeDisplayed();
    });

    it('should handle edge case', async () => {
      // Test implementation
    });
  });

  afterEach(async () => {
    await BaseTest.teardownTest(true);
  });

  after(async () => {
    await BaseTest.cleanupSuite('Feature Tests');
  });
});
```

#### BDD (Cucumber) Tests

Feature file:
```gherkin
# tests/features/feature.feature
@feature @smoke
Feature: Feature Name
  As a user
  I want to do something
  So that I achieve a goal

  Background:
    Given I am logged in

  @positive
  Scenario: Successful action
    Given I am on the feature screen
    When I perform an action
    Then I should see the result

  @negative
  Scenario Outline: Invalid action
    Given I am on the feature screen
    When I enter invalid data "<data>"
    Then I should see error "<error>"

    Examples:
      | data    | error           |
      | invalid | Invalid input   |
      | empty   | Required field  |
```

Step definitions:
```typescript
// tests/features/step-definitions/feature.steps.ts
import { Given, When, Then } from '@wdio/cucumber-framework';
import { FeatureScreen } from '../../../src/screens';

const featureScreen = new FeatureScreen();

Given('I am on the feature screen', async () => {
  await featureScreen.waitForScreen();
});

When('I perform an action', async () => {
  await featureScreen.performAction();
});

Then('I should see the result', async () => {
  await expect(featureScreen.resultElement).toBeDisplayed();
});
```

### Test Best Practices

#### 1. Test Independence

Each test should be independent and not rely on other tests:

```typescript
// ✅ Good: Independent test
beforeEach(async () => {
  await app.reset();
  await loginScreen.login(validUser);
});

it('should perform action', async () => {
  // Test starts from known state
});

// ❌ Bad: Dependent on previous test
it('should be logged in from previous test', async () => {
  // Assumes login happened in another test
});
```

#### 2. Clear Test Names

```typescript
// ✅ Good: Descriptive names
it('should display error message when password is empty', async () => {});
it('should navigate to home screen after successful login', async () => {});

// ❌ Bad: Vague names
it('should work', async () => {});
it('test login', async () => {});
```

#### 3. AAA Pattern

```typescript
it('should calculate total correctly', async () => {
  // Arrange
  const item = TestDataFactory.createProduct({ price: 10, quantity: 2 });
  
  // Act
  await cartScreen.addItem(item);
  const total = await cartScreen.getTotal();
  
  // Assert
  expect(total).toBe(20);
});
```

#### 4. Avoid Hardcoded Waits

```typescript
// ✅ Good: Explicit waits
await element.waitForDisplayed({ timeout: 10000 });

// ❌ Bad: Hardcoded pause
await browser.pause(5000);
```

---

## Creating Screen Objects

### Screen Object Template

```typescript
// src/screens/NewScreen.ts
import { BaseScreen } from './BaseScreen';
import { ScreenFactory } from './ScreenFactory';
import { Logger } from '../utils/Logger';

/**
 * NewScreen - Description of what this screen represents
 */
export class NewScreen extends BaseScreen {
  /**
   * Screen identifier locator
   */
  protected get screenLocator(): string {
    return ScreenFactory.getLocator(
      'android=resourceId("com.app:id/new_screen")',
      '~newScreen'
    );
  }

  // ==================
  // Element Locators
  // ==================

  /**
   * Get the title element
   */
  private get titleElement() {
    return $(ScreenFactory.getLocator(
      'android=resourceId("com.app:id/title")',
      '~screenTitle'
    ));
  }

  /**
   * Get the action button
   */
  private get actionButton() {
    return $(ScreenFactory.getLocator(
      'android=resourceId("com.app:id/action_btn")',
      '~actionButton'
    ));
  }

  // ==================
  // Actions
  // ==================

  /**
   * Tap the action button
   */
  async tapActionButton(): Promise<void> {
    Logger.step('Tap action button');
    await this.tap(await this.actionButton);
  }

  /**
   * Get the screen title text
   */
  async getTitleText(): Promise<string> {
    Logger.step('Get title text');
    return await this.getText(await this.titleElement);
  }

  // ==================
  // Verifications
  // ==================

  /**
   * Check if action button is displayed
   */
  async isActionButtonDisplayed(): Promise<boolean> {
    try {
      return await (await this.actionButton).isDisplayed();
    } catch {
      return false;
    }
  }
}

export default NewScreen;
```

### Locator Priority

1. **Accessibility ID** (`~id`) - Works on both platforms
2. **Resource ID** (Android) - `android=resourceId("...")`
3. **iOS Predicate** - `-ios predicate string:...`
4. **iOS Class Chain** - `-ios class chain:...`
5. **XPath** - Last resort, avoid when possible

---

## Pull Request Process

### Before Submitting

1. **Ensure code compiles**: `npm run build`
2. **Run linting**: `npm run lint`
3. **Format code**: `npm run format`
4. **Run tests**: `npm run test`
5. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Related Issues
Fixes #123
```

### PR Size Guidelines

- **Small**: 1-50 lines changed
- **Medium**: 50-200 lines changed
- **Large**: 200-500 lines changed
- **Extra Large**: 500+ lines (consider splitting)

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Feature
feat(screens): add biometric authentication screen

# Bug fix
fix(gestures): resolve swipe direction on iOS

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(base-screen): simplify wait logic
```

### Commit Best Practices

1. **Atomic commits**: One logical change per commit
2. **Present tense**: "Add feature" not "Added feature"
3. **Imperative mood**: "Fix bug" not "Fixes bug"
4. **No period** at the end of subject line
5. **Wrap body** at 72 characters

---

## Review Process

### For Authors

1. Respond to all comments
2. Make requested changes promptly
3. Re-request review after updates
4. Squash commits if needed before merge

### For Reviewers

Look for:

1. **Correctness**: Does the code do what it should?
2. **Design**: Is the code well-structured?
3. **Complexity**: Can the code be simplified?
4. **Tests**: Are there adequate tests?
5. **Naming**: Are names clear and descriptive?
6. **Comments**: Are complex parts documented?
7. **Style**: Does it follow our guidelines?

### Review Comments

```typescript
// ✅ Good review comment
// Consider using `waitForDisplayed` instead of `pause` 
// to avoid flaky tests. See BaseScreen.waitForElement 
// for an example.

// ❌ Bad review comment
// This is wrong.
```

---

## Getting Help

- **Slack**: #mobile-automation
- **Wiki**: [Internal Documentation]
- **Issues**: GitHub Issues for bugs/features

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in team meetings

Thank you for contributing! 🎉
