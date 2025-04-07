# API Marketplace Adapter

A Python service that transforms CAMARA-compliant requests to non-CAMARA-compliant requests using Claude AI.

## Overview

This service provides an API that accepts URLs to Swagger 3 specifications for both CAMARA-compliant and non-CAMARA-compliant APIs. It uses Claude AI to generate a JavaScript transformation script that can convert requests and responses between the two formats.

## Features

- Transform API requests and responses between CAMARA-compliant and non-CAMARA-compliant formats
- Caching of transformation scripts for improved performance
- Script management API for listing and retrieving transformation scripts
- Docker support for easy deployment
- Health check endpoint for container orchestration
- Comprehensive test suite
- Dependency checking utility

## Prerequisites

- Python 3.8+
- Node.js 14+ (for running tests)
- Anthropic API key
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/api-marketplace-adapter.git
   cd api-marketplace-adapter
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Check if all dependencies are installed correctly:
   ```
   ./check_dependencies.sh
   ```

### Docker Setup

1. Build and run the Docker container:
   ```
   docker-compose up --build
   ```

## Usage

### API Endpoints

#### Transform API

```
POST /transform
```

Request body:
```json
{
  "input_spec_url": "URL to non-CAMARA-compliant Swagger 3 spec",
  "camara_spec_url": "URL to CAMARA-compliant Swagger 3 spec"
}
```

Response:
```json
{
  "status": "OK",
  "transformation_script": "JavaScript transformation script"
}
```

#### Script Management API

##### List Scripts

```
GET /scripts
```

Response:
```json
{
  "status": "OK",
  "scripts": ["script1.js", "script2.js", ...]
}
```

##### Get Script

```
GET /scripts/<script_name>
```

Response:
```json
{
  "status": "OK",
  "script": "JavaScript transformation script content"
}
```

#### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy"
}
```

### Example Usage

```bash
# Transform API request
curl -X POST http://localhost:5555/transform \
  -H "Content-Type: application/json" \
  -d '{
    "input_spec_url": "https://example.com/input-spec.json",
    "camara_spec_url": "https://example.com/camara-spec.json"
  }'

# List transformation scripts
curl http://localhost:5555/scripts

# Get a specific transformation script
curl http://localhost:5555/scripts/transform_123456.js
```

## Script Management

The service includes a script management system that:

1. Caches transformation scripts based on the hash of the input and CAMARA specification URLs
2. Reuses cached scripts when the same transformation is requested again
3. Provides API endpoints to list and retrieve transformation scripts

Scripts are stored in the `api_marketplace_adapter/transformers/scripts` directory by default.

## Testing

The service includes a comprehensive test suite for the script management functionality. To run the tests:

```bash
./run_tests.sh
```

This will:
1. Check if Node.js is installed (required for running JavaScript transformation tests)
2. Activate the virtual environment if it exists
3. Run all tests in the `api_marketplace_adapter/transformers` directory
4. Deactivate the virtual environment

### Test Dependencies

- Python 3.8+ with the packages listed in `requirements.txt`
- Node.js 14+ for running JavaScript transformation tests

## Docker Deployment

The service includes Docker support for easy deployment:

1. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```

2. The service will be available at `http://localhost:5555`

3. Use the included `docker-troubleshoot.sh` script for troubleshooting:
   ```
   ./docker-troubleshoot.sh
   ```

## Troubleshooting

### Local Deployment

1. Run the dependency check script to verify your environment:
   ```
   ./check_dependencies.sh
   ```

2. Check the application logs in `app.log`
3. Ensure your Anthropic API key is correctly set in the `.env` file
4. Verify that all dependencies are installed correctly
5. Make sure Node.js is installed for running tests

### Docker Deployment

1. Run the troubleshooting script:
   ```
   ./docker-troubleshoot.sh
   ```

2. Check Docker logs:
   ```
   docker-compose logs
   ```

3. Verify container health:
   ```
   curl http://localhost:5555/health
   ```

## License

[MIT License](LICENSE)

## Project Structure

```
api-marketplace-adapter/
├── api_marketplace_adapter/      # Main package
│   ├── __init__.py               # Package initialization
│   ├── __main__.py               # Entry point
│   ├── app.py                    # Flask application
│   └── config.py                 # Configuration
├── logs/                         # Log files
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore file
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose configuration
├── docker-troubleshoot.sh        # Docker troubleshooting script
├── reinstall-deps.sh             # Dependency reinstallation script
├── README.md                     # This file
├── requirements.txt              # Python dependencies
└── start.sh                      # Start script
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Merging Apigee API Proxy Templates

The API Marketplace Adapter provides an endpoint to merge the northbound-api-key and southbound-api-key templates into a single API proxy template. This is useful for creating a complete API proxy that handles both the northbound and southbound API key authentication.

### Docker Configuration

The Apigee templates are mounted as a volume in the Docker container. This ensures that the templates are available at runtime. The following changes have been made to support this:

1. The `docker-compose.yml` file has been updated to mount the Apigee templates directory:
   ```yaml
   volumes:
     - ./backend/logs:/app/logs
     - ./backend/apigee/templates:/app/apigee/templates
   ```

2. The `start.sh` script has been updated to copy the Apigee templates to the correct location in the container:
   ```bash
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
   ```

3. The `app.py` file has been updated to use the environment variable for the Apigee templates path:
   ```python
   APIGEE_TEMPLATES_PATH = os.environ.get("APIGEE_TEMPLATES_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "apigee", "templates", "src", "main", "apigee", "apiproxies"))
   ```

### Using the Merge API Proxy Endpoint

To merge the northbound-api-key and southbound-api-key templates, send a POST request to the `/merge-apiproxy` endpoint with the following JSON body:

```json
{
    "route": "/example",
    "authType": "apiKey",
    "apiKey": "abc",
    "targetBaseUrl": "wiremockEndpointUrl",
    "targetAuthType": "apiKey",
    "targetApiKey": "abc",
    "request_converter": "JS script",
    "response_converter": "JS script"
}
```

The endpoint will return a zip file containing the merged API proxy template. The zip file follows the Apigee emulator format structure.

### Required Parameters

- `route`: The base path for the API proxy
- `authType`: The authentication type for the northbound API (currently only "apiKey" is supported)
- `apiKey`: The API key for the northbound API
- `targetBaseUrl`: The base URL for the target API
- `targetAuthType`: The authentication type for the target API (currently only "apiKey" is supported)
- `targetApiKey`: The API key for the target API

### Optional Parameters

- `request_converter`: A JavaScript script to convert the request from the northbound API to the target API
- `response_converter`: A JavaScript script to convert the response from the target API to the northbound API

### Example

```bash
curl -X POST http://localhost:5555/merge-apiproxy \
  -H "Content-Type: application/json" \
  -d '{
    "route": "/example",
    "authType": "apiKey",
    "apiKey": "abc",
    "targetBaseUrl": "http://wiremock:8080",
    "targetAuthType": "apiKey",
    "targetApiKey": "xyz",
    "request_converter": "// Request converter script",
    "response_converter": "// Response converter script"
  }' \
  --output merged-apiproxy.zip
```
