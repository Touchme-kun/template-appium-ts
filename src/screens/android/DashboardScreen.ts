import { $ } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';
/**
 * Dashboard Screen for Android platform
 */
export class DashboardScreen extends BaseScreen {

    // ===========================================
    // Screen Locator
    // ===========================================
    protected get screenLocator(): string {
        return 'android=new UiSelector().resourceId("UTJ9TN")';
    }

    // ===========================================
    // Element Locators
    // ===========================================
    private readonly cashInSelector = 'android=new UiSelector().text("Cash In")';
    private readonly eyeIconSelector = 'android=new UiSelector().resourceId("JKRBGQ")';
    private readonly balanceAmountSelector = 'android=new UiSelector().resourceId("0619JV")';

    // ===========================================
    // Actions
    // ===========================================
    async tapEyeIcon(): Promise<void> {
        try{
            Logger.step('Tap eye icon to toggle balance visibility');
            await this.tap(this.eyeIconSelector);
        }catch(error){
            Logger.warn('Eye icon not found on dashboard', error as Error);
        };
    }

    async tapCashIn(): Promise<void> {
         try{
            Logger.step('Tap Cash In button');
            await this.tap(this.cashInSelector);
        }catch(error){
            Logger.warn('Cash In button not found on dashboard', error as Error);
        };
    }


    
    // ===========================================
    // Verifications
    // ===========================================
    async verifyDashboardLoaded(): Promise<boolean> {
        try {
            await AllureReporter.step('Verify dashboard is loaded', async () => {
                Logger.info('Verifying dashboard screen is displayed');
                await this.waitForScreen({
                    timeout: 30000,
                    timeoutMsg: 'Dashboard screen not displayed within 30s',
                });
            });
            return true;
        } catch (error) {
            Logger.error('Dashboard not loaded', error as Error);
            return false;
        }
    }

    async verifyBalanceVisible(): Promise<boolean> {
         try {
            await AllureReporter.step('Verify balance amount is visible', async () => {
                Logger.info('Verifying balance amount is displayed');
                await this.waitForElement(this.balanceAmountSelector, {
                    timeout: 10000,
                    timeoutMsg: 'Balance amount not visible within 10s',
                });
            });
            return true;
        } catch (error) {
            Logger.error('Balance amount not visible', error as Error);
            return false;
        }
    }
}