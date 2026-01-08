/**
 * DateTimeUtil - Date and time utility functions
 * Provides common date operations for test automation
 */

export type DateFormat = 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD HH:mm:ss' | 'ISO' | 'timestamp';

export class DateTimeUtil {
  /**
   * Get current date in specified format
   */
  static getCurrentDate(format: DateFormat = 'YYYY-MM-DD'): string {
    return this.formatDate(new Date(), format);
  }

  /**
   * Get current timestamp in milliseconds
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Get current date/time as ISO string
   */
  static getCurrentISOString(): string {
    return new Date().toISOString();
  }

  /**
   * Format a date according to specified format
   */
  static formatDate(date: Date, format: DateFormat): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD HH:mm:ss':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case 'ISO':
        return date.toISOString();
      case 'timestamp':
        return String(date.getTime());
      default:
        return date.toISOString();
    }
  }

  /**
   * Add days to a date
   */
  static addDays(days: number, fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Subtract days from a date
   */
  static subtractDays(days: number, fromDate: Date = new Date()): Date {
    return this.addDays(-days, fromDate);
  }

  /**
   * Add hours to a date
   */
  static addHours(hours: number, fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Add minutes to a date
   */
  static addMinutes(minutes: number, fromDate: Date = new Date()): Date {
    const result = new Date(fromDate);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  /**
   * Get date N days from now (formatted)
   */
  static getDateFromNow(days: number, format: DateFormat = 'YYYY-MM-DD'): string {
    return this.formatDate(this.addDays(days), format);
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * Get difference between two dates in days
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get difference between two dates in hours
   */
  static getHoursDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Get difference between two dates in minutes
   */
  static getMinutesDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60));
  }

  /**
   * Parse date string to Date object
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Get month name
   */
  static getMonthName(date: Date = new Date(), short: boolean = false): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = months[date.getMonth()];
    return short ? month.substring(0, 3) : month;
  }

  /**
   * Get day name
   */
  static getDayName(date: Date = new Date(), short: boolean = false): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    return short ? day.substring(0, 3) : day;
  }

  /**
   * Get week number of the year
   */
  static getWeekNumber(date: Date = new Date()): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Create a timeout ID for test purposes
   */
  static createTestRunId(): string {
    const now = new Date();
    return `${this.formatDate(now, 'YYYY-MM-DD')}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  }

  /**
   * Sleep/wait for specified milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Get age from date of birth
   */
  static getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Get date of birth for a specific age
   */
  static getDateOfBirthForAge(age: number): Date {
    const today = new Date();
    return new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
  }
}

export default DateTimeUtil;
