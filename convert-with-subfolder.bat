@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║    IFC to Fragment Converter - Recursive Mode             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📂 Input folder:  _Input-Ifc (including subfolders)
echo 📂 Output folder: _Output-frag
echo.
echo 🔄 Starting conversion...
echo.

node cli.js folder "_Input-Ifc" -o "_Output-frag" -r

echo.
echo ✅ Done! Press any key to exit...
pause >nul