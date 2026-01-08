/**
 * Cucumber Hooks
 * Setup and teardown for BDD tests with enhanced reporting
 */

import { Before, After, BeforeAll, AfterAll, BeforeStep, AfterStep, Status } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';
import { Logger } from '../../../src/utils/Logger';
import { AllureReporter } from '../../../src/utils/AllureReporter';
import { DeviceLogsHelper } from '../../../src/utils/DeviceLogsHelper';

// ===========================================
// Global Hooks (run once per test run)
// ===========================================

BeforeAll(async () => {
  Logger.info('========================================');
  Logger.info('Starting BDD Test Suite');
  Logger.info(`Run ID: ${Logger.getRunId()}`);
  Logger.info('========================================');

  // Initialize Allure
  AllureReporter.initialize();

  // Add environment info to Allure
  AllureReporter.addEnvironmentInfo({
    Framework: 'Cucumber BDD',
    Platform: ((browser.capabilities as Record<string, unknown>).platformName as string) || 'Unknown',
    Environment: process.env.TEST_ENV || 'development',
    'Run ID': Logger.getRunId(),
  });

  // Write environment properties file
  await AllureReporter.writeEnvironmentProperties();
});

AfterAll(async () => {
  // Log performance summary
  Logger.logPerformanceSummary();

  // Attach full run logs
  const runLogs = Logger.getCurrentRunLogs();
  if (runLogs) {
    AllureReporter.addAttachment('Full BDD Run Logs', runLogs, 'text/plain');
  }

  Logger.info('========================================');
  Logger.info('BDD Test Suite Complete');
  Logger.info('========================================');
});

// ===========================================
// Scenario Hooks (run for each scenario)
// ===========================================

Before(async function (scenario) {
  const scenarioName = scenario.pickle.name;
  const featureName = scenario.gherkinDocument.feature?.name || 'Unknown Feature';
  const tags = scenario.pickle.tags.map((tag) => tag.name).join(', ');

  Logger.info(`\n--- Starting Scenario: ${scenarioName} ---`);
  Logger.info(`Feature: ${featureName}`);
  Logger.info(`Tags: ${tags || 'None'}`);

  // Set context for logging
  Logger.setTestContext(scenarioName);

  // Mark start time for performance tracking
  AllureReporter.markTestStart();

  // Add to Allure
  AllureReporter.addFeature(featureName);
  AllureReporter.addStory(scenarioName);

  // Add severity based on tags
  if (tags.includes('@P1') || tags.includes('@critical')) {
    AllureReporter.addSeverity('critical');
  } else if (tags.includes('@P2') || tags.includes('@high')) {
    AllureReporter.addSeverity('normal');
  } else if (tags.includes('@P3') || tags.includes('@low')) {
    AllureReporter.addSeverity('minor');
  }

  // Extract and add issue links from tags
  const issueMatches = tags.match(/@(JIRA|BUG|ISSUE)-\w+-\d+/g);
  if (issueMatches) {
    issueMatches.forEach((issue) => {
      AllureReporter.addIssue(issue.replace('@', ''));
    });
  }

  // Store scenario info for later use
  this.scenarioName = scenarioName;
  this.featureName = featureName;
  this.startTime = Date.now();

  // Clear device logs to start fresh
  await DeviceLogsHelper.clearLogs();
});

Before({ tags: '@skip' }, async function () {
  Logger.info('Skipping scenario with @skip tag');
  return 'skipped';
});

Before({ tags: '@wip' }, async function () {
  Logger.warn('Running Work-In-Progress scenario');
  AllureReporter.addLabel('status', 'WIP');
});

