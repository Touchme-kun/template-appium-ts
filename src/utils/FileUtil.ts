/**
 * FileUtil - File and directory utilities
 * Provides common file operations for test automation
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  extension: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface DirectoryContents {
  files: FileInfo[];
  directories: FileInfo[];
  totalSize: number;
}

export class FileUtil {
  /**
   * Check if file exists
   */
  static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Check if path is a file
   */
  static isFile(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Check if path is a directory
   */
  static isDirectory(dirPath: string): boolean {
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Create directory recursively
   */
  static createDirectory(dirPath: string): void {
    if (!this.exists(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      Logger.debug(`Created directory: ${dirPath}`);
    }
  }

  /**
   * Delete file
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (this.exists(filePath) && this.isFile(filePath)) {
        fs.unlinkSync(filePath);
        Logger.debug(`Deleted file: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(`Failed to delete file: ${filePath}`, error as Error);
      return false;
    }
  }

  /**
   * Delete directory recursively
   */
  static deleteDirectory(dirPath: string): boolean {
    try {
      if (this.exists(dirPath) && this.isDirectory(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        Logger.debug(`Deleted directory: ${dirPath}`);
        return true;
      }
      return false;
    } catch (error) {
      Logger.error(`Failed to delete directory: ${dirPath}`, error as Error);
      return false;
    }
  }

  /**
   * Read file as string
   */
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
    try {
      return fs.readFileSync(filePath, encoding);
    } catch (error) {
      Logger.error(`Failed to read file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Read file as buffer
   */
  static readFileAsBuffer(filePath: string): Buffer {
    try {
      return fs.readFileSync(filePath);
    } catch (error) {
      Logger.error(`Failed to read file as buffer: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Write string to file
   */
  static writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): void {
    try {
      const dir = path.dirname(filePath);
      this.createDirectory(dir);
      fs.writeFileSync(filePath, content, encoding);
      Logger.debug(`Wrote file: ${filePath}`);
    } catch (error) {
      Logger.error(`Failed to write file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Write buffer to file
   */
  static writeFileBuffer(filePath: string, buffer: Buffer): void {
    try {
      const dir = path.dirname(filePath);
      this.createDirectory(dir);
      fs.writeFileSync(filePath, buffer);
      Logger.debug(`Wrote file buffer: ${filePath}`);
    } catch (error) {
      Logger.error(`Failed to write file buffer: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Append to file
   */
  static appendFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): void {
    try {
      const dir = path.dirname(filePath);
      this.createDirectory(dir);
      fs.appendFileSync(filePath, content, encoding);
      Logger.debug(`Appended to file: ${filePath}`);
    } catch (error) {
      Logger.error(`Failed to append to file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Copy file
   */
  static copyFile(source: string, destination: string): void {
    try {
      const dir = path.dirname(destination);
      this.createDirectory(dir);
      fs.copyFileSync(source, destination);
      Logger.debug(`Copied file from ${source} to ${destination}`);
    } catch (error) {
      Logger.error(`Failed to copy file: ${source}`, error as Error);
      throw error;
    }
  }

  /**
   * Move/rename file
   */
  static moveFile(source: string, destination: string): void {
    try {
      const dir = path.dirname(destination);
      this.createDirectory(dir);
      fs.renameSync(source, destination);
      Logger.debug(`Moved file from ${source} to ${destination}`);
    } catch (error) {
      Logger.error(`Failed to move file: ${source}`, error as Error);
      throw error;
    }
  }

  /**
   * Get file info
   */
  static getFileInfo(filePath: string): FileInfo {
    try {
      const stats = fs.statSync(filePath);
      const parsed = path.parse(filePath);

      return {
        name: parsed.base,
        path: filePath,
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        extension: parsed.ext,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      Logger.error(`Failed to get file info: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Get file size in bytes
   */
  static getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      Logger.error(`Failed to get file size: ${filePath}`, error as Error);
      return 0;
    }
  }

  /**
   * Get file extension
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  /**
   * Get filename without extension
   */
  static getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * List directory contents
   */
  static listDirectory(dirPath: string): DirectoryContents {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const files: FileInfo[] = [];
      const directories: FileInfo[] = [];
      let totalSize = 0;

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const info = this.getFileInfo(fullPath);

        if (entry.isDirectory()) {
          directories.push(info);
        } else {
          files.push(info);
          totalSize += info.size;
        }
      }

      return { files, directories, totalSize };
    } catch (error) {
      Logger.error(`Failed to list directory: ${dirPath}`, error as Error);
      throw error;
    }
  }

  /**
   * Find files by pattern (simple glob-like matching)
   */
  static findFiles(dirPath: string, pattern: string, recursive: boolean = true): string[] {
    const results: string[] = [];
    const regex = this.patternToRegex(pattern);

    const search = (currentDir: string): void => {
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory() && recursive) {
            search(fullPath);
          } else if (entry.isFile() && regex.test(entry.name)) {
            results.push(fullPath);
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };

    search(dirPath);
    return results;
  }

  /**
   * Convert simple pattern to regex
   */
  private static patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`, 'i');
  }

  /**
   * Read JSON file
   */
  static readJson<T>(filePath: string): T {
    try {
      const content = this.readFile(filePath);
      return JSON.parse(content) as T;
    } catch (error) {
      Logger.error(`Failed to read JSON file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Write JSON file
   */
  static writeJson<T>(filePath: string, data: T, pretty: boolean = true): void {
    try {
      const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
      this.writeFile(filePath, content);
    } catch (error) {
      Logger.error(`Failed to write JSON file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Read YAML file (basic parser for simple YAML)
   */
  static readYaml<T>(filePath: string): T {
    try {
      const content = this.readFile(filePath);
      return this.parseYaml(content) as T;
    } catch (error) {
      Logger.error(`Failed to read YAML file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Basic YAML parser for simple structures
   * For complex YAML, consider using js-yaml package
   */
  private static parseYaml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: result }];

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (!match) continue;

      const indent = match[1].length;
      const key = match[2].trim();
      let value: unknown = match[3].trim();

      // Parse value type
      if (value === '' || value === '~' || value === 'null') {
        value = null;
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (/^-?\d+$/.test(value as string)) {
        value = parseInt(value as string, 10);
      } else if (/^-?\d+\.\d+$/.test(value as string)) {
        value = parseFloat(value as string);
      } else if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
        value = (value as string).slice(1, -1);
      } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
        value = (value as string).slice(1, -1);
      }

      // Find parent based on indentation
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      if (value === null || value === '') {
        // This key has nested content
        const newObj: Record<string, unknown> = {};
        parent[key] = newObj;
        stack.push({ indent, obj: newObj });
      } else {
        parent[key] = value;
      }
    }

    return result;
  }

  /**
   * Write YAML file (basic serializer)
   */
  static writeYaml<T extends Record<string, unknown>>(filePath: string, data: T): void {
    try {
      const content = this.serializeYaml(data);
      this.writeFile(filePath, content);
    } catch (error) {
      Logger.error(`Failed to write YAML file: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Basic YAML serializer
   */
  private static serializeYaml(data: Record<string, unknown>, indent: number = 0): string {
    const lines: string[] = [];
    const prefix = '  '.repeat(indent);

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        lines.push(`${prefix}${key}: ~`);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        lines.push(`${prefix}${key}:`);
        lines.push(this.serializeYaml(value as Record<string, unknown>, indent + 1));
      } else if (Array.isArray(value)) {
        lines.push(`${prefix}${key}:`);
        for (const item of value) {
          if (typeof item === 'object') {
            lines.push(`${prefix}  -`);
            lines.push(this.serializeYaml(item as Record<string, unknown>, indent + 2));
          } else {
            lines.push(`${prefix}  - ${item}`);
          }
        }
      } else if (typeof value === 'string') {
        lines.push(`${prefix}${key}: "${value}"`);
      } else {
        lines.push(`${prefix}${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Calculate directory size recursively
   */
  static getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    const calculate = (currentDir: string): void => {
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);

          if (entry.isDirectory()) {
            calculate(fullPath);
          } else {
            totalSize += fs.statSync(fullPath).size;
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };

    calculate(dirPath);
    return totalSize;
  }

  /**
   * Clean directory (remove all files but keep directory)
   */
  static cleanDirectory(dirPath: string): void {
    try {
      if (this.exists(dirPath)) {
        const entries = fs.readdirSync(dirPath);
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry);
          if (this.isDirectory(fullPath)) {
            this.deleteDirectory(fullPath);
          } else {
            this.deleteFile(fullPath);
          }
        }
        Logger.debug(`Cleaned directory: ${dirPath}`);
      }
    } catch (error) {
      Logger.error(`Failed to clean directory: ${dirPath}`, error as Error);
      throw error;
    }
  }

  /**
   * Create temporary file
   */
  static createTempFile(prefix: string = 'temp', extension: string = '.tmp'): string {
    const tempDir = path.join(process.cwd(), 'temp');
    this.createDirectory(tempDir);

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}${extension}`;
    const filePath = path.join(tempDir, filename);

    this.writeFile(filePath, '');
    return filePath;
  }

  /**
   * Ensure directory exists for file path
   */
  static ensureDirectoryForFile(filePath: string): void {
    const dir = path.dirname(filePath);
    this.createDirectory(dir);
  }

  /**
   * Watch file for changes
   */
  static watchFile(filePath: string, callback: (eventType: string) => void): fs.FSWatcher {
    return fs.watch(filePath, (eventType) => {
      callback(eventType);
    });
  }

  /**
   * Get relative path
   */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Resolve path
   */
  static resolvePath(...paths: string[]): string {
    return path.resolve(...paths);
  }

  /**
   * Join path segments
   */
  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }
}
