/**
 * ExampleScreen - Sample screen template
 *
 * This file demonstrates the recommended screen structure.
 * Replace the locators, methods, and logic with your actual screen.
 *
 * Steps to adapt for your app:
 * 1. Rename the class (e.g., `LoginScreen`)
 * 2. Update `screenLocator` with your screen's accessibility ID
 * 3. Replace locator constants with your screen's element selectors
 * 4. Implement your action methods
 * 5. Add state verification methods
 */

import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';

export class ExampleScreen extends BaseScreen {
  // ─── Screen Identifier ─────────────────────────────────────────────────────
  // Used by waitForScreen() to confirm the screen is visible.
  protected get screenLocator(): string {
    return '~example-screen';
  }

  // ─── Element Locators ──────────────────────────────────────────────────────
  // Private string constants referencing accessibility IDs.
  // BaseScreen methods (enterText, tap, isElementDisplayed) accept string selectors.

  private readonly PRIMARY_BUTTON = '~example-primary-button';
  private readonly TEXT_INPUT = '~example-text-input';
  private readonly SUCCESS_INDICATOR = '~example-success-indicator';
  private readonly ERROR_INDICATOR = '~example-error-indicator';

  // ─── Action Methods ────────────────────────────────────────────────────────
  // Public, async, and log every action via Logger.step().

  async performPrimaryAction(inputValue: string): Promise<void> {
    Logger.step('Performing primary action', `Input: ${inputValue}`);

    await this.enterText(this.TEXT_INPUT, inputValue);
    await this.tap(this.PRIMARY_BUTTON);

    Logger.step('Primary action completed');
  }

  // ─── State Verification Methods ────────────────────────────────────────────
  // Return boolean for assertions in tests.

  async verifyScreenLoaded(): Promise<boolean> {
    return this.isScreenDisplayed();
  }

  async verifyActionSuccess(): Promise<boolean> {
    return this.isElementDisplayed(this.SUCCESS_INDICATOR);
  }

  async verifyErrorDisplayed(): Promise<boolean> {
    return this.isElementDisplayed(this.ERROR_INDICATOR);
  }
}