import { BaseScreen } from '../../core/BaseScreen';
import { Logger } from '../../utils/Logger';
import { AllureReporter } from '../../utils/AllureReporter';

export interface RecipientDetails {
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    nickName: string;
    mobileNumber: string;
}
/**
 * Send Money Screen for Android platform - Kwarta Padala (Branch), MCash User, MLXpress
 */
export class SendScreen extends BaseScreen {
    // ===========================================
    // Screen Locator
    // ===========================================
    protected get screenLocator(): string {
        return 'android=new UiSelector().resourceId("KKCN00")';
    }

    // ===========================================
    // Element Locators
    // ===========================================
    private readonly toMLBranchSelector = 'android=new UiSelector().text("To any ML Branch")';
    private readonly toMcashUserSelector = 'android=new UiSelector().text("To a MCash user")';
    private readonly toMLXpressSelector = 'android=new UiSelector().text("To MLXpress")';

    // Kwarta Padala ---
    private readonly kwartaPadalaHeader = 'android=new UiSelector().text("Kwarta Padala")';
    private readonly savedRecipientsSelector = 'android=new UiSelector().resourceId("M7Q0IV")';
    private readonly firstNameInputSelector = 'android=new UiSelector().text("First Name")';
    private readonly noMiddleNameCheckboxSelector = 'android=new UiSelector().className("android.widget.ImageView")';
    private readonly middleNameInputSelector = 'android=new UiSelector().text("Middle Name")';
    private readonly lastNameInputSelector = 'android=new UiSelector().text("Last Name")';
    private readonly suffixInputSelector = 'android=new UiSelector().text("N/A")';
    private readonly mobileNumberInputSelector = 'android=new UiSelector().text("Mobile Number")';
    private readonly howMuchToTransferSelector = 'android=new UiSelector().resourceId("DKL2CP")';
    private readonly amountInputSelector = 'android=new UiSelector().text("0.00")';
    private readonly mcashBalanceSelector = 'android=new UiSelector().resourceId("391CJJ")';

    // -- Confirm Details Locators
    private readonly confirmDetailsHeaderSelector = 'android=new UiSelector().text("Confirm Details")';
    protected readonly recipientNameSelector = 'android=new UiSelector().resourceId("LFYYQ2")';
    protected readonly recipientMobileSelector = 'android=new UiSelector().resourceId("42PFEL")';
    protected readonly paymentMethodSelector = 'android=new UiSelector().resourceId("I3JJS1")';
    protected readonly amountToSendSelector = 'android=new UiSelector().resourceId("64FSXA")';
    protected readonly serviceFeeSelector = 'android=new UiSelector().resourceId("V52N3I")';
    protected readonly totalAmountSelector = 'android=new UiSelector().resourceId("ONY991")';

    // -- Saved Recipients Locators
    protected readonly savedRecipientsHeaderSelector = 'android=new UiSelector().text("Saved Recipients")';
    private readonly recipientSelector = (index: number): string => {
        return `new UiSelector().resourceId("HQCZ6L").instance(${index})`;
    }
    private readonly nickNameInputSelector = 'android=new UiSelector().text("Nickname")';
    protected readonly saveRecipientButtonSelector = 'android=new UiSelector().resourceId("HY30UQ")';
    private readonly selectRecipientButtonSelector = 'android=new UiSelector().resourceId("EQIZOH")';
    protected readonly editRecipientButtonSelector = 'android=new UiSelector().resourceId("A9WMZF")';
    protected readonly deleteRecipientButtonSelector = 'android=new UiSelector().resourceId("LEZ4NJ")';

    // -- Common Locators
    private readonly nextButtonSelector = '~Next';
    private readonly confirmButtonSelector = 'android=new UiSelector().resourceId("8LQQF7")';

