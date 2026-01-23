import { $ } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';

export class PinScreen extends BaseScreen {

    protected get screenLocator(): string {
        return 'android=new UiSelector().resourceId("724506")';
    }

    // ===========================================
    // Element Locators
    // ===========================================

    private readonly pinInputFieldSelector = (index: number): string => {
        return `android=new UiSelector().text("${index}")`;
    }
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
                const button = this.pinInputFieldSelector(parseInt(digit, 10));
                await this.tap(button);
            }
        });
    }
}