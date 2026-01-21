import { BaseScreen } from './BaseScreen';
import type { Locator } from '../types/framework.types';
import { Logger } from '../utils/Logger';
// import { AllureReporter } from '../utils/AllureReporter';

/**
 * Dashboard Screen Page Object
 */
export class DashboardScreen extends BaseScreen {
    // ===========================================
    // Screen Locator
    // ===========================================
    protected get screenLocator(): string {
        return this.getLocator(this.dashboardHeader);
    }

    // ===========================================
    // Element Locators
    // ===========================================
    private readonly dashboardHeader: Locator = {
        android: '#UTJ9TN',
        ios: '~dashboard-header',
        description: 'Dashboard screen header',
    };

    private readonly usableBalanceLabel: Locator = {
        android: '//android.widget.TextView[@text="Usable Balance"]',
        ios: '~usable-balance-label',
        description: 'Usable Balance label',
    };

    // private readonly cashInButton: Locator = {
    //     android: '//android.view.ViewGroup[@content-desc="Cash In"]',
    //     ios: '~cash-in-button',
    //     description: 'Cash In button',
    // };

    // private readonly sendButton: Locator = {
    //     android: '//android.view.ViewGroup[@content-desc="Send"]',
    //     ios: '~send-button',
    //     description: 'Send button',
    // };

    // ===========================================
    // Actions
    // ===========================================



    // ===========================================
    // Verifications
    // ===========================================

    async isDashboardDisplayed(): Promise<boolean> {
        Logger.info('Verifying if Dashboard screen is displayed');
        return this.isScreenDisplayed();
    }
}

export const dashboardScreen = new DashboardScreen();
export default dashboardScreen;