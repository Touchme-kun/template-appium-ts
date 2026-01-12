#!/bin/bash

# APK Puller Script
# Usage: ./pull-apk.sh [package-name] [output-filename]
# Compatible with Linux, macOS, and WSL

set -e  # Exit on error

echo "========================================"
echo "    Android APK Puller via ADB"
echo "========================================"
echo ""

# Check if ADB is available (check both adb and adb.exe for Windows compatibility)
ADB_CMD=""
if command -v adb &> /dev/null; then
    ADB_CMD="adb"
elif command -v adb.exe &> /dev/null; then
    ADB_CMD="adb.exe"
else
    # Try to find adb in common Windows locations
    COMMON_PATHS=(
        "$LOCALAPPDATA/Android/Sdk/platform-tools/adb.exe"
        "$USERPROFILE/AppData/Local/Android/Sdk/platform-tools/adb.exe"
        "/c/Users/$USER/AppData/Local/Android/Sdk/platform-tools/adb.exe"
        "/c/Program Files/Android/android-sdk/platform-tools/adb.exe"
        "/mnt/c/Users/$USER/AppData/Local/Android/Sdk/platform-tools/adb.exe"
    )
    
    for path in "${COMMON_PATHS[@]}"; do
        if [ -f "$path" ]; then
            ADB_CMD="$path"
            break
        fi
    done
fi

if [ -z "$ADB_CMD" ]; then
    echo "[ERROR] ADB not found in PATH or common locations!"
    echo "Please ensure Android SDK platform-tools is installed and added to PATH."
    echo ""
    echo "Common locations checked:"
    echo " - %LOCALAPPDATA%/Android/Sdk/platform-tools/"
    echo " - C:/Program Files/Android/android-sdk/platform-tools/"
    exit 1
fi

echo "[INFO] Using ADB: $ADB_CMD"
echo ""

# Check if device is connected
DEVICE_LIST=$("$ADB_CMD" devices | tr -d '\r')
if ! echo "$DEVICE_LIST" | grep -qE "device$"; then
    echo "[ERROR] No Android device connected!"
    echo "Please connect a device and enable USB debugging."
    echo ""
    echo "Debug info - devices output:"
    echo "$DEVICE_LIST"
    exit 1
fi

# Get package name
if [ -z "$1" ]; then
    echo "Do you want to:"
    echo "  1. Enter package name directly"
    echo "  2. List installed apps first"
    echo ""
    read -p "Enter your choice (1 or 2): " CHOICE
    
    if [ "$CHOICE" = "2" ]; then
        echo ""
        echo "========================================"
        echo "  Listing Installed Applications"
        echo "========================================"
        echo ""
        echo "Choose filter:"
        echo "  1. All packages"
        echo "  2. Third-party apps only (recommended)"
        echo "  3. System apps only"
        echo "  4. Search by keyword"
        echo ""
        read -p "Enter choice (1-4): " FILTER
        echo ""
        
        case "$FILTER" in
            1)
                echo "[Listing all packages...]"
                echo ""
                "$ADB_CMD" shell pm list packages | sort
                ;;
            2)
                echo "[Listing third-party apps only...]"
                echo ""
                "$ADB_CMD" shell pm list packages -3 | sort
                ;;
            3)
                echo "[Listing system apps only...]"
                echo ""
                "$ADB_CMD" shell pm list packages -s | sort
                ;;
            4)
                read -p "Enter search keyword: " KEYWORD
                echo ""
                echo "[Searching for: $KEYWORD]"
                echo ""
                "$ADB_CMD" shell pm list packages | grep -i "$KEYWORD" | sort
                ;;
            *)
                echo "[Invalid choice, listing third-party apps...]"
                echo ""
                "$ADB_CMD" shell pm list packages -3 | sort
                ;;
        esac
        
        echo ""
        echo "========================================"
        echo ""
    fi
    
    read -p "Enter package name (e.g., com.example.app): " PACKAGE_NAME
else
    PACKAGE_NAME="$1"
fi

# Validate package name is not empty
if [ -z "$PACKAGE_NAME" ]; then
    echo "[ERROR] Package name cannot be empty!"
    exit 1
