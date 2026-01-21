import { BaseScreen } from './BaseScreen';
import type { Locator } from '../types/framework.types';
import { Logger } from '../utils/Logger';
import { AllureReporter } from '../utils/AllureReporter';


/**
 * PIN Screen Page Object
 */
export class PinScreen extends BaseScreen {

    // ===========================================
    // Screen Locator
    // ===========================================
    protected get screenLocator(): string {
        return this.getLocator(this.pinInputField(0));
    }

    // ===========================================
    // Element Locators
    // ===========================================
    private readonly pinInputField = (index: number): Locator => ({
        android: `//android.view.ViewGroup[@content-desc='${index}']`,
        ios: '~pin-input',
        description: 'PIN input field',
    });


    // ===========================================
    // Actions
    // ===========================================

    /**
     * Enter pin
     * @param pin 
     */
    async enterPin(pin: string): Promise<void> {
        if (pin.length !== 4) {
            throw new Error('PIN must be exactly 4 digits');
        }
        await AllureReporter.step(`Enter PIN: ${pin}`, async () => {
            Logger.action(`Entering PIN: ${pin}`);
            for (const digit of pin) {
                const button = await this.pinInputField(parseInt(digit, 10));
                await this.tap(this.getLocator(button));
            }
        });
    }

    async pin(pin: string): Promise<void> {
        Logger.info(`Attempting PIN entry for PIN: ${pin}`);
        AllureReporter.addFeature('PIN Entry');
        AllureReporter.addStory('PIN Screen Flow');

        await this.enterPin(pin);

        Logger.info('PIN entry completed, Proceeding to next screen');
    }

    // ===========================================
    // Verifications
    // ===========================================
}

export const pinScreen = new PinScreen();
export default pinScreen;