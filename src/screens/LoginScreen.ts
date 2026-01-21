import { $ } from '@wdio/globals';
import { BaseScreen } from './BaseScreen';
import type { Locator } from '../types/framework.types';
import { Logger } from '../utils/Logger';
import { AllureReporter } from '../utils/AllureReporter';

/**
 * Login Screen Page Object
 * Demonstrates the Page Object Model pattern for mobile testing
 */
export class LoginScreen extends BaseScreen {
  // ===========================================
  // Screen Locator
  // ===========================================

  protected get screenLocator(): string {
    return this.getLocator(this.loginButton);
  }

  // ===========================================
  // Element Locators
  // ===========================================
  private readonly mobileInputField: Locator = {
    android: '//android.widget.EditText[@hint="9XX XXX XXXX"]',
    ios: '~mobile-input',
    description: 'Mobile number input field',
  };

  private readonly usernameField: Locator = {
    android: '~username-input',
    ios: '~username-input',
    description: 'Username input field',
  };

  private readonly passwordField: Locator = {
    android: '~password-input',
    ios: '~password-input',
    description: 'Password input field',
  };

  private readonly loginButton: Locator = {
    android: '//android.view.ViewGroup[@content-desc="Login"]',
    ios: '~login-button',
    description: 'Login button',
  };

  private readonly errorMessage: Locator = {
    android: '~error-message',
    ios: '~error-message',
    description: 'Error message label',
  };

  private readonly forgotPasswordLink: Locator = {
    android: '~forgot-password',
    ios: '~forgot-password',
    description: 'Forgot password link',
  };

  private readonly signUpLink: Locator = {
    android: '~sign-up-link',
    ios: '~sign-up-link',
    description: 'Sign up link',
  };

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Enter mobile number
   * @param mobile 
   */
   async enterMobileNumber(mobile: string): Promise<void> {
    await AllureReporter.step('Enter mobile number', async () => {
      Logger.action('Enter Mobile Number', mobile);
      await this.enterText(this.getLocator(this.mobileInputField), mobile);
    });
  }
  

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await AllureReporter.step('Enter username', async () => {
      Logger.action('Enter Username', username);
      await this.enterText(this.getLocator(this.usernameField), username);
    });
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await AllureReporter.step('Enter password', async () => {
      Logger.action('Enter Password', '********');
      await this.enterText(this.getLocator(this.passwordField), password);
    });
  }

  /**
   * Tap login button
   */
  async tapLoginButton(): Promise<void> {
    await AllureReporter.step('Tap login button', async () => {
      Logger.action('Tap Login Button');
      await this.hideKeyboard();
      await this.tap(this.getLocator(this.loginButton));
    });
  }

  /**
   * Perform complete login flow
   */
  async login(mobile: string): Promise<void> {
    Logger.info(`Attempting login for user: ${mobile}`);
    AllureReporter.addFeature('Authentication');
    AllureReporter.addStory('User Login');

    await this.enterMobileNumber(mobile);
    await this.tapLoginButton();

    Logger.info('Login action completed, Navigating to OTP Screen');
  }

  /**
   * Tap forgot password link
   */
  async tapForgotPassword(): Promise<void> {
    await AllureReporter.step('Tap forgot password', async () => {
      Logger.action('Tap Forgot Password');
      await this.tap(this.getLocator(this.forgotPasswordLink));
    });
  }

  /**
   * Tap sign up link
   */
  async tapSignUp(): Promise<void> {
    await AllureReporter.step('Tap sign up', async () => {
      Logger.action('Tap Sign Up');
      await this.tap(this.getLocator(this.signUpLink));
    });
  }

  // ===========================================
  // Verifications
  // ===========================================

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.getLocator(this.errorMessage), 5000);
  }

  /**
   * Get error message text
   */
  async getErrorMessageText(): Promise<string> {
    const element = await this.waitForElement(this.getLocator(this.errorMessage));
    return await element.getText();
  }

  /**
   * Verify error message contains expected text
   */
  async verifyErrorMessage(expectedText: string): Promise<void> {
    await AllureReporter.step(`Verify error message: ${expectedText}`, async () => {
      const actualText = await this.getErrorMessageText();
      if (!actualText.includes(expectedText)) {
        throw new Error(`Expected error message to contain "${expectedText}", but got "${actualText}"`);
      }
      Logger.info(`Error message verified: ${actualText}`);
    });
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    const element = await $(this.getLocator(this.loginButton));
    return await element.isEnabled();
  }
}

// Export singleton instance
export const loginScreen = new LoginScreen();
export default LoginScreen;
