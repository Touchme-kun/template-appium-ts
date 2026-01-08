# Docker Multi-Environment Setup

This document explains how to run tests in different environments (QA, Pre-Prod, Production) using Docker.

## Environment Files

The framework supports three environments:

- **`.env.qa`** - QA environment configuration
- **`.env.preprod`** - Pre-production environment configuration
- **`.env.prod`** - Production environment configuration

Each environment file contains environment-specific settings:
- App paths and package names
- BrowserStack app IDs
- API endpoints
- Test credentials
- Logging levels

## Quick Start by Environment

### QA Environment

```bash
# Run all tests in QA
npm run docker:test:qa

# Run smoke tests in QA
npm run docker:smoke:qa

# Run regression tests in QA
npm run docker:regression:qa

# Production build with QA config
npm run docker:test:qa:prod
```

### Pre-Production Environment

```bash
# Run all tests in Pre-Prod
npm run docker:test:preprod

# Run smoke tests in Pre-Prod
npm run docker:smoke:preprod

# Run regression tests in Pre-Prod
npm run docker:regression:preprod

# Production build with Pre-Prod config
npm run docker:test:preprod:prod
```

### Production Environment

```bash
# Run all tests in Production
npm run docker:test:prod

# Run smoke tests in Production
npm run docker:smoke:prod

# Run regression tests in Production
npm run docker:regression:prod

# Production build with Prod config
npm run docker:test:prod:prod
```

## Environment Configuration

### Required Files Structure

```
apps/
├── android/
│   ├── app-qa.apk           # QA build
│   ├── app-preprod.apk      # Pre-prod build
│   └── app-release.apk      # Production build
└── ios/
    ├── app-qa.ipa           # QA build
    ├── app-preprod.ipa      # Pre-prod build
    └── app-release.ipa      # Production build
```

### Environment Variables to Update

#### .env.qa
```env
APP_PATH=/app/apps/android/app-qa.apk
ANDROID_APP_PACKAGE=com.mlhuillier.mlwallet.qa
BROWSERSTACK_APP_ID=bs://your-qa-app-id
API_BASE_URL=https://api-qa.mlhuillier.com
TEST_ENV=qa
LOG_LEVEL=debug
```

#### .env.preprod
```env
APP_PATH=/app/apps/android/app-preprod.apk
ANDROID_APP_PACKAGE=com.mlhuillier.mlwallet.preprod
BROWSERSTACK_APP_ID=bs://your-preprod-app-id
API_BASE_URL=https://api-preprod.mlhuillier.com
TEST_ENV=preprod
LOG_LEVEL=info
```

#### .env.prod
```env
APP_PATH=/app/apps/android/app-release.apk
ANDROID_APP_PACKAGE=com.mlhuillier.mlwallet
BROWSERSTACK_APP_ID=bs://16a118f9aee918d54a0b7b5c70d7d29c75037856
API_BASE_URL=https://api.mlhuillier.com
TEST_ENV=prod
LOG_LEVEL=warn
```

## Available Commands

### Common Docker Commands
```bash
# Build Docker images
npm run docker:build              # Development image
npm run docker:build:prod         # Production image

# Start/Stop services
npm run docker:up                 # Start all services
npm run docker:down               # Stop all services
npm run docker:appium             # Start only Appium

# Utilities
npm run docker:logs               # View logs
npm run docker:shell              # Interactive shell
npm run docker:clean              # Cleanup
npm run docker:allure             # Start Allure server
```

### Environment-Specific Tests

| Command | Description |
|---------|-------------|
| `npm run docker:test:qa` | Run all tests in QA environment |
| `npm run docker:test:preprod` | Run all tests in Pre-Prod environment |
| `npm run docker:test:prod` | Run all tests in Production environment |
| `npm run docker:smoke:qa` | Run smoke tests in QA |
| `npm run docker:smoke:preprod` | Run smoke tests in Pre-Prod |
| `npm run docker:smoke:prod` | Run smoke tests in Production |
| `npm run docker:regression:qa` | Run regression tests in QA |
| `npm run docker:regression:preprod` | Run regression tests in Pre-Prod |
| `npm run docker:regression:prod` | Run regression tests in Production |

