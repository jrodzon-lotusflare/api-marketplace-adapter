#!/bin/bash

# Create the Apigee templates directory if it doesn't exist
mkdir -p /app/apigee/templates

# Copy the Apigee templates to the correct location
if [ -d "/app/backend/apigee/templates" ]; then
  echo "Copying Apigee templates from /app/backend/apigee/templates to /app/apigee/templates"
  cp -r /app/backend/apigee/templates/* /app/apigee/templates/
elif [ -d "/app/apigee/templates" ]; then
  echo "Apigee templates already in the correct location"
else
  echo "Warning: Apigee templates not found"
fi

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