After(async function (scenario) {
  const duration = Date.now() - (this.startTime || Date.now());
  const status = scenario.result?.status;

  Logger.info(`Scenario "${this.scenarioName}" completed in ${duration}ms`);
  Logger.info(`Status: ${status}`);

  // Add execution time to Allure
  AllureReporter.addExecutionTime();
  AllureReporter.addPerformanceMetric('Scenario Duration', duration);

  // Capture screenshot on failure
  if (status === Status.FAILED) {
    Logger.error(`Scenario FAILED: ${this.scenarioName}`);

    try {
      // Capture screenshot
      await AllureReporter.captureScreenshot(`${this.scenarioName}_failure`);

      // Capture page source for debugging
      await AllureReporter.addPageSource('Page Source on Failure');

      // Capture device logs
      await DeviceLogsHelper.captureAndAttach('Device Logs on Failure');
      await DeviceLogsHelper.captureErrorLogs('Error Logs');

      // Add failure categorization if error is available
      const error = scenario.result?.exception;
      if (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        const category = AllureReporter.categorizeFailure(errorObj);
        AllureReporter.addFailureAnalysis(errorObj, category);
      }
    } catch (error) {
      Logger.error('Failed to capture failure artifacts', error as Error);
    }
  } else if (status === Status.PASSED) {
    // Optionally capture logs on success for debugging purposes
    if (process.env.CAPTURE_LOGS_ON_SUCCESS === 'true') {
      await DeviceLogsHelper.captureAndAttach('Device Logs');
    }
  }

  // Log scenario summary
  Logger.info(`--- Scenario Complete: ${this.scenarioName} ---\n`);
  Logger.performance('Scenario Execution', duration);
});

// ===========================================
// Step Hooks (run for each step)
// ===========================================

BeforeStep(async function (step) {
  const stepText = step.pickleStep.text;
  Logger.debug(`Step: ${stepText}`);
  Logger.setStepContext(stepText);
  AllureReporter.startStep(stepText);
  Logger.startTimer(`step_${stepText}`);
});

AfterStep(async function (step) {
  const stepText = step.pickleStep.text;
  const status = step.result?.status;

  // Stop timer and log step duration
  const duration = Logger.stopTimer(`step_${stepText}`);

  if (status === Status.FAILED) {
    Logger.error(`Step FAILED: ${stepText}`);
    AllureReporter.endStep('failed');

    // Capture screenshot after failed step
    try {
      const timestamp = Date.now();
      await AllureReporter.captureScreenshot(`step_failure_${timestamp}`);
    } catch {
      // Ignore screenshot errors
    }
  } else if (status === Status.PASSED) {
    AllureReporter.endStep('passed');
    Logger.debug(`Step completed in ${duration}ms: ${stepText}`);
  } else if (status === Status.SKIPPED) {
    AllureReporter.endStep('skipped');
  } else {
    AllureReporter.endStep('broken');
  }
});

// ===========================================
// Tagged Hooks
// ===========================================

Before({ tags: '@login' }, async function () {
  Logger.info('Preparing login test environment');
  AllureReporter.addLabel('testType', 'login');
  // Reset app to login screen if needed
});

Before({ tags: '@authenticated' }, async function () {
  Logger.info('Setting up authenticated session');
  AllureReporter.addLabel('testType', 'authenticated');
  // TODO: Setup authenticated session via API or deep link
});

After({ tags: '@cleanup' }, async function () {
  Logger.info('Cleaning up test data');
  // TODO: Cleanup test data created during test
});

Before({ tags: '@slow' }, async function () {
  Logger.info('Increasing timeouts for slow scenario');
  AllureReporter.addLabel('performance', 'slow');
  await browser.setTimeout({ implicit: 30000 });
});

After({ tags: '@slow' }, async function () {
  Logger.info('Resetting timeouts after slow scenario');
  await browser.setTimeout({ implicit: 10000 });
});

// Performance-related hooks
Before({ tags: '@performance' }, async function () {
  Logger.info('Starting performance monitoring');
  Logger.startTimer('scenario_total');
});

After({ tags: '@performance' }, async function () {
  const duration = Logger.stopTimer('scenario_total');
  AllureReporter.addPerformanceMetric('Total Scenario Time', duration);
  Logger.info(`Performance scenario completed in ${duration}ms`);
});

// API setup hooks
Before({ tags: '@api-setup' }, async function () {
  Logger.info('Setting up test data via API');
  // TODO: Call API to setup test data
});

After({ tags: '@api-cleanup' }, async function () {
  Logger.info('Cleaning up test data via API');
  // TODO: Call API to cleanup test data
});
