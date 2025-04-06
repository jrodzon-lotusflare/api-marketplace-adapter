# Southbound API Key Proxy Template

This template creates an Apigee API proxy that adds a predefined API key to requests and forwards them to a target endpoint.

## Features

- Adds a predefined API key as an X-API-Key header to each request
- Forwards requests to a configurable target endpoint
- Configurable base path for the proxy endpoint

## Parameters

The following parameters are required:

- `target.url`: The URL of the target endpoint where requests should be forwarded
- `api.key`: The API key that will be added as an X-API-Key header to each request
- `proxy.basepath`: The base path for the API proxy endpoint (defaults to "/southbound-api-key")


## Development

This template is part of the Apigee API Proxy Templates project. For more information about the project structure and development guidelines, see the main project README. 