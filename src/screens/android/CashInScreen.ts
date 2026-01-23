import { $ } from '@wdio/globals';
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


    // ===========================================
    // Actions
    // ===========================================
    async tapMyBankAccount(): Promise<void> {
        try{
            Logger.step('Tap My Bank Account option');
            await this.tap(this.myBankAccountSelector);
        }catch(error){
            Logger.warn('My Bank Account option not found on Cash In screen', error as Error);
        };
    }

    async tapMLBranch(): Promise<void> {
        try{
            Logger.step('Tap ML Branch option');
            await this.tap(this.mlBranchSelector);
        }catch(error){
            Logger.warn('ML Branch option not found on Cash In screen', error as Error);
        };
    }

    // ===========================================
    // Verifications
    // ===========================================
    async verifyCashInScreenLoaded(): Promise<boolean> {
        try {
            await AllureReporter.step('Verify Cash In screen is loaded', async () => {
                Logger.info('Verifying Cash In screen is displayed');
                await this.waitForScreen({
                    timeout: 30000,
                    timeoutMsg: 'Cash In screen not displayed within 30s',
                });
            });
            return true;
        } catch (error) {
            Logger.error('Cash In screen not loaded', error as Error);
            return false;
        }
    }
}