fi

# Validate package name format (basic validation to prevent injection)
if ! echo "$PACKAGE_NAME" | grep -qE '^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$'; then
    echo "[ERROR] Invalid package name format!"
    echo "Package names should follow the pattern: com.example.app"
    echo "Only letters, numbers, dots, and underscores are allowed."
    exit 1
fi

# Additional security: check for dangerous characters
if echo "$PACKAGE_NAME" | grep -qE '[;&|<>()$`"'\''\\]'; then
    echo "[ERROR] Package name contains forbidden characters!"
    echo "Dangerous characters detected: & ; | < > ( ) $ \` \" ' \\"
    exit 1
fi

echo ""
echo "[INFO] Searching for package: $PACKAGE_NAME"
echo ""

# Show the command being executed
echo "[CMD] $ADB_CMD shell pm path $PACKAGE_NAME"
echo ""

# Get APK paths from device
APK_PATHS=$("$ADB_CMD" shell pm path "$PACKAGE_NAME" 2>/dev/null)

# Check if package was found
if [ -z "$APK_PATHS" ]; then
    echo "[ERROR] Package not found on device!"
    echo ""
    echo "Make sure:"
    echo " - The app is installed on the device"
    echo " - The package name is correct"
    echo ""
    echo "Tip: Use 'adb shell pm list packages | grep [keyword]' to search for packages"
    exit 1
fi

# Count APK files and get first one
APK_COUNT=$(echo "$APK_PATHS" | wc -l | tr -d ' ')
APK_PATH=$(echo "$APK_PATHS" | head -n 1)

# Display all paths
echo "$APK_PATHS"
echo ""

# Warn if split APKs detected
if [ "$APK_COUNT" -gt 1 ]; then
    echo "[WARNING] Split APK detected ($APK_COUNT files)"
    echo "Only the base APK will be pulled. For complete app, use 'adb pull' for each file."
    echo ""
fi

# Remove 'package:' prefix and trim whitespace
APK_PATH=$(echo "$APK_PATH" | sed 's/^package://' | tr -d '\r' | xargs)

echo "[SUCCESS] Found APK at: $APK_PATH"
echo ""

# Determine output filename
if [ -z "$2" ]; then
    # Extract last part of package name
    OUTPUT_FILE=$(echo "$PACKAGE_NAME" | awk -F. '{print $NF}').apk
else
    OUTPUT_FILE="$2"
    # Add .apk extension if not present
    if ! echo "$OUTPUT_FILE" | grep -qiE '\.apk$'; then
        OUTPUT_FILE="${OUTPUT_FILE}.apk"
    fi
fi

# Validate output filename (prevent path traversal)
if echo "$OUTPUT_FILE" | grep -qE '\.\.'; then
    echo "[ERROR] Output filename contains path traversal! (..)"
    echo "Please use a simple filename without directory navigation."
    exit 1
fi

# Check for absolute paths
if [[ "$OUTPUT_FILE" = /* ]]; then
    echo "[ERROR] Absolute paths are not allowed for security reasons!"
    echo "Please use a relative filename only."
    exit 1
fi

# Validate filename characters
if echo "$OUTPUT_FILE" | grep -qE '[:*?"<>|]'; then
    echo "[ERROR] Output filename contains invalid characters!"
    echo "Forbidden: : * ? \" < > |"
    exit 1
fi

# Pull the APK
echo "[INFO] Pulling APK to: $OUTPUT_FILE"
echo ""
"$ADB_CMD" pull "$APK_PATH" "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "[SUCCESS] APK pulled successfully!"
    echo "Output: $OUTPUT_FILE"
    echo "========================================"
    
    # Get file size
    if [ -f "$OUTPUT_FILE" ]; then
        FILE_SIZE=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE" 2>/dev/null)
        FILE_SIZE_MB=$((FILE_SIZE / 1048576))
        echo "File size: ${FILE_SIZE_MB} MB"
    fi
else
    echo ""
    echo "[ERROR] Failed to pull APK!"
    exit 1
fi

echo ""
