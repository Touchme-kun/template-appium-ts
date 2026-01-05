import { BaseScreen } from './BaseScreen';
import type { Locator } from '../types/framework.types';
import { Logger } from '../utils/Logger';
import { AllureReporter } from '../utils/AllureReporter';

/**
 * Home Screen Page Object
 * Represents the main screen after successful login
 */
export class HomeScreen extends BaseScreen {
  // ===========================================
  // Screen Locator
  // ===========================================

  protected get screenLocator(): string {
    return this.getLocator(this.welcomeMessage);
  }

  // ===========================================
  // Element Locators
  // ===========================================

  private readonly welcomeMessage: Locator = {
    android: '~welcome-message',
    ios: '~welcome-message',
    description: 'Welcome message on home screen',
  };

  private readonly userProfileIcon: Locator = {
    android: '~profile-icon',
    ios: '~profile-icon',
    description: 'User profile icon',
  };

  private readonly menuButton: Locator = {
    android: '~menu-button',
    ios: '~menu-button',
    description: 'Menu button',
  };

  private readonly logoutButton: Locator = {
    android: '~logout-button',
    ios: '~logout-button',
    description: 'Logout button',
  };

  // ===========================================
  // Actions
  // ===========================================

  /**
   * Tap profile icon
   */
  async tapProfileIcon(): Promise<void> {
    await AllureReporter.step('Tap profile icon', async () => {
      Logger.action('Tap Profile Icon');
      await this.tap(this.getLocator(this.userProfileIcon));
    });
  }

  /**
   * Tap menu button
   */
  async tapMenu(): Promise<void> {
    await AllureReporter.step('Tap menu', async () => {
      Logger.action('Tap Menu');
      await this.tap(this.getLocator(this.menuButton));
    });
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await AllureReporter.step('Logout', async () => {
      Logger.action('Logout');
      await this.tapMenu();
      await this.tap(this.getLocator(this.logoutButton));
    });
  }

  // ===========================================
  // Verifications
  // ===========================================

  /**
   * Get welcome message text
   */
  async getWelcomeMessageText(): Promise<string> {
    const element = await this.waitForElement(this.getLocator(this.welcomeMessage));
    return await element.getText();
  }

  /**
   * Verify welcome message
   */
  async verifyWelcomeMessage(expectedText: string): Promise<void> {
    await AllureReporter.step(`Verify welcome message: ${expectedText}`, async () => {
      const actualText = await this.getWelcomeMessageText();
      if (!actualText.includes(expectedText)) {
        throw new Error(`Expected welcome message to contain "${expectedText}", but got "${actualText}"`);
      }
      Logger.info(`Welcome message verified: ${actualText}`);
    });
  }

  /**
   * Check if user is logged in (home screen displayed)
   */
  async isUserLoggedIn(): Promise<boolean> {
    return await this.isScreenDisplayed();
  }
}

// Export singleton instance
export const homeScreen = new HomeScreen();
export default HomeScreen;
