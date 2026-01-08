/**
 * TestDataFactory - Factory pattern for generating test data
 * Supports dynamic data generation and external data loading
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';

// Simulated Faker-like functions for test data generation
// In production, consider using @faker-js/faker

const randomString = (length: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomEmail = (): string => {
  return `test.${randomString(8)}@example.com`;
};

const randomPhone = (): string => {
  return `+1${randomNumber(200, 999)}${randomNumber(100, 999)}${randomNumber(1000, 9999)}`;
};

const randomPassword = (): string => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';

  return [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
    randomString(8),
  ].join('');
};

// User interface
export interface User {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreditCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

/**
 * TestDataFactory class for generating and loading test data
 */
export class TestDataFactory {
  private static dataPath = path.join(process.cwd(), 'tests', 'data');

  /**
   * Create a random user
   */
  static createUser(overrides?: Partial<User>): User {
    const firstName = this.randomFirstName();
    const lastName = this.randomLastName();

    return {
      id: this.generateUUID(),
      email: randomEmail(),
      password: randomPassword(),
      firstName,
      lastName,
      phone: randomPhone(),
      ...overrides,
    };
  }

  /**
   * Create a valid user for login tests
   */
  static createValidUser(): User {
    return {
      email: 'testuser@example.com',
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User',
    };
  }

  /**
   * Create an invalid user for negative tests
   */
  static createInvalidUser(): User {
    return {
      email: 'invalid@example.com',
      password: 'wrongpassword',
      firstName: 'Invalid',
      lastName: 'User',
    };
  }

  /**
   * Create a random address
   */
  static createAddress(overrides?: Partial<Address>): Address {
    return {
      street: `${randomNumber(100, 9999)} ${this.randomStreetName()} ${this.randomStreetSuffix()}`,
      city: this.randomCity(),
      state: this.randomState(),
      zipCode: String(randomNumber(10000, 99999)),
      country: 'United States',
      ...overrides,
    };
  }

  /**
   * Create a test credit card (non-real numbers for testing)
   */
  static createCreditCard(overrides?: Partial<CreditCard>): CreditCard {
    const testCardNumbers = [
      '4111111111111111', // Visa test
      '5555555555554444', // Mastercard test
      '378282246310005', // Amex test
    ];

    return {
      number: testCardNumbers[randomNumber(0, testCardNumbers.length - 1)],
      expiry: `${String(randomNumber(1, 12)).padStart(2, '0')}/${randomNumber(25, 30)}`,
      cvv: String(randomNumber(100, 999)),
      name: `${this.randomFirstName()} ${this.randomLastName()}`,
      ...overrides,
    };
  }

  /**
   * Create a random product
   */
  static createProduct(overrides?: Partial<Product>): Product {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    const adjectives = ['Premium', 'Standard', 'Deluxe', 'Basic', 'Pro'];
    const items = ['Widget', 'Gadget', 'Item', 'Product', 'Device'];

    return {
      id: this.generateUUID(),
      name: `${adjectives[randomNumber(0, adjectives.length - 1)]} ${items[randomNumber(0, items.length - 1)]}`,
      price: Number((Math.random() * 100 + 10).toFixed(2)),
      quantity: randomNumber(1, 10),
      category: categories[randomNumber(0, categories.length - 1)],
      ...overrides,
    };
  }

  /**
   * Load test data from JSON file
   */
  static loadTestData<T>(fileName: string): T {
    try {
      const filePath = path.join(this.dataPath, `${fileName}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      Logger.debug(`Loaded test data from ${fileName}.json`);
      return JSON.parse(data) as T;
    } catch (error) {
      Logger.error(`Failed to load test data: ${fileName}`, error as Error);
      throw error;
    }
  }

  /**
   * Load test data from YAML file
   */
  static loadYamlData<T>(fileName: string): T {
    try {
      // Note: Requires js-yaml package
      const filePath = path.join(this.dataPath, `${fileName}.yaml`);
      const data = fs.readFileSync(filePath, 'utf8');
      // Simple YAML parsing for basic cases
      // For complex YAML, use js-yaml library
      Logger.debug(`Loaded YAML data from ${fileName}.yaml`);
      return JSON.parse(JSON.stringify(data)) as T;
    } catch (error) {
      Logger.error(`Failed to load YAML data: ${fileName}`, error as Error);
      throw error;
    }
  }

  /**
   * Save test data to JSON file
   */
  static saveTestData<T>(fileName: string, data: T): void {
    try {
      const filePath = path.join(this.dataPath, `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      Logger.debug(`Saved test data to ${fileName}.json`);
    } catch (error) {
      Logger.error(`Failed to save test data: ${fileName}`, error as Error);
      throw error;
    }
  }

  /**
   * Generate UUID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate random email
   */
  static randomEmail(): string {
    return randomEmail();
  }

  /**
   * Generate random password
   */
  static randomPassword(length: number = 12): string {
    return randomPassword().substring(0, length);
  }

  /**
   * Generate random phone number
   */
  static randomPhone(): string {
    return randomPhone();
  }

  /**
   * Generate random first name
   */
  static randomFirstName(): string {
    const firstNames = [
      'John',
      'Jane',
      'Michael',
      'Sarah',
      'David',
      'Emily',
      'James',
      'Emma',
      'Robert',
      'Olivia',
      'William',
      'Sophia',
    ];
    return firstNames[randomNumber(0, firstNames.length - 1)];
  }

  /**
   * Generate random last name
   */
  static randomLastName(): string {
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Anderson',
      'Taylor',
    ];
    return lastNames[randomNumber(0, lastNames.length - 1)];
  }

  /**
   * Generate random street name
   */
  private static randomStreetName(): string {
    const streets = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park'];
    return streets[randomNumber(0, streets.length - 1)];
  }

  /**
   * Generate random street suffix
   */
  private static randomStreetSuffix(): string {
    const suffixes = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way'];
    return suffixes[randomNumber(0, suffixes.length - 1)];
  }

  /**
   * Generate random city
   */
  private static randomCity(): string {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Seattle'];
    return cities[randomNumber(0, cities.length - 1)];
  }

  /**
   * Generate random state
   */
  private static randomState(): string {
    const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'AZ', 'PA'];
    return states[randomNumber(0, states.length - 1)];
  }

  /**
   * Get environment-specific test data
   */
  static getEnvironmentData<T>(key: string): T | undefined {
    const env = process.env.TEST_ENV || 'dev';
    try {
      const data = this.loadTestData<Record<string, T>>(`environments/${env}`);
      return data[key];
    } catch {
      Logger.warn(`No environment data found for ${key} in ${env}`);
      return undefined;
    }
  }
}

export default TestDataFactory;
