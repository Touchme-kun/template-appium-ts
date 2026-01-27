import { $, expect } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';
/**
 * Cash In Screen for Android platform
 */
export class CashInScreen extends BaseScreen {

    // ===========================================
    // Screen Locator
    // ===========================================
    protected get screenLocator(): string {
        return 'android=new UiSelector().resourceId("XUTT8U")';
    }

    // ===========================================
    // Element Locator
    // ===========================================
    private readonly myBankAccountSelector = 'android=new UiSelector().text("My Bank Account")';
    private readonly mlBranchSelector = 'android=new UiSelector().text("ML Branch")';

    // * Branch Cash In
    private readonly branchCashInSelector = 'android=new UiSelector().resourceId("8EW8RL")';
    private readonly branchCashInAmountInputSelector = 'android=new UiSelector().text("0.00")';
    private readonly branchCashInNextButtonSelector = 'android=new UiSelector().text("Next")';
    private readonly branchCashInConfirmButtonSelector = 'android=new UiSelector().resourceId("modal-confirm-button")';
    private readonly branchCashInCancelConfirmationButtonSelector = 'android=new UiSelector().description("Cancel")';

    private readonly branchCashInKptnSelector = 'android=new UiSelector().resourceId("0QMRD2")';
    private readonly branchCashInAmountSelector = 'android=new UiSelector().resourceId("08HQ6G")';
    private readonly branchCashInCancelTransactionButtonSelector = 'android=new UiSelector().resourceId("9PXTAR")';

    private readonly goBackButtonSelector = 'android=new UiSelector().description("Go Back")';
    // ===========================================
    // Actions
    // ===========================================

    async tapMyBankAccount(): Promise<void> {
       await AllureReporter.step('Tap My Bank Account option', async () => {
            Logger.step('Tap My Bank Account option');
            await this.tap(this.myBankAccountSelector);
       });
    }

    async tapMLBranch(): Promise<void> {
       await AllureReporter.step('Tap ML Branch option', async () => {
            Logger.step('Tap ML Branch option');
            await this.tap(this.mlBranchSelector);
       });
    }           

    async tapGoBackButton(): Promise<void> {
       await AllureReporter.step('Tap Go Back button', async () => {
            Logger.step('Tap Go Back button');
            await this.tap(this.goBackButtonSelector);
       });
    }   
    
    async enterCashInAmount(amount: number): Promise<void> {
        await AllureReporter.step(`Enter Cash In amount: ${amount}`, async () => {
            Logger.step(`Entering Cash In amount: ${amount}`);
            await this.enterText(this.branchCashInAmountInputSelector, amount.toString());
        });
    }

    async tapNextButton(): Promise<void> {
       await AllureReporter.step('Tap Next button', async () => {
            Logger.step('Tap Next button');
            await this.tap(this.branchCashInNextButtonSelector);
       });
    }


    async tapConfirmButton(): Promise<void> {
       await AllureReporter.step('Tap Confirm button', async () => {
            Logger.step('Tap Confirm button');
            await this.tap(this.branchCashInConfirmButtonSelector);
       });
    }

    async cashInViaMLBranchFlow(amount: number): Promise<void> {
        await expect(await this.verifyCashInScreenLoaded()).toBe(true);
        await AllureReporter.step(`Perform Cash In via ML Branch with amount: ${amount}`, async () => {
            Logger.action(`Starting Cash In via ML Branch flow with amount: ${amount}`);
            await this.tapMLBranch();
            await this.enterCashInAmount(amount);
            await this.tapNextButton();
            await this.tapConfirmButton();
        });
    }
    // ===========================================
    // Verifications
    // ===========================================
    async verifyCashInScreenLoaded(): Promise<boolean> {
        await AllureReporter.step('Verify Cash In screen is loaded', async () => {
            Logger.step('Verifying Cash In screen is loaded');
              await this.waitForScreen({
                timeout: 30000,
                timeoutMsg: 'Cash In screen not displayed within 30s',
            });
        });
        return true;
    }

    async verifyCashInSuccess(): Promise<boolean> {
        let isSuccessful = false;
        await AllureReporter.step('Verify Cash In success', async () => {
            Logger.step('Verifying Cash In success');
            const kptnElement = await $(this.branchCashInKptnSelector);
            const amountElement = await $(this.branchCashInAmountSelector);

            await kptnElement.waitForDisplayed({ timeout: 10000, timeoutMsg: 'KPTN element not displayed for Cash In success' });
            await amountElement.waitForDisplayed({ timeout: 10000, timeoutMsg: 'Amount element not displayed for Cash In success' });

            const isKptnDisplayed = await kptnElement.isDisplayed();
            const isAmountDisplayed = await amountElement.isDisplayed();

            isSuccessful = isKptnDisplayed && isAmountDisplayed;
        });
        return isSuccessful;
    }
}