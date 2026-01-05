# GitHub Workflows

This directory contains CI/CD pipeline configurations.

## Workflows

- `mobile-tests.yml` - Main test execution workflow
- `pr-validation.yml` - Pull request validation
- `scheduled-regression.yml` - Scheduled regression tests

## Triggers

- Push to `main` or `develop` branches
- Pull requests to `main`
- Scheduled runs (daily at 2 AM UTC)

## Required Secrets

Configure these secrets in GitHub repository settings:

- `BROWSERSTACK_USERNAME` - BrowserStack username
- `BROWSERSTACK_ACCESS_KEY` - BrowserStack access key
- `SLACK_WEBHOOK` - Slack notification webhook URL