### Production Builds (Optimized Images)

| Command | Description |
|---------|-------------|
| `npm run docker:test:qa:prod` | QA tests with production build |
| `npm run docker:test:preprod:prod` | Pre-Prod tests with production build |
| `npm run docker:test:prod:prod` | Production tests with production build |

## Advanced Usage

### Running Custom Commands in Specific Environments

```bash
# Run specific feature file in QA
docker-compose -f docker/docker-compose.yml --env-file .env.qa run --rm test-runner \
  npm run test:cucumber -- --spec tests/features/login.feature

# Run with custom tags in Pre-Prod
docker-compose -f docker/docker-compose.yml --env-file .env.preprod run --rm test-runner \
  cross-env CUCUMBER_TAGS=@P1 npm run test:cucumber

# BrowserStack tests with environment config
docker-compose -f docker/docker-compose.yml --env-file .env.qa run --rm test-runner \
  npm run test:cucumber:android:browserstack
```

### Overriding Environment Variables

```bash
# Override platform in QA environment
docker-compose -f docker/docker-compose.yml --env-file .env.qa run --rm \
  -e PLATFORM=ios \
  -e DEVICE_NAME="iPhone 14" \
  test-runner npm run test:cucumber:smoke
```

### Parallel Execution Across Environments

```bash
# Terminal 1 - QA
npm run docker:smoke:qa

# Terminal 2 - Pre-Prod
npm run docker:smoke:preprod

# Terminal 3 - Production
npm run docker:smoke:prod
```

## CI/CD Integration

### GitHub Actions with Multi-Environment

```yaml
jobs:
  test-qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run QA Tests
        run: npm run docker:test:qa:prod
      
  test-preprod:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Pre-Prod Tests
        run: npm run docker:test:preprod:prod
        
  test-prod:
    runs-on: ubuntu-latest
    needs: [test-qa, test-preprod]
    steps:
      - uses: actions/checkout@v4
      - name: Run Production Tests
        run: npm run docker:test:prod:prod
```

## Troubleshooting

### Wrong App Being Tested

Ensure the correct APK/IPA is in the `apps/` directory and the path matches the environment file:
```bash
# Check QA app exists
ls -la apps/android/app-qa.apk

# Verify .env.qa has correct path
grep APP_PATH .env.qa
```

### BrowserStack App ID Mismatch

Each environment needs its own BrowserStack app upload:
```bash
# Upload QA build to BrowserStack
curl -u "$BROWSERSTACK_USER:$BROWSERSTACK_KEY" \
  -X POST https://api-cloud.browserstack.com/app-automate/upload \
  -F "file=@apps/android/app-qa.apk"

# Update .env.qa with the returned app_url (bs://...)
```

### Environment Not Loading

Verify the env file is being used:
```bash
# Add debug output to see loaded env
docker-compose -f docker/docker-compose.yml --env-file .env.qa run --rm test-runner \
  sh -c 'echo "TEST_ENV=$TEST_ENV" && echo "APP_PATH=$APP_PATH"'
```

## Best Practices

1. **Never commit environment files with real credentials** - Add to `.gitignore`
2. **Use different app builds per environment** - QA, Pre-Prod, Prod
3. **Run smoke tests in each environment** before regression
4. **Use production Docker builds in CI/CD** for faster execution
5. **Keep BrowserStack app IDs updated** when uploading new builds
6. **Start with QA, promote to Pre-Prod, then Production**

## Security Notes

Create `.env.*.local` files for local development with sensitive data:
```bash
.env.qa.local       # Local QA credentials (gitignored)
.env.preprod.local  # Local Pre-Prod credentials (gitignored)
.env.prod.local     # Local Prod credentials (gitignored)
```

Update `.gitignore`:
```
.env*.local
!.env.example
```
