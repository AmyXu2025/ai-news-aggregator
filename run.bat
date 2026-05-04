@echo off
cd /d "%~dp0"
echo ====================================
echo    AI新闻聚合工具
echo ====================================
echo.
npx tsx src/index.ts
pause