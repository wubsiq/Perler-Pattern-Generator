@echo off
chcp 65001 >nul
echo ========================================
echo    🧪 豆师傅 - 模块测试启动器
echo ========================================
echo.
echo 正在打开模块测试页面...
echo.
echo 测试指南请查看: TESTING-GUIDE.md
echo.
echo ========================================
echo.

REM 尝试使用 Python 启动服务器
where python >nul 2>nul
if %errorlevel% == 0 (
    echo 使用 Python 启动服务器...
    start "模块测试服务器" cmd /k "python -m http.server 8000"
    timeout /t 2 >nul
    start http://localhost:8000/test-modules.html
    goto end
)

REM 尝试使用 Node.js
where node >nul 2>nul
if %errorlevel% == 0 (
    echo 使用 Node.js 启动服务器...
    start "模块测试服务器" cmd /k "npx http-server -p 8000"
    timeout /t 3 >nul
    start http://localhost:8000/test-modules.html
    goto end
)

REM 如果没有服务器，直接打开文件
echo 未找到 Python 或 Node.js，直接打开文件...
start test-modules.html
echo.
echo 提示: 部分功能需要本地服务器才能正常工作

:end
echo.
echo 按任意键退出...
pause >nul
