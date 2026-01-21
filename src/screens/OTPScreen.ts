import { BaseScreen } from './BaseScreen';
import type { Locator } from '../types/framework.types';
import { Logger } from '../utils/Logger';
import { AllureReporter } from '../utils/AllureReporter';

/**
 * OTP Screen Page Object
 */
export class OTPScreen extends BaseScreen {
    // ===========================================
    // Screen Locator
    // ===========================================

    protected get screenLocator(): string {
     return this.getLocator(this.otpInputField(0));
    }

    // ===========================================
    // Element Locators
    // ===========================================
    private readonly otpInputField = (index: number): Locator => ({
        android: `//android.widget.EditText[@resource-id='94NMBE-${index}']`,
        ios: '~otp-input',
        description: 'OTP input field',
    });

    // ===========================================
    // Actions
    // ===========================================

    /**
     * Enter otp
     * @param otp 
     */
    async enterOTP(otp: string): Promise<void> {
         if (otp.length !== 6) {
            throw new Error('OTP must be exactly 6 digits');
        }
        await AllureReporter.step(`Enter OTP: ${otp}`, async () => {
            Logger.action(`Entering OTP: ${otp}`);
            for (let i = 0; i < 6; i++) {
                const field = await this.otpInputField(i);
                await this.enterText(this.getLocator(field), otp[i]);
        }
    });
  }

  /**
   * Perform otp flow
   * @param otp 
   */
  async otp(otp:string): Promise<void> {
     Logger.info(`Attempting otp for user: ${otp}`);
     AllureReporter.addFeature('SMS OTP');
     AllureReporter.addStory('OTP Flow');

     await this.enterOTP(otp);

     Logger.info('Otp entry completed, Proceeding to Pin Screen');
  }

    // ===========================================
    // Verifications
    // ===========================================
}

export const otpScreen = new OTPScreen();
export default otpScreen;