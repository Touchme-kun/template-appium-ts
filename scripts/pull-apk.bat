@echo off
setlocal enabledelayedexpansion

:: APK Puller Script
:: Usage: pull-apk.bat [package-name] [output-filename]
:: Compatible with both CMD and PowerShell

echo ========================================
echo     Android APK Puller via ADB
echo ========================================
echo.

:: Check if ADB is available
where adb >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ADB not found in PATH!
    echo Please ensure Android SDK platform-tools is installed and added to PATH.
    pause
    exit /b 1
)

:: Check if device is connected
adb devices | findstr /r "device$" >nul
if %errorlevel% neq 0 (
    echo [ERROR] No Android device connected!
    echo Please connect a device and enable USB debugging.
    pause
    exit /b 1
)

:: Get package name
if "%~1"=="" (
    echo Do you want to:
    echo   1. Enter package name directly
    echo   2. List installed apps first
    echo.
    set /p CHOICE="Enter your choice (1 or 2): "
    
    if "!CHOICE!"=="2" (
        echo.
        echo ========================================
        echo   Listing Installed Applications
        echo ========================================
        echo.
        echo Choose filter:
        echo   1. All packages
        echo   2. Third-party apps only (recommended)
        echo   3. System apps only
        echo   4. Search by keyword
        echo.
        set /p FILTER="Enter choice (1-4): "
        echo.
        
        set LIST_TEMP=%TEMP%\pkg_list_%RANDOM%.txt
        
        if "!FILTER!"=="1" (
            echo [Listing all packages...]
            echo.
            adb shell pm list packages > "!LIST_TEMP!"
            type "!LIST_TEMP!" | sort
        ) else if "!FILTER!"=="2" (
            echo [Listing third-party apps only...]
            echo.
            adb shell pm list packages -3 > "!LIST_TEMP!"
            type "!LIST_TEMP!" | sort
        ) else if "!FILTER!"=="3" (
            echo [Listing system apps only...]
            echo.
            adb shell pm list packages -s > "!LIST_TEMP!"
            type "!LIST_TEMP!" | sort
        ) else if "!FILTER!"=="4" (
            set /p KEYWORD="Enter search keyword: "
            echo.
            echo [Searching for: !KEYWORD!]
            echo.
            adb shell pm list packages > "!LIST_TEMP!"
            type "!LIST_TEMP!" | findstr /i "!KEYWORD!" | sort
        ) else (
            echo [Invalid choice, listing third-party apps...]
            echo.
            adb shell pm list packages -3 > "!LIST_TEMP!"
            type "!LIST_TEMP!" | sort
        )
        
        del "!LIST_TEMP!" >nul 2>nul
        
        echo.
        echo ========================================
        echo.
    )
    
    set /p PACKAGE_NAME="Enter package name (e.g., com.example.app): "
) else (
    set PACKAGE_NAME=%~1
)

if "!PACKAGE_NAME!"=="" (
    echo [ERROR] Package name cannot be empty!
    pause
    exit /b 1
)

:: Validate package name format (basic validation to prevent injection)
echo !PACKAGE_NAME! | findstr /r "^[a-zA-Z][a-zA-Z0-9_]*\(\.[a-zA-Z][a-zA-Z0-9_]*\)*$" >nul
if errorlevel 1 (
    echo [ERROR] Invalid package name format!
    echo Package names should follow the pattern: com.example.app
    echo Only letters, numbers, dots, and underscores are allowed.
    pause
    exit /b 1
)

:: Additional security: check for dangerous characters
echo !PACKAGE_NAME! | findstr /r "[;&|<>()^\"']" >nul
if not errorlevel 1 (
    echo [ERROR] Package name contains forbidden characters!
    echo Dangerous characters detected: ^& ; ^| ^< ^> ^( ^) ^^ " '
    pause
    exit /b 1
)

echo.
echo [INFO] Searching for package: !PACKAGE_NAME!
echo.

:: Show the command being executed
echo [CMD] adb shell pm path !PACKAGE_NAME!
echo.

:: Get APK path from device and save to temp file (use unique name to prevent race conditions)
set TEMP_FILE=%TEMP%\apk_path_%RANDOM%_%TIME:~-2%.txt
adb shell pm path !PACKAGE_NAME! > "!TEMP_FILE!" 2>nul

