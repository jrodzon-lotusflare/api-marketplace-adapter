#!/bin/bash

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your API keys and configuration."
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -d "venv" ] || [ ! -f "venv/bin/python" ]; then
    echo "Setting up virtual environment and installing dependencies..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Run the application
echo "Starting API Marketplace Adapter..."
python -m api_marketplace_adapter 