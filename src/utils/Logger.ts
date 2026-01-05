import * as winston from 'winston';
import * as path from 'path';
import type { LogMetadata } from '../types/framework.types';

/**
 * Logger configuration and utility class
 * Provides structured logging with file and console transports
 */

// Create logs directory path
const logsDir = path.resolve(process.cwd(), 'logs');

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
  defaultMeta: { service: 'mobile-automation' },
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
  ],
});

/**
 * Logger utility class
 * Provides static methods for structured logging
 */
export class Logger {
  private static currentTestName: string | undefined;
  private static currentStepName: string | undefined;

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
  static warn(message: string, metadata?: LogMetadata): void {
    winstonLogger.warn(message, Logger.getMetadata(metadata));
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
  }
}

export default Logger;
