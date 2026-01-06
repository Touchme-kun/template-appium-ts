/**
 * ScreenFactory - Factory pattern for platform-specific screen instantiation
 * Automatically detects platform and returns appropriate screen implementation
 */

import { browser } from '@wdio/globals';
import { Logger } from '../utils/Logger';

export type Platform = 'android' | 'ios';

export interface ScreenConstructor<T> {
  new (): T;
}

/**
 * Get current platform
 */
export function getPlatform(): Platform {
  try {
    const caps = browser.capabilities as Record<string, unknown>;
    const platformName = (caps.platformName as string || '').toLowerCase();
    return platformName === 'ios' ? 'ios' : 'android';
  } catch {
    return 'android';
  }
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return getPlatform() === 'android';
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return getPlatform() === 'ios';
}

/**
 * ScreenFactory class for creating platform-specific screens
 */
export class ScreenFactory {
  private static instances: Map<string, unknown> = new Map();

  /**
   * Get or create a screen instance
   * Uses singleton pattern per screen type
   */
  static getScreen<T>(
    androidScreen: ScreenConstructor<T>,
    iosScreen: ScreenConstructor<T>,
    key?: string
  ): T {
    const platform = getPlatform();
    const cacheKey = key || androidScreen.name;
    const fullKey = `${cacheKey}_${platform}`;

    if (this.instances.has(fullKey)) {
      return this.instances.get(fullKey) as T;
    }

    const ScreenClass = platform === 'ios' ? iosScreen : androidScreen;
    const instance = new ScreenClass();
    this.instances.set(fullKey, instance);

    Logger.debug(`Created ${platform} screen instance: ${cacheKey}`);
    return instance;
  }

  /**
   * Create a new screen instance (non-singleton)
   */
  static createScreen<T>(
    androidScreen: ScreenConstructor<T>,
    iosScreen: ScreenConstructor<T>
  ): T {
    const platform = getPlatform();
    const ScreenClass = platform === 'ios' ? iosScreen : androidScreen;
    return new ScreenClass();
  }

  /**
   * Get platform-specific value
   */
  static getValue<T>(androidValue: T, iosValue: T): T {
    return getPlatform() === 'ios' ? iosValue : androidValue;
  }

  /**
   * Get platform-specific locator
   */
  static getLocator(androidLocator: string, iosLocator: string): string {
    return getPlatform() === 'ios' ? iosLocator : androidLocator;
  }

  /**
   * Clear all cached screen instances
   */
  static clearCache(): void {
    this.instances.clear();
    Logger.debug('Screen cache cleared');
  }

  /**
   * Remove specific screen from cache
   */
  static removeFromCache(key: string): void {
    const platform = getPlatform();
    const fullKey = `${key}_${platform}`;
    this.instances.delete(fullKey);
  }
}

/**
 * Decorator for platform-specific methods
 */
export function platformSpecific(
  _target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const platform = getPlatform();
    Logger.debug(`Executing ${propertyKey} on ${platform}`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

/**
 * Helper to create platform-aware locators
 */
export function createLocator(android: string, ios: string): () => string {
  return () => (getPlatform() === 'ios' ? ios : android);
}

/**
 * Locator strategies for different platforms
 */
export const LocatorStrategy = {
  /**
   * Get accessibility ID selector
   */
  accessibilityId(id: string): string {
    return `~${id}`;
  },

  /**
   * Get resource-id selector (Android)
   */
  resourceId(id: string): string {
    return `android=new UiSelector().resourceId("${id}")`;
  },

  /**
   * Get iOS predicate selector
   */
  iosPredicate(predicate: string): string {
    return `-ios predicate string:${predicate}`;
  },

  /**
   * Get iOS class chain selector
   */
  iosClassChain(chain: string): string {
    return `-ios class chain:${chain}`;
  },

  /**
   * Get Android UIAutomator selector
   */
  androidUiAutomator(uiAutomator: string): string {
    return `android=${uiAutomator}`;
  },

  /**
   * Get platform-specific selector
   */
  platform(android: string, ios: string): string {
    return ScreenFactory.getLocator(android, ios);
  },

  /**
   * Get text-based selector
   */
  text(text: string): string {
    return isAndroid()
      ? `android=new UiSelector().text("${text}")`
      : `-ios predicate string:label == "${text}"`;
  },

  /**
   * Get partial text selector
   */
  partialText(text: string): string {
    return isAndroid()
      ? `android=new UiSelector().textContains("${text}")`
      : `-ios predicate string:label CONTAINS "${text}"`;
  },

  /**
   * Get class name selector
   */
  className(android: string, ios: string): string {
    return isAndroid() ? `//*[@class="${android}"]` : `//*[@type="${ios}"]`;
  },
};

export default ScreenFactory;
