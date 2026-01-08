/**
 * Device Logs Helper
 * Captures device logs (logcat for Android, syslog for iOS) for debugging
 */

import { browser } from '@wdio/globals';
import { Logger } from './Logger';
import { AllureReporter } from './AllureReporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: number;
  level: string;
  message: string;
}

/**
 * DeviceLogsHelper - Captures and manages device logs
 */
export class DeviceLogsHelper {
  private static logsDir = path.resolve(process.cwd(), 'logs', 'device');
  private static isCapturing = false;
  private static captureInterval: NodeJS.Timeout | null = null;
  private static logBuffer: LogEntry[] = [];

  /**
   * Initialize the logs directory
   */
  static initialize(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Get device logs based on platform
   * @param logType - Type of logs to retrieve (logcat, syslog, crashlog, etc.)
   */
  static async getDeviceLogs(logType?: string): Promise<LogEntry[]> {
    try {
      const caps = browser.capabilities as Record<string, unknown>;
      const platformName = String(caps.platformName || '').toLowerCase();

      // Determine log type based on platform
      const type = logType || (platformName === 'android' ? 'logcat' : 'syslog');

      // Get available log types
      const availableTypes = await browser.getLogTypes();
      Logger.debug(`Available log types: ${availableTypes.join(', ')}`);

      if (!availableTypes.includes(type)) {
        Logger.warn(`Log type '${type}' not available. Available: ${availableTypes.join(', ')}`);
        return [];
      }

      // Retrieve logs
      const logs = await browser.getLogs(type);
      return (logs as Array<{ timestamp: number; level: string; message: string }>).map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
      }));
    } catch (error) {
      Logger.error('Failed to get device logs', error as Error);
      return [];
    }
  }

  /**
   * Get Android logcat logs
   */
  static async getLogcat(): Promise<LogEntry[]> {
    return this.getDeviceLogs('logcat');
  }

  /**
   * Get iOS syslog logs
   */
  static async getSyslog(): Promise<LogEntry[]> {
    return this.getDeviceLogs('syslog');
  }

  /**
   * Get crash logs (iOS)
   */
  static async getCrashLogs(): Promise<LogEntry[]> {
    return this.getDeviceLogs('crashlog');
  }

  /**
   * Get server logs (Appium server)
   */
  static async getServerLogs(): Promise<LogEntry[]> {
    return this.getDeviceLogs('server');
  }

  /**
   * Filter logs by level
   */
  static filterByLevel(logs: LogEntry[], level: string): LogEntry[] {
    return logs.filter((log) => log.level.toLowerCase() === level.toLowerCase());
  }

  /**
   * Filter logs by keyword
   */
  static filterByKeyword(logs: LogEntry[], keyword: string): LogEntry[] {
    const lowerKeyword = keyword.toLowerCase();
    return logs.filter((log) => log.message.toLowerCase().includes(lowerKeyword));
  }

  /**
   * Filter error logs
   */
  static getErrorLogs(logs: LogEntry[]): LogEntry[] {
    return logs.filter(
      (log) =>
        log.level.toLowerCase() === 'error' ||
        log.level.toLowerCase() === 'severe' ||
        log.message.toLowerCase().includes('error') ||
        log.message.toLowerCase().includes('exception')
    );
  }

  /**
   * Format logs for display
   */
  static formatLogs(logs: LogEntry[]): string {
    return logs
      .map((log) => {
        const date = new Date(log.timestamp).toISOString();
        return `[${date}] [${log.level}] ${log.message}`;
      })
      .join('\n');
  }

  /**
   * Save logs to file
   */
  static saveLogsToFile(logs: LogEntry[], filename: string): string {
    this.initialize();
    const filePath = path.join(this.logsDir, filename);
    const content = this.formatLogs(logs);
    fs.writeFileSync(filePath, content, 'utf8');
    Logger.info(`Device logs saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Save logs as JSON
   */
  static saveLogsAsJson(logs: LogEntry[], filename: string): string {
    this.initialize();
    const filePath = path.join(this.logsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf8');
    Logger.info(`Device logs (JSON) saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Capture and attach logs to Allure report
   */
  static async captureAndAttach(attachmentName: string): Promise<void> {
    try {
      const logs = await this.getDeviceLogs();
      if (logs.length > 0) {
        const formattedLogs = this.formatLogs(logs);
        AllureReporter.addAttachment(attachmentName, formattedLogs, 'text/plain');
        Logger.info(`Attached ${logs.length} device log entries to report`);
      } else {
        Logger.debug('No device logs to attach');
      }
    } catch (error) {
      Logger.error('Failed to capture and attach device logs', error as Error);
    }
  }

  /**
   * Capture error logs and attach to Allure
   */
  static async captureErrorLogs(attachmentName = 'Error Logs'): Promise<void> {
    try {
      const allLogs = await this.getDeviceLogs();
      const errorLogs = this.getErrorLogs(allLogs);

      if (errorLogs.length > 0) {
        const formattedLogs = this.formatLogs(errorLogs);
        AllureReporter.addAttachment(attachmentName, formattedLogs, 'text/plain');
        Logger.warn(`Found ${errorLogs.length} error entries in device logs`);
      }
    } catch (error) {
      Logger.error('Failed to capture error logs', error as Error);
    }
  }

  /**
   * Start continuous log capture
   */
  static startCapture(intervalMs = 5000): void {
    if (this.isCapturing) {
      Logger.warn('Log capture already in progress');
      return;
    }

    this.isCapturing = true;
    this.logBuffer = [];

    this.captureInterval = setInterval(async () => {
      try {
        const logs = await this.getDeviceLogs();
        this.logBuffer.push(...logs);
      } catch (error) {
        Logger.debug('Failed to capture logs during interval');
      }
    }, intervalMs);

    Logger.info(`Started device log capture (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop continuous log capture and return collected logs
   */
  static stopCapture(): LogEntry[] {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.isCapturing = false;
    const logs = [...this.logBuffer];
    this.logBuffer = [];

    Logger.info(`Stopped device log capture. Collected ${logs.length} entries`);
    return logs;
  }

  /**
   * Capture logs for a specific test
   */
  static async captureTestLogs(testName: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = testName.replace(/[^a-zA-Z0-9]/g, '_');

    try {
      const logs = await this.getDeviceLogs();

      if (logs.length > 0) {
        // Save to file
        const filename = `${sanitizedName}_${timestamp}.log`;
        this.saveLogsToFile(logs, filename);

        // Attach to Allure
        const formattedLogs = this.formatLogs(logs);
        AllureReporter.addAttachment(`Device Logs - ${testName}`, formattedLogs, 'text/plain');
      }
    } catch (error) {
      Logger.error(`Failed to capture logs for test: ${testName}`, error as Error);
    }
  }

  /**
   * Get logs since a specific timestamp
   */
  static async getLogsSince(timestamp: number): Promise<LogEntry[]> {
    const allLogs = await this.getDeviceLogs();
    return allLogs.filter((log) => log.timestamp >= timestamp);
  }

  /**
   * Clear device logs (start fresh)
   * Note: This may not be supported on all platforms
   */
  static async clearLogs(): Promise<void> {
    try {
      // Getting logs clears them from the buffer in most implementations
      await this.getDeviceLogs();
      Logger.debug('Device logs cleared');
    } catch (error) {
      Logger.debug('Could not clear device logs');
    }
  }

  /**
   * Get a summary of log statistics
   */
  static getLogSummary(logs: LogEntry[]): Record<string, number> {
    const summary: Record<string, number> = {
      total: logs.length,
      error: 0,
      warning: 0,
      info: 0,
      debug: 0,
      other: 0,
    };

    logs.forEach((log) => {
      const level = log.level.toLowerCase();
      if (level.includes('error') || level.includes('severe')) {
        summary.error++;
      } else if (level.includes('warn')) {
        summary.warning++;
      } else if (level.includes('info')) {
        summary.info++;
      } else if (level.includes('debug') || level.includes('verbose')) {
        summary.debug++;
      } else {
        summary.other++;
      }
    });

    return summary;
  }
}

export default DeviceLogsHelper;
