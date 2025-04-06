// Verify if the API key header matches a hardcoded value
var apiKey = context.getVariable('request.header.X-API-Key');
var hardcodedApiKey = context.getVariable('hardcoded.api.key');

if (!apiKey) {
    context.setVariable('error.status.code', '401');
    context.setVariable('error.message', 'API Key is missing');
    throw new Error('API Key is missing');
}

if (apiKey !== hardcodedApiKey) {
    context.setVariable('error.status.code', '403');
    context.setVariable('error.message', 'Invalid API Key');
    throw new Error('Invalid API Key');
}

// API key is valid, continue with the request
context.setVariable('api.key.verified', 'true'); 