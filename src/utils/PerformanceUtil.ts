/**
 * PerformanceUtil - Performance measurement and monitoring utilities
 * Tracks execution times, memory usage, and test metrics
 */

import { Logger } from './Logger';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceSummary {
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  count: number;
  metrics: PerformanceMetric[];
}

export class PerformanceUtil {
  private static metrics: Map<string, PerformanceMetric> = new Map();
  private static completedMetrics: PerformanceMetric[] = [];

  /**
   * Start measuring performance for a named operation
   */
  static startMeasure(name: string, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata,
    };
    this.metrics.set(name, metric);
    Logger.debug(`Performance measurement started: ${name}`);
  }

  /**
   * End measuring performance for a named operation
   */
  static endMeasure(name: string): number {
    const metric = this.metrics.get(name);
    if (!metric) {
      Logger.warn(`No performance measurement found for: ${name}`);
      return 0;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    this.completedMetrics.push(metric);
    this.metrics.delete(name);

    Logger.debug(`Performance measurement ended: ${name} - ${metric.duration}ms`);
    return metric.duration;
  }

  /**
   * Measure async function execution time
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; duration: number }> {
    this.startMeasure(name, metadata);
    try {
      const result = await fn();
      const duration = this.endMeasure(name);
      return { result, duration };
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure sync function execution time
   */
  static measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): { result: T; duration: number } {
    this.startMeasure(name, metadata);
    try {
      const result = fn();
      const duration = this.endMeasure(name);
      return { result, duration };
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Get performance summary for all completed metrics
   */
  static getSummary(): PerformanceSummary {
    if (this.completedMetrics.length === 0) {
      return {
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        count: 0,
        metrics: [],
      };
    }

    const durations = this.completedMetrics.map(m => m.duration || 0);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    return {
      totalDuration,
      averageDuration: totalDuration / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      count: durations.length,
      metrics: [...this.completedMetrics],
    };
  }

  /**
   * Get performance summary for specific operation type
   */
  static getSummaryByName(namePattern: string | RegExp): PerformanceSummary {
    const filtered = this.completedMetrics.filter(m => {
      if (typeof namePattern === 'string') {
        return m.name.includes(namePattern);
      }
      return namePattern.test(m.name);
    });

    if (filtered.length === 0) {
      return {
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        count: 0,
        metrics: [],
      };
    }

    const durations = filtered.map(m => m.duration || 0);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    return {
      totalDuration,
      averageDuration: totalDuration / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      count: durations.length,
      metrics: filtered,
    };
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear();
    this.completedMetrics = [];
    Logger.debug('Performance metrics cleared');
  }

  /**
   * Log performance summary
   */
  static logSummary(): void {
    const summary = this.getSummary();
    Logger.info('=== Performance Summary ===');
    Logger.info(`Total operations: ${summary.count}`);
    Logger.info(`Total duration: ${summary.totalDuration}ms`);
    Logger.info(`Average duration: ${summary.averageDuration.toFixed(2)}ms`);
    Logger.info(`Min duration: ${summary.minDuration}ms`);
    Logger.info(`Max duration: ${summary.maxDuration}ms`);

    // Log slowest operations
    const sorted = [...summary.metrics].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    if (sorted.length > 0) {
      Logger.info('Slowest operations:');
      sorted.slice(0, 5).forEach((m, i) => {
        Logger.info(`  ${i + 1}. ${m.name}: ${m.duration}ms`);
      });
    }
  }

  /**
   * Assert that operation completed within threshold
   */
  static assertWithinThreshold(
    name: string,
    thresholdMs: number,
    actual?: number
  ): boolean {
    const metric = actual !== undefined 
      ? { duration: actual } 
      : this.completedMetrics.find(m => m.name === name);

    if (!metric?.duration) {
      Logger.warn(`No performance data found for: ${name}`);
      return false;
    }

    const passed = metric.duration <= thresholdMs;
    
    if (!passed) {
      Logger.warn(
        `Performance threshold exceeded: ${name} took ${metric.duration}ms (threshold: ${thresholdMs}ms)`
      );
    }

    return passed;
  }

  /**
   * Create a timer that can be used for multiple measurements
   */
  static createTimer(): { start: () => void; stop: () => number; reset: () => void } {
    let startTime: number | null = null;

    return {
      start: () => {
        startTime = Date.now();
      },
      stop: () => {
        if (startTime === null) return 0;
        const duration = Date.now() - startTime;
        startTime = null;
        return duration;
      },
      reset: () => {
        startTime = null;
      },
    };
  }

  /**
   * Get memory usage (Node.js specific)
   */
  static getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } | null {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
      };
    }
    return null;
  }

  /**
   * Log memory usage
   */
  static logMemoryUsage(): void {
    const memory = this.getMemoryUsage();
    if (memory) {
      Logger.info(`Memory Usage - Heap: ${memory.heapUsed}MB / ${memory.heapTotal}MB, External: ${memory.external}MB`);
    }
  }
}

export default PerformanceUtil;
