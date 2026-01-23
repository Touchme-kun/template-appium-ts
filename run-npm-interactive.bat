@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Change to the directory of this script (project root)
cd /d "%~dp0"

REM Run the interactive npm script selector
npm run npm:interactive %*

endlocal
