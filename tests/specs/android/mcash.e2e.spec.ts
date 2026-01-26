import { expect } from '@wdio/globals';
import { BaseTest } from '../../../src/base/BaseTest';
import { LoginScreen, OTPScreen, PinScreen, DashboardScreen, CashInScreen } from '../../../src/screens/android';
import loginTd from '../../../tests/data/login.json';


describe('MCash - E2E Test (Android)', () => {

    let loginScreen : LoginScreen;
    let otpScreen : OTPScreen;
    let pinScreen : PinScreen;
    let dashboardScreen : DashboardScreen;
    let cashInScreen : CashInScreen;

    before(async () => {
        await BaseTest.initializeSuite('MCash E2E Test Suite');
        loginScreen = new LoginScreen();
        otpScreen = new OTPScreen();
        pinScreen = new PinScreen();
        dashboardScreen = new DashboardScreen();
        cashInScreen = new CashInScreen();

        const user = {
            mobile : loginTd.tiers[0].mobileNumber,
            otp: '123456',
            pin: loginTd.tiers[0].pin
        }
        await loginScreen.enterMobileNumber(user.mobile);
        await loginScreen.tapLoginButton();
        await otpScreen.enterOTP(user.otp);
    });

    beforeEach(async () => {
        await BaseTest.setupTest('MCash E2E Test', 'MCash E2E Test Suite');
        await BaseTest.waitForAppReady();

        const pin = loginTd.tiers[0].pin;
        await pinScreen.enterPin(pin);
        await expect(await dashboardScreen.verifyDashboardLoaded()).toBe(true);
    });

    afterEach(async function() {
        await BaseTest.teardownTest(this.currentTest?.state === 'passed');
    });

    after(async () => {
        await BaseTest.cleanupSuite('MCash E2E Test Suite');
        await BaseTest.resetApp();
    });

    describe('Cash In Happy Path', () => {
        it('should cash in successfully with valid details', async () => {
            //Arrange
            const cashInDetails = {
                amount : 100
            }
            await dashboardScreen.tapCashIn();
            await cashInScreen.cashInViaMLBranchFlow(cashInDetails.amount);
            await otpScreen.confirmInAppOTP();          
            
            //Assert
            await expect(await cashInScreen.verifyCashInSuccess()).toBe(true);
            // TODO : confirm cash in via kpx api && Add verification for updated balance if applicable 
        });
    });


});