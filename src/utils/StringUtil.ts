/**
 * StringUtil - String manipulation utilities
 * Provides common string operations for test automation
 */

export class StringUtil {
  /**
   * Generate a random string of specified length
   */
  static randomString(
    length: number = 10,
    charset: 'alpha' | 'alphanumeric' | 'numeric' | 'hex' = 'alphanumeric'
  ): string {
    const charsets = {
      alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      numeric: '0123456789',
      hex: '0123456789abcdef',
    };

    const chars = charsets[charset];
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /**
   * Generate a random UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Capitalize first letter of a string
   */
  static capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   */
  static titleCase(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Convert string to camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()))
      .replace(/[\s\-_]+/g, '');
  }

  /**
   * Convert string to snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Convert string to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Truncate string to specified length with ellipsis
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Pad string to specified length
   */
  static pad(str: string, length: number, char: string = ' ', position: 'start' | 'end' = 'start'): string {
    if (str.length >= length) return str;
    const padding = char.repeat(length - str.length);
    return position === 'start' ? padding + str : str + padding;
  }

  /**
   * Remove all whitespace from string
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, '');
  }

  /**
   * Normalize whitespace (collapse multiple spaces to single space)
   */
  static normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Check if string is a valid email format
   */
  static isValidEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is a valid phone number format
   */
  static isValidPhone(str: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(str);
  }

  /**
   * Mask sensitive data (e.g., credit card, SSN)
   */
  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (!str || str.length <= visibleChars) return str;
    const masked = maskChar.repeat(str.length - visibleChars);
    return masked + str.slice(-visibleChars);
  }

  /**
   * Mask email address for privacy
   */
  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;

    const maskedLocal =
      local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : '*'.repeat(local.length);

    return `${maskedLocal}@${domain}`;
  }

  /**
   * Extract numbers from string
   */
  static extractNumbers(str: string): string {
    return str.replace(/\D/g, '');
  }

  /**
   * Extract letters from string
   */
  static extractLetters(str: string): string {
    return str.replace(/[^a-zA-Z]/g, '');
  }

  /**
   * Count occurrences of a substring
   */
  static countOccurrences(str: string, searchString: string): number {
    if (!searchString) return 0;
    return (str.match(new RegExp(searchString, 'g')) || []).length;
  }

  /**
   * Reverse a string
   */
  static reverse(str: string): string {
    return str.split('').reverse().join('');
  }

  /**
   * Check if string is palindrome
   */
  static isPalindrome(str: string): boolean {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === this.reverse(cleaned);
  }

  /**
   * Slugify a string (URL-friendly format)
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Escape HTML special characters
   */
  static escapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return str.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }

  /**
   * Unescape HTML entities
   */
  static unescapeHtml(str: string): string {
    const htmlEntities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => htmlEntities[entity]);
  }

  /**
   * Generate a random password with requirements
   */
  static generatePassword(
    length: number = 12,
    options: {
      uppercase?: boolean;
      lowercase?: boolean;
      numbers?: boolean;
      special?: boolean;
    } = {}
  ): string {
    const { uppercase = true, lowercase = true, numbers = true, special = true } = options;

    let charset = '';
    const result: string[] = [];

    if (uppercase) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      charset += chars;
      result.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (lowercase) {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      charset += chars;
      result.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (numbers) {
      const chars = '0123456789';
      charset += chars;
      result.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (special) {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      charset += chars;
      result.push(chars[Math.floor(Math.random() * chars.length)]);
    }

    // Fill remaining length with random characters
    while (result.length < length) {
      result.push(charset[Math.floor(Math.random() * charset.length)]);
    }

    // Shuffle the result
    return result.sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }

  /**
   * Format number with thousand separators
   */
  static formatNumber(num: number, locale: string = 'en-US'): string {
    return num.toLocaleString(locale);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}
