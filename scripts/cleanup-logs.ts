/**
 * Log Cleanup and Archive Utility
 * Manages log lifecycle: archives old logs, maintains retention policy
 *
 * Usage:
 *   ts-node scripts/cleanup-logs.ts [command]
 *
 * Commands:
 *   archive     - Archive logs older than retention days
 *   clean       - Remove archived logs older than archive retention
 *   report      - Show log statistics and sizes
 *   all         - Run archive + clean + report (default)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../src/utils/Logger';

// Configuration
const LOGS_DIR = path.resolve(process.cwd(), 'logs');
const ARCHIVE_DIR = path.join(LOGS_DIR, 'archive');
const RUNS_DIR = path.join(LOGS_DIR, 'runs');

// Retention policies (in days)
const ACTIVE_RETENTION_DAYS = 30; // Keep active logs for 30 days
const ARCHIVE_RETENTION_DAYS = 90; // Keep archives for 90 days
const MAX_LOG_SIZE_MB = 10; // Max size before archiving individual logs

/**
 * Ensure archive directory exists
 */
function ensureArchiveDir(): void {
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    Logger.info(`Created archive directory: ${ARCHIVE_DIR}`);
  }
}

/**
 * Get file age in days
 */
function getFileAgeDays(filePath: string): number {
  const stats = fs.statSync(filePath);
  const now = new Date();
  const fileDate = new Date(stats.mtime);
  const ageMs = now.getTime() - fileDate.getTime();
  return Math.floor(ageMs / (1000 * 60 * 60 * 24));
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}

/**
 * Archive old log files
 */
function archiveLogs(): void {
  Logger.info('Starting log archival...');
  ensureArchiveDir();

  const now = new Date();
  const archiveTimestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
  let archivedCount = 0;
  let totalArchivedSize = 0;

  // Archive logs from runs directory
  if (fs.existsSync(RUNS_DIR)) {
    const runFiles = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.log'));

    runFiles.forEach((file) => {
      const filePath = path.join(RUNS_DIR, file);
      const ageDays = getFileAgeDays(filePath);

      if (ageDays > ACTIVE_RETENTION_DAYS) {
        try {
          const archivePath = path.join(ARCHIVE_DIR, `${archiveTimestamp}-${file}`);
          fs.copyFileSync(filePath, archivePath);
          fs.unlinkSync(filePath);

          const sizeMB = getFileSizeMB(archivePath);
          totalArchivedSize += sizeMB;
          archivedCount++;

          Logger.debug(`Archived: ${file} (${ageDays} days old, ${sizeMB.toFixed(2)} MB)`);
        } catch (error) {
          Logger.error(`Failed to archive ${file}`, error as Error);
        }
      }
    });
  }

  // Archive main log files if they exceed size
  const mainLogFiles = ['test-execution.log', 'error.log'];
  mainLogFiles.forEach((logFile) => {
    const filePath = path.join(LOGS_DIR, logFile);
    if (fs.existsSync(filePath)) {
      const sizeMB = getFileSizeMB(filePath);

      if (sizeMB > MAX_LOG_SIZE_MB) {
        try {
          const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
          const archivePath = path.join(ARCHIVE_DIR, `${timestamp}-${logFile}.backup`);
          fs.copyFileSync(filePath, archivePath);
          // Reset the original log file
          fs.writeFileSync(filePath, '');

          totalArchivedSize += sizeMB;
          archivedCount++;

          Logger.debug(`Archived: ${logFile} (${sizeMB.toFixed(2)} MB)`);
        } catch (error) {
          Logger.error(`Failed to archive ${logFile}`, error as Error);
        }
      }
    }
  });

  Logger.info(`Archival complete: ${archivedCount} files archived (${totalArchivedSize.toFixed(2)} MB)`);
}

/**
 * Clean old archived logs
 */
