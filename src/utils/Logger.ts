import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import type { LogMetadata } from '../types/framework.types';

/**
 * Logger configuration and utility class
 * Provides structured logging with file and console transports
 *
 * Features:
 * - Multiple transports (console, file, JSON)
 * - Log rotation with configurable size and file count
 * - Colorized console output
 * - Test context correlation
 * - Performance metrics tracking
 * - Allure report integration
 */

// Create logs directory path
const logsDir = path.resolve(process.cwd(), 'logs');
const testRunLogsDir = path.join(logsDir, 'runs');

// Ensure logs directories exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
if (!fs.existsSync(testRunLogsDir)) {
  fs.mkdirSync(testRunLogsDir, { recursive: true });
}

// Generate unique run ID for this execution
const runId = new Date().toISOString().replace(/[:.]/g, '-');

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// JSON format for file logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let log = `${timestamp} ${level}: ${message}`;

    if (Object.keys(metadata).length > 0 && process.env.LOG_LEVEL === 'debug') {
      log += ` ${JSON.stringify(metadata)}`;
    }

    return log;
  })
);

// Create Winston logger instance
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'mobile-automation', runId },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 14,
      tailable: true,
    }),
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
    }),
    // Per-run log file
    new winston.transports.File({
      filename: path.join(testRunLogsDir, `run-${runId}.log`),
      format: jsonFormat,
    }),
  ],
});

/**
 * Performance tracker for measuring operation durations
 */
interface PerformanceEntry {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Logger utility class
 * Provides static methods for structured logging
 */
export class Logger {
  private static currentTestName: string | undefined;
  private static currentStepName: string | undefined;
  private static performanceMap: Map<string, PerformanceEntry> = new Map();
  private static testMetrics: Map<string, number[]> = new Map();

  /**
   * Get the current run ID
   */
  static getRunId(): string {
    return runId;
  }

  /**
   * Set current test context for log correlation
   */
  static setTestContext(testName: string): void {
    Logger.currentTestName = testName;
  }

  /**
   * Clear test context
   */
  static clearTestContext(): void {
    Logger.currentTestName = undefined;
    Logger.currentStepName = undefined;
  }

  /**
   * Set current step name
   */
  static setStepContext(stepName: string): void {
    Logger.currentStepName = stepName;
  }

  /**
   * Get metadata with test context
   */
  private static getMetadata(metadata?: LogMetadata): LogMetadata {
    return {
      testName: Logger.currentTestName,
      stepName: Logger.currentStepName,
      ...metadata,
    };
  }

  /**
   * Log info message
   */
  static info(message: string, metadata?: LogMetadata): void {
    winstonLogger.info(message, Logger.getMetadata(metadata));
  }

  /**
   * Log error message
   */
  static error(message: string, error?: Error, metadata?: LogMetadata): void {
    const meta = Logger.getMetadata(metadata);
    if (error) {
      winstonLogger.error(message, { ...meta, error: error.message, stack: error.stack });
    } else {
      winstonLogger.error(message, meta);
    }
  }

  /**
   * Log warning message
   */
  static warn(message: string, error?: Error | LogMetadata, metadata?: LogMetadata): void {
    const meta = Logger.getMetadata(metadata);
    if (error instanceof Error) {
      winstonLogger.warn(message, { ...meta, error: error.message, stack: error.stack });
    } else if (error) {
      winstonLogger.warn(message, { ...meta, ...error });
    } else {
      winstonLogger.warn(message, meta);
    }
  }

  /**
   * Log debug message
   */
  static debug(message: string, data?: unknown): void {
    const meta = Logger.getMetadata();
    if (data !== undefined) {
      winstonLogger.debug(message, { ...meta, data });
    } else {
      winstonLogger.debug(message, meta);
    }
  }

  /**
   * Log a test step
   */
  static step(stepName: string, description?: string): void {
    Logger.currentStepName = stepName;
    const message = description ? `[STEP] ${stepName}: ${description}` : `[STEP] ${stepName}`;
    winstonLogger.info(message, Logger.getMetadata());
  }

  /**
   * Log test start
   */
  static testStart(testName: string): void {
    Logger.setTestContext(testName);
    winstonLogger.info('━'.repeat(60));
    winstonLogger.info(`TEST START: ${testName}`, Logger.getMetadata());
    winstonLogger.info('━'.repeat(60));
  }

  /**
   * Log test end
   */
  static testEnd(testName: string, passed: boolean, duration?: number): void {
    const status = passed ? '✓ PASSED' : '✗ FAILED';
    const durationStr = duration ? ` (${(duration / 1000).toFixed(2)}s)` : '';

    winstonLogger.info('━'.repeat(60));
    winstonLogger.info(`TEST END: ${testName} - ${status}${durationStr}`, Logger.getMetadata());
    winstonLogger.info('━'.repeat(60));
    Logger.clearTestContext();
  }

