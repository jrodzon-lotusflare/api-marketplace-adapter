# API Configurator

A React application that helps configure and transform API requests between different services using AI-powered mapping.

## Features

- **API Route Configuration**: Define custom API routes with authentication options
- **Swagger Specification Import**: Upload and parse Swagger/OpenAPI specifications
- **AI-Powered Transformation**: Send requests to Claude 3.7 to generate API mapping code
- **Mock Request Execution**: Test the generated transformation with mock requests

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/jrodzon-lotusflare/api-marketplace-adapter.git
   cd frontend
   ```

2. Install dependencies
   ```sh
   npm install
   ```

3. Start the development server
   ```sh
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage Guide

### Step 1: Configure API Route and Authentication

Define the API route where your transformation logic will be executed and select the authentication method. The route can include dynamic parameters like `{inputApi}` and `{outputApi}` which will be replaced with actual values.

### Step 2: Upload API Specifications

Upload a Swagger/OpenAPI specification file for your input API. This will be used to understand the structure of the API you want to transform from. Then, specify both input and output API names.

### Step 3: Setup API Transformation

Review your configuration and send a request to Claude 3.7 to generate the transformation code. The AI will analyze the input API specification and generate code to map it to the output API format.

### Step 4: Execute Mock Request

Test the generated transformation by executing a mock request. This simulates calling your API route with the transformed request without requiring an actual server setup.

## Project Structure

```
api-configurator/
├── src/
│   ├── components/
│   │   ├── RouteConfiguration.tsx  # Step 1: API route setup
│   │   ├── ApiSpecification.tsx    # Step 2: Upload specs
│   │   ├── TransformationSetup.tsx # Step 3: Claude integration
│   │   └── ExecuteRequest.tsx      # Step 4: Mock execution
│   ├── App.tsx                     # Main application
│   ├── main.tsx                    # Entry point
│   └── ...
├── public/
└── ...
```

## Future Enhancements

- Backend implementation to process actual API requests
- Authentication integration
- Saving and loading configurations
- Support for batch processing
- Integration with popular API gateways

## License

MIT

## Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Material UI](https://mui.com/)
- [Claude 3.7 by Anthropic](https://www.anthropic.com/)
