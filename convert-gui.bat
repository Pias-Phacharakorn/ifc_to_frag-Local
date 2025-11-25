@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║       IFC to Fragment Converter - GUI Mode                ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Instructions:
echo    1. A file dialog will open
echo    2. Select one or more IFC files (Ctrl+Click for multiple)
echo    3. Files will be converted to .frag in the same folder
echo.
echo Press any key to continue...
pause >nul

node gui-converter.js

echo.
pause