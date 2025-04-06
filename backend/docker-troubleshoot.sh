#!/bin/bash

# Docker troubleshooting script for API Marketplace Adapter

echo "=== Docker Troubleshooting for API Marketplace Adapter ==="
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running."

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

echo "✅ docker-compose is installed."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️ Please update the .env file with your Anthropic API key."
    exit 1
fi

echo "✅ .env file exists."

# Check if ANTHROPIC_API_KEY is set in .env
if ! grep -q "ANTHROPIC_API_KEY=" .env || grep -q "ANTHROPIC_API_KEY=your_anthropic_api_key_here" .env; then
    echo "❌ ANTHROPIC_API_KEY is not set in .env file. Please update it."
    exit 1
fi

echo "✅ ANTHROPIC_API_KEY is set in .env file."

# Check if port 5555 is already in use
if lsof -i :5555 > /dev/null 2>&1; then
    echo "⚠️ Port 5555 is already in use. This might cause issues with Docker."
    echo "   You can change the port in docker-compose.yml and .env files."
fi

echo
echo "=== Starting Docker Compose ==="
echo

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d --build

# Check container status
echo
echo "=== Container Status ==="
docker-compose ps

# Check logs
echo
echo "=== Container Logs ==="
docker-compose logs --tail=20

echo
echo "=== Testing API ==="
echo "Testing health endpoint..."
sleep 5  # Give the container time to start
curl -s http://localhost:5555/health || echo "❌ Failed to connect to health endpoint"

echo
echo "=== Troubleshooting Complete ==="
echo "If you're still having issues, try the following:"
echo "1. Check if the container is running: docker-compose ps"
echo "2. Check container logs: docker-compose logs"
echo "3. Try restarting Docker: docker-compose restart"
echo "4. Check if port 5555 is available on your host"
echo "5. Try using a different port by updating docker-compose.yml and .env files" 