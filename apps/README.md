# Mobile Apps Directory

This directory contains the mobile application files for testing.

## Structure

```
apps/
├── android/
│   ├── app-debug.apk      # Debug build for local testing
│   └── app-release.apk    # Release build for BrowserStack
└── ios/
    ├── App.app/           # Simulator build
    └── App.ipa            # Real device build
```

## Obtaining App Files

### Android
1. Get the APK from your CI/CD pipeline or development team
2. Place the APK file in the `android/` directory
3. Update the path in `.env` file or environment variables

### iOS
1. For simulator testing: Use `.app` bundle
2. For real device testing: Use `.ipa` file (properly signed)
3. Place files in the `ios/` directory

## BrowserStack

When running on BrowserStack, the app is uploaded automatically using the path specified in:
- `BROWSERSTACK_APP_PATH` for Android
- Or manually uploaded and using `BROWSERSTACK_APP_ID`

## Notes

- APK/IPA files are git-ignored by default
- For CI/CD, download apps from artifact storage before running tests
- Ensure apps are compatible with test automation (accessibility IDs enabled)
