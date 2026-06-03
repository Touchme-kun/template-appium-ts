import { expect } from '@wdio/globals';
import { BaseTest } from '../../../src/core/BaseTest';
import { LoginScreen, OTPScreen, PinScreen, DashboardScreen } from '../../../src/screens/android';


describe('MCash - Smoke Test (Android)', () => {

    let loginScreen : LoginScreen;
    let otpScreen : OTPScreen;
    let pinScreen : PinScreen;
    let dashboardScreen : DashboardScreen;


    before(async () => {
        await BaseTest.initializeSuite('MCash Smoke Test Suite');
        loginScreen = new LoginScreen();
        otpScreen = new OTPScreen();
        pinScreen = new PinScreen();
        dashboardScreen = new DashboardScreen();
    });

    beforeEach(async () => {
        await BaseTest.setupTest('MCash Smoke Test', 'MCash Smoke Test Suite');
        await BaseTest.waitForAppReady();
    });

    afterEach(async function() {
        await BaseTest.teardownTest(this.currentTest?.state === 'passed');
    });

    after(async () => {
        await BaseTest.cleanupSuite('MCash Smoke Test Suite');
        await BaseTest.resetApp();
    });

    describe('Login Flow', () => {
        it('should login successfully with valid credentials', async () => {
            //Arrange
            const user = {
                mobile : '9999999996',
                otp: '123456',
                pin: '1234'
            }
            //Actions
            await loginScreen.enterMobileNumber(user.mobile);
            await loginScreen.tapNextButton();
            await otpScreen.enterOTP(user.otp);
            await pinScreen.enterPin(user.pin);

            //Assert
            await expect(await dashboardScreen.verifyDashboardLoaded()).toBe(true);
        });
    });

});