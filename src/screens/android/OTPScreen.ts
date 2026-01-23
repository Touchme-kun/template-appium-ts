import { $ } from '@wdio/globals';
import { BaseScreen } from '../BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';

/**
 * OTP Screen Page Object
 */
export class OTPScreen extends BaseScreen {

    protected get screenLocator(): string {
        return 'android=new UiSelector().text("One Time Pin").instance(1)';
    }
    
    // ===========================================
    // Element Locators
    // ===========================================

    private readonly otpInputFieldSelector = (index: number): string => {
        return `android=new UiSelector().resourceId("94NMBE-${index}")`;
    }

    private readonly didNotReceiveOtpSelector = 'android=new UiSelector().text("Did not receive OTP?")';
    
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
                    const field = await this.otpInputFieldSelector(i);
                    await this.enterText(field, otp[i]);
            }
        });
    }
}

export default OTPScreen;