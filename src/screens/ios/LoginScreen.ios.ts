/**
 * LoginScreen - iOS-specific login screen implementation
 */

import { $ } from '@wdio/globals';
import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';

export class LoginScreen extends BaseScreen {
  // iOS-specific locators using accessibility IDs and predicates
  protected get screenLocator(): string {
    return '~loginScreen';
  }

  // Locator strings
  private readonly usernameFieldSelector = '~usernameTextField';
  private readonly passwordFieldSelector = '~passwordTextField';
  private readonly loginButtonSelector = '~loginButton';
  private readonly forgotPasswordSelector = '~forgotPasswordLink';
  private readonly rememberMeSelector = '~rememberMeSwitch';
  private readonly signUpSelector = '~signUpLink';
  private readonly errorMessageSelector = '~errorMessageLabel';
  private readonly faceIdSelector = '~faceIdButton';
  private readonly touchIdSelector = '~touchIdButton';
  private readonly appleSignInSelector = '~signInWithAppleButton';
  private readonly googleSignInSelector = '~googleSignInButton';

  // Actions
  async enterUsername(username: string): Promise<void> {
    Logger.step(`Enter username: ${username}`);
    await this.enterText(this.usernameFieldSelector, username);
  }

  async enterPassword(password: string): Promise<void> {
    Logger.step('Enter password: ****');
    await this.enterText(this.passwordFieldSelector, password);
  }

  async tapLoginButton(): Promise<void> {
    Logger.step('Tap login button');
    await this.tap(this.loginButtonSelector);
  }

  async login(username: string, password: string): Promise<void> {
    Logger.step(`Login as: ${username}`);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.tapLoginButton();
  }

  async tapForgotPassword(): Promise<void> {
    Logger.step('Tap forgot password link');
    await this.tap(this.forgotPasswordSelector);
  }

  async toggleRememberMe(): Promise<void> {
    Logger.step('Toggle remember me switch');
    await this.tap(this.rememberMeSelector);
  }

  async tapSignUp(): Promise<void> {
    Logger.step('Tap sign up link');
    await this.tap(this.signUpSelector);
  }

  async getErrorMessage(): Promise<string> {
    const element = await $(this.errorMessageSelector);
    await element.waitForDisplayed({ timeout: 5000 });
    return await element.getText();
  }

  async isErrorDisplayed(): Promise<boolean> {
    try {
      const element = await $(this.errorMessageSelector);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async tapFaceId(): Promise<void> {
    Logger.step('Tap Face ID button');
    await this.tap(this.faceIdSelector);
  }

  async tapTouchId(): Promise<void> {
    Logger.step('Tap Touch ID button');
    await this.tap(this.touchIdSelector);
  }

  async tapAppleSignIn(): Promise<void> {
    Logger.step('Tap Sign in with Apple button');
    await this.tap(this.appleSignInSelector);
  }

  async tapGoogleSignIn(): Promise<void> {
    Logger.step('Tap Google Sign In button');
    await this.tap(this.googleSignInSelector);
  }

  async clearCredentials(): Promise<void> {
    Logger.step('Clear credentials fields');
    const username = await $(this.usernameFieldSelector);
    const password = await $(this.passwordFieldSelector);
    await username.clearValue();
    await password.clearValue();
  }

  async isRememberMeEnabled(): Promise<boolean> {
    const element = await $(this.rememberMeSelector);
    const value = await element.getAttribute('value');
    return value === '1';
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const faceId = await $(this.faceIdSelector);
      const touchId = await $(this.touchIdSelector);
      return (await faceId.isDisplayed()) || (await touchId.isDisplayed());
    } catch {
      return false;
    }
  }

  /**
   * Dismiss keyboard if visible
   */
  async dismissKeyboard(): Promise<void> {
    await this.hideKeyboard();
  }
}

export default LoginScreen;
