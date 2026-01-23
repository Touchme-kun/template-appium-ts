/**
 * AndroidLoginScreen - Android-specific login screen implementation
 */

import { $ } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen';
import { Logger } from '../../utils/Logger';

export class AndroidLoginScreen extends BaseScreen {
  // Android-specific locators using resource-id and UIAutomator
  protected get screenLocator(): string {
    return 'android=new UiSelector().resourceId("com.app:id/login_container")';
  }

  // Locator strings
  private readonly usernameFieldSelector = 'android=new UiSelector().resourceId("com.app:id/username_input")';
  private readonly passwordFieldSelector = 'android=new UiSelector().resourceId("com.app:id/password_input")';
  private readonly loginButtonSelector = 'android=new UiSelector().resourceId("208465")';
  private readonly forgotPasswordSelector = 'android=new UiSelector().resourceId("com.app:id/forgot_password")';
  private readonly rememberMeSelector = 'android=new UiSelector().resourceId("com.app:id/remember_me")';
  private readonly signUpSelector = 'android=new UiSelector().resourceId("com.app:id/sign_up_link")';
  private readonly errorMessageSelector = 'android=new UiSelector().resourceId("com.app:id/error_message")';
  private readonly biometricLoginSelector = 'android=new UiSelector().resourceId("com.app:id/biometric_login")';
  private readonly googleLoginSelector = 'android=new UiSelector().resourceId("com.app:id/google_login")';
  private readonly facebookLoginSelector = 'android=new UiSelector().resourceId("com.app:id/facebook_login")';

  private readonly mobileNumberFieldSelector = 'android=new UiSelector().text("9XX XXX XXXX")';
  private readonly continueButtonSelector = 'android=new UiSelector().resourceId("android:id/button1")';
  private readonly alertMessageSelector = 'android=new UiSelector().resourceId("android:id/message")';
  // Actions
  async enterUsername(username: string): Promise<void> {
    Logger.step(`Enter username: ${username}`);
    await this.enterText(this.usernameFieldSelector, username);
  }

  async enterPassword(password: string): Promise<void> {
    Logger.step('Enter password: ****');
    await this.enterText(this.passwordFieldSelector, password);
  }

  async enterMobileNumber(mobile: string): Promise<void> {
    try{await $(this.continueButtonSelector).click();}catch{Logger.warn('No alert to dismiss');};
    Logger.step(`Enter mobile number: ${mobile}`);
    await this.enterText(this.mobileNumberFieldSelector, mobile);
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
    Logger.step('Toggle remember me checkbox');
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

  async tapBiometricLogin(): Promise<void> {
    Logger.step('Tap biometric login button');
    await this.tap(this.biometricLoginSelector);
  }

  async tapGoogleLogin(): Promise<void> {
    Logger.step('Tap Google login button');
    await this.tap(this.googleLoginSelector);
  }

  async tapFacebookLogin(): Promise<void> {
    Logger.step('Tap Facebook login button');
    await this.tap(this.facebookLoginSelector);
  }

  async clearCredentials(): Promise<void> {
    Logger.step('Clear credentials fields');
    const username = await $(this.usernameFieldSelector);
    const password = await $(this.passwordFieldSelector);
    await username.clearValue();
    await password.clearValue();
  }

  async isRememberMeChecked(): Promise<boolean> {
    const element = await $(this.rememberMeSelector);
    const checked = await element.getAttribute('checked');
    return checked === 'true';
  }

  async isBiometricAvailable(): Promise<boolean> {
    try {
      const element = await $(this.biometricLoginSelector);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }
}

export default AndroidLoginScreen;