function cleanArchives(): void {
  Logger.info('Starting archive cleanup...');

  if (!fs.existsSync(ARCHIVE_DIR)) {
    Logger.info('No archive directory found');
    return;
  }

  let deletedCount = 0;
  let deletedSize = 0;

  const archiveFiles = fs.readdirSync(ARCHIVE_DIR);

  archiveFiles.forEach((file) => {
    const filePath = path.join(ARCHIVE_DIR, file);
    const ageDays = getFileAgeDays(filePath);

    if (ageDays > ARCHIVE_RETENTION_DAYS) {
      try {
        const sizeMB = getFileSizeMB(filePath);
        fs.unlinkSync(filePath);
        deletedSize += sizeMB;
        deletedCount++;

        Logger.debug(`Deleted old archive: ${file} (${ageDays} days old)`);
      } catch (error) {
        Logger.error(`Failed to delete ${file}`, error as Error);
      }
    }
  });

  Logger.info(`Cleanup complete: ${deletedCount} archives deleted (freed ${deletedSize.toFixed(2)} MB)`);
}

/**
 * Report on log statistics
 */
function reportLogs(): void {
  Logger.info('=== Log Statistics ===');

  // Active logs
  if (fs.existsSync(LOGS_DIR)) {
    const mainLogFiles = fs.readdirSync(LOGS_DIR).filter((f) => f.endsWith('.log') && f !== 'runs');
    let activeSize = 0;

    mainLogFiles.forEach((file) => {
      const filePath = path.join(LOGS_DIR, file);
      const sizeMB = getFileSizeMB(filePath);
      activeSize += sizeMB;
      Logger.info(`  ${file}: ${sizeMB.toFixed(2)} MB`);
    });

    Logger.info(`Active logs total: ${activeSize.toFixed(2)} MB`);
  }

  // Run logs
  if (fs.existsSync(RUNS_DIR)) {
    const runFiles = fs.readdirSync(RUNS_DIR);
    let runSize = 0;
    let oldRunCount = 0;

    runFiles.forEach((file) => {
      const filePath = path.join(RUNS_DIR, file);
      const sizeMB = getFileSizeMB(filePath);
      const ageDays = getFileAgeDays(filePath);

      runSize += sizeMB;

      if (ageDays > ACTIVE_RETENTION_DAYS) {
        oldRunCount++;
      }
    });

    Logger.info(`Run logs: ${runFiles.length} files, ${runSize.toFixed(2)} MB (${oldRunCount} older than ${ACTIVE_RETENTION_DAYS} days)`);
  }

  // Archives
  if (fs.existsSync(ARCHIVE_DIR)) {
    const archiveFiles = fs.readdirSync(ARCHIVE_DIR);
    let archiveSize = 0;
    let oldArchiveCount = 0;

    archiveFiles.forEach((file) => {
      const filePath = path.join(ARCHIVE_DIR, file);
      const sizeMB = getFileSizeMB(filePath);
      const ageDays = getFileAgeDays(filePath);

      archiveSize += sizeMB;

      if (ageDays > ARCHIVE_RETENTION_DAYS) {
        oldArchiveCount++;
      }
    });

    Logger.info(`Archives: ${archiveFiles.length} files, ${archiveSize.toFixed(2)} MB (${oldArchiveCount} eligible for deletion)`);
  }

  Logger.info('========================');
}

/**
 * Main execution
 */
function main(): void {
  const command = process.argv[2] || 'all';

  try {
    switch (command) {
      case 'archive':
        archiveLogs();
        break;
      case 'clean':
        cleanArchives();
        break;
      case 'report':
        reportLogs();
        break;
      case 'all':
        archiveLogs();
        cleanArchives();
        reportLogs();
        break;
      default:
        console.log('Unknown command:', command);
        console.log('Available commands: archive, clean, report, all');
        process.exit(1);
    }
  } catch (error) {
    Logger.error('Cleanup script failed', error as Error);
    process.exit(1);
  }
}

main();
