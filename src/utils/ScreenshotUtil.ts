/**
 * ScreenshotUtil - Screenshot capture and comparison utilities
 * Provides screenshot management for test automation
 */

import * as fs from 'fs';
import * as path from 'path';
import { $, browser } from '@wdio/globals';
import { Logger } from './Logger';
import { AllureReporter } from './AllureReporter';

// Type alias for WebdriverIO element (v9 compatible)
type WdioElement = Awaited<ReturnType<typeof $>>;

export interface ScreenshotOptions {
  directory?: string;
  filename?: string;
  attachToReport?: boolean;
}

export interface ComparisonResult {
  match: boolean;
  difference: number;
  baselinePath: string;
  actualPath: string;
  diffPath?: string;
}

export class ScreenshotUtil {
  private static defaultDirectory = path.join(process.cwd(), 'reports', 'screenshots');
  private static baselineDirectory = path.join(process.cwd(), 'tests', 'visual-baseline');

  /**
   * Initialize screenshot directories
   */
  static initialize(): void {
    this.ensureDirectoryExists(this.defaultDirectory);
    this.ensureDirectoryExists(this.baselineDirectory);
  }

  /**
   * Capture screenshot of the current screen
   */
  static async capture(name: string, options: ScreenshotOptions = {}): Promise<string> {
    const {
      directory = this.defaultDirectory,
      filename = `${name}_${Date.now()}.png`,
      attachToReport = true,
    } = options;

    this.ensureDirectoryExists(directory);
    const filePath = path.join(directory, filename);

    try {
      const screenshot = await browser.takeScreenshot();
      const buffer = Buffer.from(screenshot, 'base64');
      fs.writeFileSync(filePath, buffer);

      Logger.info(`Screenshot saved: ${filePath}`);

      if (attachToReport) {
        AllureReporter.addAttachment(name, buffer, 'image/png');
      }

      return filePath;
    } catch (error) {
      Logger.error(`Failed to capture screenshot: ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * Capture screenshot on failure
   */
  static async captureOnFailure(testName: string): Promise<string | null> {
    try {
      const sanitizedName = testName.replace(/[^a-zA-Z0-9]/g, '_');
      return await this.capture(`FAILURE_${sanitizedName}`, {
        attachToReport: true,
      });
    } catch (error) {
      Logger.error('Failed to capture failure screenshot', error as Error);
      return null;
    }
  }

  /**
   * Capture element screenshot
   */
  static async captureElement(
    element: WdioElement,
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    const {
      directory = this.defaultDirectory,
      filename = `${name}_${Date.now()}.png`,
      attachToReport = true,
    } = options;

    this.ensureDirectoryExists(directory);
    const filePath = path.join(directory, filename);

    try {
      await element.saveScreenshot(filePath);
      Logger.info(`Element screenshot saved: ${filePath}`);

      if (attachToReport) {
        const buffer = fs.readFileSync(filePath);
        AllureReporter.addAttachment(name, buffer, 'image/png');
      }

      return filePath;
    } catch (error) {
      Logger.error(`Failed to capture element screenshot: ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * Save baseline screenshot for visual comparison
   */
  static async saveBaseline(name: string): Promise<string> {
    const filename = `${name}.png`;
    return await this.capture(name, {
      directory: this.baselineDirectory,
      filename,
      attachToReport: false,
    });
  }

  /**
   * Compare current screenshot with baseline
   * Note: For production use, integrate with image comparison libraries like pixelmatch or resemblejs
   */
  static async compareWithBaseline(
    name: string,
    threshold: number = 0.1
  ): Promise<ComparisonResult> {
    const baselinePath = path.join(this.baselineDirectory, `${name}.png`);
    const actualPath = await this.capture(name, {
      filename: `${name}_actual.png`,
      attachToReport: false,
    });

    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      Logger.warn(`Baseline not found for ${name}, creating new baseline`);
      await this.saveBaseline(name);
      return {
        match: true,
        difference: 0,
        baselinePath,
        actualPath,
      };
    }

    try {
      // Simple byte comparison - for production, use proper image comparison
      const baselineBuffer = fs.readFileSync(baselinePath);
      const actualBuffer = fs.readFileSync(actualPath);

      const match = baselineBuffer.equals(actualBuffer);
      const difference = match ? 0 : this.calculateSimpleDifference(baselineBuffer, actualBuffer);

      Logger.info(`Visual comparison for ${name}: match=${match}, difference=${difference}`);

      return {
        match: difference <= threshold,
        difference,
        baselinePath,
        actualPath,
      };
    } catch (error) {
      Logger.error(`Failed to compare screenshots: ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * Simple difference calculation (for demonstration)
   * Replace with proper image comparison library for production
   */
  private static calculateSimpleDifference(buffer1: Buffer, buffer2: Buffer): number {
    const length = Math.max(buffer1.length, buffer2.length);
    let differences = 0;

    for (let i = 0; i < length; i++) {
      if (buffer1[i] !== buffer2[i]) {
        differences++;
      }
    }

    return differences / length;
  }

  /**
   * Get all screenshots in directory
   */
  static getScreenshots(directory: string = this.defaultDirectory): string[] {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs.readdirSync(directory)
      .filter(file => file.endsWith('.png'))
      .map(file => path.join(directory, file));
  }

  /**
   * Delete old screenshots older than specified days
   */
  static cleanupOldScreenshots(days: number = 7, directory: string = this.defaultDirectory): number {
    if (!fs.existsSync(directory)) {
      return 0;
    }

    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime.getTime() < cutoff) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    Logger.info(`Cleaned up ${deletedCount} old screenshots`);
    return deletedCount;
  }

  /**
   * Delete all screenshots in directory
   */
  static clearScreenshots(directory: string = this.defaultDirectory): void {
    if (fs.existsSync(directory)) {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
      }
      Logger.info(`Cleared all screenshots in ${directory}`);
    }
  }

  /**
   * Ensure directory exists
   */
  private static ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  /**
   * Get screenshot as base64
   */
  static async captureAsBase64(): Promise<string> {
    return await browser.takeScreenshot();
  }

  /**
   * Save base64 screenshot to file
   */
  static saveBase64ToFile(base64: string, filePath: string): void {
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
  }

  /**
   * Create a unique screenshot name
   */
  static createScreenshotName(prefix: string, suffix: string = ''): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}${suffix ? '_' + suffix : ''}.png`;
  }
}

export default ScreenshotUtil;
