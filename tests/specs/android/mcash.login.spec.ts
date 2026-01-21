import { expect } from '@wdio/globals';
import { BaseTest } from '../../../src/base/BaseTest';
import { LoginScreen } from '../../../src/screens/LoginScreen';
import { OTPScreen } from '../../../src/screens/OTPScreen';
import { PinScreen } from '../../../src/screens/PinScreen';
import { DashboardScreen } from '../../../src/screens/DashboardScreen';


describe('MCash - Complete Login Flow (Android)', () => {
    
    let loginScreen: LoginScreen;
    let otpScreen: OTPScreen;
    let pinScreen: PinScreen;
    let dashboardScreen: DashboardScreen;

    before(async () => {
        await BaseTest.initializeSuite('MCash Login E2E Suite');
        loginScreen = new LoginScreen();
        otpScreen = new OTPScreen();
        pinScreen = new PinScreen();
        dashboardScreen = new DashboardScreen();
    });

    beforeEach(async () => {
        await BaseTest.setupTest('MCash Login E2E Test', 'MCash Login E2E Suite');
    });

    afterEach(async function() {
        await BaseTest.teardownTest(this.currentTest?.state === 'passed');
    });

    after(async () => {
        await BaseTest.cleanupSuite('MCash Login E2E Suite');
    });

    describe('Valid Login Flow', () => {
        it('should login successfully with valid credentials', async () => {
            //Arrange
            const user = {
                mobile : '9999999996',
                otp: '123456',
                pin: '1234'
            }
            //Actions
            await loginScreen.login(user.mobile);
            await otpScreen.otp(user.otp);
            await pinScreen.pin(user.pin);

            //Assert
            expect(await dashboardScreen.isDashboardDisplayed()).toBe(true);
        });
    });
});