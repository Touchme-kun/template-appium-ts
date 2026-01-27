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
    private readonly sendMoneySelector = 'android=new UiSelector().text("Send")';
    private readonly receiveMoneySelector = 'android=new UiSelector().text("Receive Money")';
    private readonly withdrawSelector = 'android=new UiSelector().text("Withdraw")';
    private readonly historySelector = 'android=new UiSelector().text("History")';
    private readonly shopsSelector = 'android=new UiSelector().text("Shop")';
    private readonly eLoadSelector = 'android=new UiSelector().text("eLoad")';
    private readonly billsSelector = 'android=new UiSelector().text("Bills")';
    private readonly loansSelector = 'android=new UiSelector().text("Loans")';
    private readonly salaryLoanSelector = 'android=new UiSelector().text("Salary Loan")';
    private readonly insuranceSelector = 'android=new UiSelector().text("Insurance")';
    private readonly gCashSelector = 'android=new UiSelector().text("GCash")';
    private readonly useQrSelector = 'android=new UiSelector().text("Use QR")';
    private readonly shopSafeSelector = 'android=new UiSelector().text("ShopSafe")';
    private readonly gamingSelector = 'android=new UiSelector().text("Gaming")';
    private readonly mlxpressSelector = 'android=new UiSelector().text("MLXpress")';
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
        await AllureReporter.step('Tap on Cash In button', async () => {
            Logger.action('Tapping on Cash In button');
            await this.tap(this.cashInSelector);
        });
    }

    async tapSendMoney(): Promise<void> {
        await AllureReporter.step('Tap on Send Money button', async () => {
            Logger.action('Tapping on Send Money button');
            await this.tap(this.sendMoneySelector);
        });
    }

    async tapReceiveMoney(): Promise<void> {
        await AllureReporter.step('Tap on Receive Money button', async () => {
            Logger.action('Tapping on Receive Money button');
            await this.tap(this.receiveMoneySelector);
        });
    }

    async tapWithdraw(): Promise<void> {
        await AllureReporter.step('Tap on Withdraw button', async () => {
            Logger.action('Tapping on Withdraw button');
            await this.tap(this.withdrawSelector);
        });
    }

    async tapHistory(): Promise<void> {
        await AllureReporter.step('Tap on History button', async () => {
            Logger.action('Tapping on History button');
            await this.tap(this.historySelector);
        });
    }

    async tapShops(): Promise<void> {
        await AllureReporter.step('Tap on Shops button', async () => {
            Logger.action('Tapping on Shops button');
            await this.tap(this.shopsSelector);
        });
    }

    async tapELoad(): Promise<void> {
        await AllureReporter.step('Tap on eLoad button', async () => {
            Logger.action('Tapping on eLoad button');
            await this.tap(this.eLoadSelector);
        });
    }

    async tapBills(): Promise<void> {
        await AllureReporter.step('Tap on Bills button', async () => {
            Logger.action('Tapping on Bills button');
            await this.tap(this.billsSelector);
        });
    }

    async tapLoans(): Promise<void> {
        await AllureReporter.step('Tap on Loans button', async () => {
            Logger.action('Tapping on Loans button');
            await this.tap(this.loansSelector);
        });
    }

    async tapSalaryLoan(): Promise<void> {
        await AllureReporter.step('Tap on Salary Loan button', async () => {
            Logger.action('Tapping on Salary Loan button');
            await this.tap(this.salaryLoanSelector);
        });
    }

    async tapInsurance(): Promise<void> {
        await AllureReporter.step('Tap on Insurance button', async () => {
            Logger.action('Tapping on Insurance button');
            await this.tap(this.insuranceSelector);
        });
    }

    async tapGCash(): Promise<void> {
        await AllureReporter.step('Tap on GCash button', async () => {
            Logger.action('Tapping on GCash button');
            await this.tap(this.gCashSelector);
        });
    }

    async tapUseQr(): Promise<void> {
        await AllureReporter.step('Tap on Use QR button', async () => {
            Logger.action('Tapping on Use QR button');
            await this.tap(this.useQrSelector);
        });
    }

    async tapShopSafe(): Promise<void> {
        await AllureReporter.step('Tap on ShopSafe button', async () => {
            Logger.action('Tapping on ShopSafe button');
            await this.tap(this.shopSafeSelector);
        });
    }

    async tapMLXpress(): Promise<void> {
        await AllureReporter.step('Tap on MLXpress button', async () => {
            Logger.action('Tapping on MLXpress button');
            await this.tap(this.mlxpressSelector);
        });
    }

    async tapGaming(): Promise<void> {
        await AllureReporter.step('Tap on Gaming button', async () => {
            Logger.action('Tapping on Gaming button');
            await this.tap(this.gamingSelector);
        });
    }

    get balanceAmountElement() {
        return $(this.balanceAmountSelector);
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