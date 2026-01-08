import { browser, expect } from '@wdio/globals';

/**
 * Smoke Test - Quick framework validation
 * Tests basic WebdriverIO/Appium connectivity
 */
describe('Smoke Test', () => {
  it('should verify Appium session is created', async () => {
    // Check session exists
    const sessionId = browser.sessionId;
    console.log(`✅ Session ID: ${sessionId}`);
    expect(sessionId).toBeTruthy();
  });

  it('should get device info', async () => {
    const caps = browser.capabilities as Record<string, unknown>;

    console.log('📱 Device Info:');
    console.log(`   Platform: ${caps.platformName}`);
    console.log(`   Version: ${caps.platformVersion || 'N/A'}`);
    console.log(`   Device: ${caps.deviceName || 'N/A'}`);

    expect(caps.platformName).toBeTruthy();
  });

  it('should get window size', async () => {
    const { width, height } = await browser.getWindowSize();

    console.log(`📐 Screen Size: ${width}x${height}`);

    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});