  /**
   * Log suite start
   */
  static suiteStart(suiteName: string): void {
    winstonLogger.info('═'.repeat(60));
    winstonLogger.info(`SUITE START: ${suiteName}`);
    winstonLogger.info('═'.repeat(60));
  }

  /**
   * Log suite end
   */
  static suiteEnd(suiteName: string, passed: number, failed: number, skipped: number): void {
    winstonLogger.info('═'.repeat(60));
    winstonLogger.info(`SUITE END: ${suiteName}`);
    winstonLogger.info(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    winstonLogger.info('═'.repeat(60));
  }

  /**
   * Log action (for Allure step tracking)
   */
  static action(actionName: string, details?: string): void {
    const message = details ? `[ACTION] ${actionName}: ${details}` : `[ACTION] ${actionName}`;
    winstonLogger.info(message, Logger.getMetadata());
  }

  /**
   * Log assertion
   */
  static assertion(assertionName: string, expected: unknown, actual: unknown): void {
    winstonLogger.debug(`[ASSERTION] ${assertionName}`, {
      ...Logger.getMetadata(),
      expected,
      actual,
    });
  }

  /**
   * Log performance metric
   */
  static performance(operation: string, durationMs: number): void {
    winstonLogger.info(`[PERFORMANCE] ${operation}: ${durationMs}ms`, Logger.getMetadata());

    // Track metrics for summary
    if (!this.testMetrics.has(operation)) {
      this.testMetrics.set(operation, []);
    }
    this.testMetrics.get(operation)!.push(durationMs);
  }

  /**
   * Start a performance timer
   */
  static startTimer(operation: string): void {
    this.performanceMap.set(operation, {
      operation,
      startTime: Date.now(),
    });
    Logger.debug(`Timer started: ${operation}`);
  }

  /**
   * Stop a performance timer and log the duration
   */
  static stopTimer(operation: string): number {
    const entry = this.performanceMap.get(operation);
    if (!entry) {
      Logger.warn(`Timer not found for operation: ${operation}`);
      return 0;
    }

    entry.endTime = Date.now();
    entry.duration = entry.endTime - entry.startTime;
    this.performanceMap.delete(operation);

    this.performance(operation, entry.duration);
    return entry.duration;
  }

  /**
   * Measure an async operation
   */
  static async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      this.stopTimer(operation);
      return result;
    } catch (error) {
      this.stopTimer(operation);
      throw error;
    }
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    this.testMetrics.forEach((values, operation) => {
      if (values.length > 0) {
        summary[operation] = {
          avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    });

    return summary;
  }

  /**
   * Log performance summary
   */
  static logPerformanceSummary(): void {
    const summary = this.getPerformanceSummary();
    if (Object.keys(summary).length > 0) {
      winstonLogger.info('═'.repeat(60));
      winstonLogger.info('PERFORMANCE SUMMARY');
      winstonLogger.info('═'.repeat(60));
      Object.entries(summary).forEach(([operation, stats]) => {
        winstonLogger.info(
          `${operation}: avg=${stats.avg}ms, min=${stats.min}ms, max=${stats.max}ms, count=${stats.count}`
        );
      });
      winstonLogger.info('═'.repeat(60));
    }
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.performanceMap.clear();
    this.testMetrics.clear();
  }

  /**
   * Log network request
   */
  static network(method: string, url: string, statusCode?: number, durationMs?: number): void {
    const status = statusCode ? `[${statusCode}]` : '';
    const duration = durationMs ? ` (${durationMs}ms)` : '';
    winstonLogger.info(`[NETWORK] ${method} ${url} ${status}${duration}`, Logger.getMetadata());
  }

  /**
   * Log element interaction
   */
  static element(action: string, selector: string, value?: string): void {
    const valueStr = value ? ` with value "${value}"` : '';
    winstonLogger.debug(`[ELEMENT] ${action} on ${selector}${valueStr}`, Logger.getMetadata());
  }

  /**
   * Log screenshot capture
   */
  static screenshot(name: string, filePath?: string): void {
    const pathStr = filePath ? ` saved to ${filePath}` : '';
    winstonLogger.info(`[SCREENSHOT] ${name}${pathStr}`, Logger.getMetadata());
  }

  /**
   * Log device action
   */
  static device(action: string, details?: string): void {
    const detailsStr = details ? `: ${details}` : '';
    winstonLogger.info(`[DEVICE] ${action}${detailsStr}`, Logger.getMetadata());
  }

  /**
   * Create a child logger with additional context
   */
  static createChildLogger(context: Record<string, unknown>): winston.Logger {
    return winstonLogger.child(context);
  }

  /**
   * Get log file path for current run
   */
  static getCurrentRunLogPath(): string {
    return path.join(testRunLogsDir, `run-${runId}.log`);
  }

  /**
   * Read current run logs (for attaching to reports)
   */
  static getCurrentRunLogs(): string {
    const logPath = this.getCurrentRunLogPath();
    if (fs.existsSync(logPath)) {
      return fs.readFileSync(logPath, 'utf8');
    }
    return '';
  }
}

export default Logger;
