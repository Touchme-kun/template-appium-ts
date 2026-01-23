import { driver, expect } from '@wdio/globals';
import { BaseTest } from '../../../src/base/BaseTest';
import { AndroidLoginScreen } from '../../../src/screens/android/AndroidLoginScreen';
import OTPScreen from '../../../src/screens/android/OTPScreen';
import { PinScreen } from '../../../src/screens/android/PinScreen';
import { DashboardScreen } from '../../../src/screens/android/DashboardScreen';


describe('MCash - Smoke Test (Android)', () => {

    let loginScreen : AndroidLoginScreen;
    let otpScreen : OTPScreen;
    let pinScreen : PinScreen;
    let dashboardScreen : DashboardScreen;


    before(async () => {
        await BaseTest.initializeSuite('MCash Smoke Test Suite');
        loginScreen = new AndroidLoginScreen();
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
            await loginScreen.tapLoginButton();
            await otpScreen.enterOTP(user.otp);
            await pinScreen.enterPin(user.pin);

            //Assert
            await expect(await dashboardScreen.verifyDashboardLoaded()).toBe(true);
        });
    });

    describe('Dashboard Tests', () => {
        it('should toggle balance visibility using eye icon', async () => {
            //Actions
            await dashboardScreen.tapEyeIcon();

            //Assert
            await expect(await dashboardScreen.verifyBalanceVisible()).toBe(true);
        });

        //TODO add more dashboard smoke tests here
    });
});