    // -- Receipt Locators
    private readonly transactionReceiptHeaderSelector = 'android=new UiSelector().text("Send Money Successful")';
    protected readonly amountSentSelector = 'android=new UiSelector().resourceId("L84AFP")';
    protected readonly refNumberSelector = 'android=new UiSelector().resourceId("56FWEC")';
    protected readonly receiverNameSelector = 'android=new UiSelector().resourceId("ZBZIFA")';
    protected readonly receiverMobileSelector = 'android=new UiSelector().resourceId("L02HLH")';
    protected readonly paymentMethodReceiptSelector = 'android=new UiSelector().resourceId("E9A6LE")';
    protected readonly amountToSendReceiptSelector = 'android=new UiSelector().resourceId("VB5N2U")';
    protected readonly serviceFeeReceiptSelector = 'android=new UiSelector().resourceId("KRKBMB")'
    protected readonly totalAmountReceiptSelector = 'android=new UiSelector().resourceId("46ELT5")';
    protected readonly pleaseReviewSelector = 'android=new UiSelector().resourceId("BHKLOB")';
    protected readonly backToHomeButtonSelector = 'android=new UiSelector().resourceId("T77C1L")';
    protected readonly newTransactionButtonSelector = 'android=new UiSelector().resourceId("EXIVDC")';

    // ===========================================
    // Actions
    // ===========================================
    async tapToMLBranch(): Promise<void> {
        await AllureReporter.step('Tap on To ML Branch option', async () => {
            Logger.action('Tapping on To ML Branch option');
            await this.tap(this.toMLBranchSelector);
        });
    }

    async tapToMcashUser(): Promise<void> {
        await AllureReporter.step('Tap on To MCash User option', async () => {
            Logger.action('Tapping on To MCash User option');
            await this.tap(this.toMcashUserSelector);
        });
    }

    async tapToMLXpress(): Promise<void> {
        await AllureReporter.step('Tap on To MLXpress option', async () => {
            Logger.action('Tapping on To MLXpress option');
            await this.tap(this.toMLXpressSelector);
        });
    }

    async selectSavedRecipient(index: number): Promise<void> {
        await AllureReporter.step(`Select saved recipient at index ${index}`, async () => {
            Logger.action(`Selecting saved recipient at index ${index}`);
            await this.tap(this.savedRecipientsSelector);
            const recipient = this.recipientSelector(index);
            await this.tap(recipient);
            await this.tap(this.selectRecipientButtonSelector);
        });
    }

    async addNewRecipient(recipientDetails: RecipientDetails): Promise<void> {
        await AllureReporter.step('Add a new recipient', async () => {
            Logger.action('Adding a new recipient');
            await this.enterText(this.firstNameInputSelector, recipientDetails.firstName);
            if (recipientDetails.middleName) {
                await this.enterText(this.middleNameInputSelector, recipientDetails.middleName);
            } else {
                await this.tap(this.noMiddleNameCheckboxSelector);
            }
            await this.enterText(this.lastNameInputSelector, recipientDetails.lastName);
            if (recipientDetails.suffix) {
                await this.enterText(this.suffixInputSelector, recipientDetails.suffix);
            }
            await this.enterText(this.nickNameInputSelector, recipientDetails.nickName);
            await this.enterText(this.mobileNumberInputSelector, recipientDetails.mobileNumber);
            Logger.info('New recipient details entered');
        });
    }

    async kwartaPadalaFlow(amount: number, recipientDetails?: RecipientDetails, useSavedRecipientIndex?: number): Promise<void> {
        await AllureReporter.step('Execute Kwarta Padala flow', async () => {
            Logger.action('Starting Kwarta Padala flow');
            await this.tapToMLBranch();
            await this.waitForElement(this.kwartaPadalaHeader);

            if (recipientDetails) {
                await this.addNewRecipient(recipientDetails);
            } else if (useSavedRecipientIndex !== undefined) {
                await this.selectSavedRecipient(useSavedRecipientIndex);
            }

            await this.tap(this.nextButtonSelector);
            await this.waitForElement(this.howMuchToTransferSelector);
            await this.enterText(this.amountInputSelector, amount.toString());
            await this.tap(this.nextButtonSelector);

            await this.tap(this.mcashBalanceSelector);
            await this.waitForElement(this.confirmDetailsHeaderSelector);

            await this.tap(this.confirmButtonSelector);
        });
    }

    // ===========================================
    // Verifications
    // ===========================================
    async verifySendMoneySuccess(): Promise<boolean> {
        await AllureReporter.step('Verify Send Money success receipt is displayed', async () => {
            Logger.info('Verifying Send Money success receipt');
            await this.waitForElement(this.transactionReceiptHeaderSelector, {
                timeout: 10000,
                timeoutMsg: 'Send Money success receipt not displayed within 10s',
            });   // TODO : Add more verifications for receipt details such as amount, receiver name, ref number, etc.
        });
        return true;
    }
}