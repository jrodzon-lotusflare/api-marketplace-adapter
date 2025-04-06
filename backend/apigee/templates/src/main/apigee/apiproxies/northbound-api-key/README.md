# Northbound API Key Proxy Template

This template provides a simple API proxy that verifies if the API key header from the request matches a hardcoded value.

## Features

- Verifies if the API key header matches a hardcoded value
- Returns appropriate error responses for missing or invalid API keys
- Forwards valid requests to the target endpoint with the API key

## Configuration

To use this template, you need to set the following variables:

- `{hardcoded.api.key}`: The hardcoded API key value that will be used for validation
- `{proxy.basepath}`: The base path for the API proxy
- `{target.url}`: The URL of the target endpoint

## Usage

1. Deploy this template to your Apigee environment
2. Set the required variables in your deployment configuration
3. Make requests to the API proxy with the X-API-Key header

## Example Request

```
GET /your-api-path HTTP/1.1
Host: your-api-host
X-API-Key: your-api-key
```

## Example Response (Success)

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": "Your API response data"
}
```

## Example Response (Error - Missing API Key)

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": {
    "code": "401",
    "message": "API Key is missing"
  }
}
```

## Example Response (Error - Invalid API Key)

```
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": {
    "code": "403",
    "message": "Invalid API Key"
  }
}
``` 