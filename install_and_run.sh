#!/bin/bash
# High Density Textile Billing System - Single Installer and Run Script
echo "=========================================================================="
echo "      TEXTILE PRODUCTION & BILLING MANAGER LOCAL INSTALLER"
echo "=========================================================================="
echo ""

# Verify if Node.js runtime exists
if ! command -v node &> /dev/null
then
    echo "[-] ERROR: Node.js is not installed on this local workstation."
    echo "    Please download and install the recommended LST version of Node.js"
    echo "    from https://nodejs.org before running this setup."
    echo ""
    read -p "Press entering to exit installer..."
    exit 1
fi

echo "[+] Node.js detected: $(node -v)"
echo "[+] Step 1 of 2: Installing local application package dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "[-] ERROR: Dependency installation failed. Check network link and try again."
    read -p "Press entering to exit installer..."
    exit 1
fi

echo "[+] Step 2 of 2: Booting database engine and local application web server..."
echo "=========================================================================="
echo "    The Textile Master application will now launch on http://localhost:3000"
echo "    Keep this terminal window open while you work."
echo "=========================================================================="
echo ""

npm run dev
