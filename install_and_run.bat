@echo off
:: High Density Textile Billing System - Single Installer and Run Script (Windows Native .bat)
title Textile Production & Billing Manager Installer
echo ==========================================================================
echo       TEXTILE PRODUCTION & BILLING MANAGER LOCAL INSTALLER (WINDOWS)
echo ==========================================================================
echo.

:: Verify Node.js runtime exists in search path
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [-] ERROR: Node.js was not detected on this machine.
    echo     Please download and install the standard installer from https://nodejs.org/
    echo     Then reopen this file after completing installation.
    echo.
    pause
    exit /b 1
)

echo [+] Node.js engine detected.
echo [+] Step 1 of 2: Installing local application package dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [-] ERROR: Dependency installation failed. Please check internet connection block.
    pause
    exit /b 1
)

echo [+] Step 2 of 2: Booting database engine and local application web server...
echo ==========================================================================
echo     The Textile Master application will now launch on http://localhost:3000
echo     Keep this command prompt window open while you work.
echo ==========================================================================
echo.

call npm run dev
