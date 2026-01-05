# Docker Directory

This directory contains Docker configuration files for containerized test execution.

## Files

- `Dockerfile` - Main Docker image for test runner
- `docker-compose.yml` - Multi-container setup with Appium

## Usage

```bash
# Build the Docker image
docker build -t mobile-automation -f docker/Dockerfile .

# Run tests in Docker
docker-compose up --build

# Run with specific configuration
docker-compose -f docker/docker-compose.yml up
```

## Notes

- Ensure Docker and Docker Compose are installed
- Appium server runs as a separate container
- Reports are mounted to host for access
