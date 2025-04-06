#!/bin/bash

# Script to reinstall dependencies with the correct versions

echo "=== Reinstalling Dependencies for API Marketplace Adapter ==="
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Uninstall anthropic package to avoid conflicts
echo "Uninstalling current anthropic package..."
pip uninstall -y anthropic

# Install dependencies from requirements.txt
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo
echo "=== Dependencies Reinstalled ==="
echo "You can now run the application with: ./start.sh" 