:: Read all APK paths from temp file (handles split APKs)
set APK_COUNT=0
set APK_PATHS=
for /f "usebackq delims=" %%a in ("!TEMP_FILE!") do (
    set /a APK_COUNT+=1
    if !APK_COUNT! equ 1 (
        set APK_PATHS=%%a
    ) else (
        set APK_PATHS=!APK_PATHS!;%%a
    )
    echo %%a
)

:: Delete temp file
del "!TEMP_FILE!" >nul 2>nul

:: Get first APK path for pulling
set APK_PATH=
for /f "tokens=1 delims=;" %%a in ("!APK_PATHS!") do set APK_PATH=%%a

:: Check if package was found
if "!APK_PATH!"=="" (
    echo [ERROR] Package not found on device!
    echo.
    echo Make sure:
    echo  - The app is installed on the device
    echo  - The package name is correct
    echo.
    echo Tip: Use 'adb shell pm list packages ^| findstr [keyword]' to search for packages
    pause
    exit /b 1
)

:: Warn if split APKs detected
if !APK_COUNT! gtr 1 (
    echo [WARNING] Split APK detected ^(!APK_COUNT! files^)
    echo Only the base APK will be pulled. For complete app, use 'adb pull' for each file.
    echo.
)

:: Remove 'package:' prefix and trim whitespace/control characters
set APK_PATH=!APK_PATH:package:=!
for /f "tokens=*" %%a in ("!APK_PATH!") do set APK_PATH=%%a

echo.
echo [SUCCESS] Found APK at: !APK_PATH!
echo.

:: Determine output filename
if "%~2"=="" (
    :: Extract last part of package name using batch (safer than PowerShell)
    set TEMP_PKG=!PACKAGE_NAME!
    :EXTRACT_LOOP
    echo !TEMP_PKG! | findstr "[.]" >nul
    if not errorlevel 1 (
        for /f "tokens=1* delims=." %%a in ("!TEMP_PKG!") do set TEMP_PKG=%%b
        goto EXTRACT_LOOP
    )
    set OUTPUT_FILE=!TEMP_PKG!.apk
) else (
    set OUTPUT_FILE=%~2
    :: Add .apk extension if not present
    echo !OUTPUT_FILE! | findstr /i "\.apk$" >nul
    if errorlevel 1 set OUTPUT_FILE=!OUTPUT_FILE!.apk
)

:: Validate output filename (prevent path traversal)
echo !OUTPUT_FILE! | findstr /r "\.\." >nul
if not errorlevel 1 (
    echo [ERROR] Output filename contains path traversal! ^(..^)
    echo Please use a simple filename without directory navigation.
    pause
    exit /b 1
)

echo !OUTPUT_FILE! | findstr /r "^[A-Za-z]:" >nul
if not errorlevel 1 (
    echo [ERROR] Absolute paths are not allowed for security reasons!
    echo Please use a relative filename only.
    pause
    exit /b 1
)

echo !OUTPUT_FILE! | findstr /r "[\\/:*?\"<>|]" >nul
if not errorlevel 1 (
    :: Remove the forward slash from check since it might be in path
    echo !OUTPUT_FILE! | findstr /r "[:*?\"<>|]" >nul
    if not errorlevel 1 (
        echo [ERROR] Output filename contains invalid characters!
        echo Forbidden: : * ? " ^< ^> ^
        pause
        exit /b 1
    )
)

:: Pull the APK
echo [INFO] Pulling APK to: !OUTPUT_FILE!
echo.
adb pull "!APK_PATH!" "!OUTPUT_FILE!"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo [SUCCESS] APK pulled successfully!
    echo Output: !OUTPUT_FILE!
    echo ========================================
    
    :: Get file size
    if exist "!OUTPUT_FILE!" (
        for %%A in ("!OUTPUT_FILE!") do set FILE_SIZE=%%~zA
        set /a FILE_SIZE_MB=!FILE_SIZE! / 1048576
        echo File size: !FILE_SIZE_MB! MB
    )
) else (
    echo.
    echo [ERROR] Failed to pull APK!
)

echo.
pause
exit /b %errorlevel%