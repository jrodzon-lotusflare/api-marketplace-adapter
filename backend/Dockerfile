FROM python:3.11-slim

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5555
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 5555

# Run the application with explicit host binding
CMD ["gunicorn", "--bind", "0.0.0.0:5555", "--workers", "4", "api_marketplace_adapter.app:create_app()"] 