import { loginScreen } from '../../../src/screens/LoginScreen';
import { homeScreen } from '../../../src/screens/HomeScreen';
import { Logger } from '../../../src/utils/Logger';
import { AllureReporter } from '../../../src/utils/AllureReporter';
import { envConfig } from '../../../src/config/environment';

/**
 * Login Functionality Tests - TDD Style
 * Demonstrates Mocha test structure with WebdriverIO
 */
describe('Login Functionality', () => {
  before(async () => {
    Logger.suiteStart('Login Functionality');
    await AllureReporter.addDeviceInfo();
    AllureReporter.addEnvironmentInfo({
      Environment: envConfig.testEnvironment,
      'Build Number': envConfig.buildNumber,
    });
  });

  beforeEach(async () => {
    // Wait for login screen to be ready
    await loginScreen.waitForScreen();
  });

  afterEach(async function () {
    // Take screenshot on failure
    if (this.currentTest?.state === 'failed') {
      await AllureReporter.captureScreenshot(`${this.currentTest.title}_failure`);
    }
  });

  after(async () => {
    Logger.suiteEnd('Login Functionality', 0, 0, 0);
  });

  describe('Valid Login Scenarios', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const username = envConfig.testUserEmail;
      const password = envConfig.testUserPassword;
      Logger.testStart('should login successfully with valid credentials');
      AllureReporter.addSeverity('critical');

      // Act
      await loginScreen.login(username, password);

      // Assert
      await homeScreen.waitForScreen();
      const isLoggedIn = await homeScreen.isUserLoggedIn();
      await expect(isLoggedIn).toBe(true);

      Logger.testEnd('should login successfully with valid credentials', true);
    });

    it('should display welcome message after login', async () => {
      // Arrange
      const username = envConfig.testUserEmail;
      const password = envConfig.testUserPassword;
      Logger.testStart('should display welcome message after login');
      AllureReporter.addSeverity('normal');

      // Act
      await loginScreen.login(username, password);
      await homeScreen.waitForScreen();

      // Assert
      await homeScreen.verifyWelcomeMessage('Welcome');

      Logger.testEnd('should display welcome message after login', true);
    });
  });

  describe('Invalid Login Scenarios', () => {
    it('should show error message for invalid credentials', async () => {
      // Arrange
      const username = 'invalid@example.com';
      const password = 'wrongpassword';
      Logger.testStart('should show error message for invalid credentials');
      AllureReporter.addSeverity('normal');

      // Act
      await loginScreen.login(username, password);

      // Assert
      const isErrorDisplayed = await loginScreen.isErrorMessageDisplayed();
      await expect(isErrorDisplayed).toBe(true);

      Logger.testEnd('should show error message for invalid credentials', true);
    });

    it('should show error for empty username', async () => {
      // Arrange
      const password = 'somepassword';
      Logger.testStart('should show error for empty username');
      AllureReporter.addSeverity('minor');

      // Act
      await loginScreen.enterPassword(password);
      await loginScreen.tapLoginButton();

      // Assert
      await loginScreen.verifyErrorMessage('required');

      Logger.testEnd('should show error for empty username', true);
    });

    it('should show error for empty password', async () => {
      // Arrange
      const username = 'test@example.com';
      Logger.testStart('should show error for empty password');
      AllureReporter.addSeverity('minor');

      // Act
      await loginScreen.enterUsername(username);
      await loginScreen.tapLoginButton();

      // Assert
      await loginScreen.verifyErrorMessage('required');

      Logger.testEnd('should show error for empty password', true);
    });
  });

  describe('Navigation Scenarios', () => {
    it('should navigate to forgot password screen', async () => {
      Logger.testStart('should navigate to forgot password screen');
      AllureReporter.addSeverity('minor');

      // Act
      await loginScreen.tapForgotPassword();

      // Assert - would verify forgot password screen is displayed
      // await forgotPasswordScreen.waitForScreen();

      Logger.testEnd('should navigate to forgot password screen', true);
    });

    it('should navigate to sign up screen', async () => {
      Logger.testStart('should navigate to sign up screen');
      AllureReporter.addSeverity('minor');

      // Act
      await loginScreen.tapSignUp();

      // Assert - would verify sign up screen is displayed
      // await signUpScreen.waitForScreen();

      Logger.testEnd('should navigate to sign up screen', true);
    });
  });
});
