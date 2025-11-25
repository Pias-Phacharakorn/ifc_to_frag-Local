@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║          IFC Converter - First Time Setup                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📦 Installing dependencies...
echo.

call npm install

echo.
echo 📁 Creating folders...
if not exist "_Input-Ifc" mkdir "_Input-Ifc"
if not exist "_Output-frag" mkdir "_Output-frag"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    Setup Complete!                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✅ Ready to use!
echo.
echo 📝 How to use:
echo    1. Put your IFC files in the '_Input-Ifc' folder
echo    2. Double-click 'convert.bat' to convert all files
echo.
echo Press any key to exit...
pause >nul