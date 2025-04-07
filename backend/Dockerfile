FROM python:3.11-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make the start script executable
RUN chmod +x start.sh

# Create a directory for Apigee templates
RUN mkdir -p /app/apigee/templates

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5555
ENV HOST=0.0.0.0
ENV APIGEE_TEMPLATES_PATH=/app/apigee/templates

# Expose the port
EXPOSE 5555

# Run the application using the start script
CMD ["./start.sh"] 