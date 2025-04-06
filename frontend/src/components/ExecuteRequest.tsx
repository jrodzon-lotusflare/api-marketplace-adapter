import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';

interface ExecuteRequestProps {
  apiConfig: {
    route: string;
    authType: string;
    apiKey: string;
    targetBaseUrl: string;
    targetAuthType: string;
    targetApiKey: string;
    inputSpec: File | null;
    inputApi: string;
    outputApi: string;
    outputApiSpec: any;
    mockResponse: any;
  };
  onBack: () => void;
  onNext?: () => void;
}

const ExecuteRequest: React.FC<ExecuteRequestProps> = ({ apiConfig, onBack, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [error, setError] = useState('');
  const [mockResult, setMockResult] = useState<any>(null);
  const [activeConverter, setActiveConverter] = useState<string>('');
  const [availableConverters, setAvailableConverters] = useState<Array<{key: string, label: string}>>([]);
  const [testJson, setTestJson] = useState('');
  const [testResult, setTestResult] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [generatingSample, setGeneratingSample] = useState(false);

  // Extract converters from mockResponse when it's available
  useEffect(() => {
    if (apiConfig.mockResponse) {
      const converters: Array<{key: string, label: string}> = [];
      
      // Get all keys from the response
      Object.keys(apiConfig.mockResponse).forEach(key => {
        // Skip metadata keys
        if (key !== 'explanation' && key !== 'interfaces' && key !== 'inputApi' && key !== 'outputApi') {
          // Use the key directly as the label
          converters.push({
            key,
            label: key
          });
        }
      });
      
      setAvailableConverters(converters);
      
      // Set active converter to the first one if it exists and none is selected
      if (converters.length > 0 && !activeConverter) {
        setActiveConverter(converters[0].key);
      }
    }
  }, [apiConfig.mockResponse, activeConverter]);

  // Format the route with actual values
  const formattedRoute = apiConfig.route
    .replace('{inputApi}', apiConfig.inputApi.toLowerCase())
    .replace('{outputApi}', apiConfig.outputApi.toLowerCase());

  // Generate GitHub link for the API specification
  const getCamaraGitHubLink = () => {
    if (!apiConfig.outputApiSpec?.repo) return '#';
    return `https://github.com/camaraproject/${apiConfig.outputApiSpec.repo}/blob/main/${apiConfig.outputApiSpec.path}`;
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setError('');
    setExecuted(false);
    
    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const mockSuccessResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        transformedRequest: {
          url: `https://api.${apiConfig.outputApi.toLowerCase().replace(/\s+/g, '')}.com/v1/resource`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiConfig.outputApi.toUpperCase().replace(/\s+/g, '_')}_MOCK_KEY`
          },
          data: {
            id: 'sample-id-123',
            name: 'Sample Resource',
            description: 'This is a mock transformed request'
          }
        },
        response: {
          status: 200,
          data: {
            id: 'resp-456',
            status: 'success',
            message: 'Resource created successfully'
          }
        }
      };
      
      setMockResult(mockSuccessResponse);
      setExecuted(true);
    } catch (err) {
      setError('Error executing the request. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConverterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveConverter(event.target.value);
    setTestJson('');
    setTestResult('');
  };

  const generateSampleJson = async () => {
    try {
      // Simulate API call to fetch example data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would fetch examples from the Swagger/OpenAPI specs
      // This simulates that behavior
      
      if (activeConverter.includes('check') && activeConverter.includes('Request')) {
        // This is an input API request converter - get from input swagger
        // Here we would fetch from the inputSpec, but for now use a mock
        const exampleInputRequest = {
          phoneNumber: "+1234567890",
          callbackUrl: "https://example.com/callback"
        };
        
        setTestJson(JSON.stringify(exampleInputRequest, null, 2));
      } 
      else if (activeConverter.includes('Status') && activeConverter.includes('Response')) {
        // This is an output API response converter - get from output swagger
        // Here we would fetch from the outputApiSpec, but for now use a mock
        const exampleOutputResponse = {
          roaming: true,
          countryCode: "US",
          countryName: "United States",
          lastStatusTime: "2023-08-15T14:23:45Z"
        };
        
        setTestJson(JSON.stringify(exampleOutputResponse, null, 2));
      }
      else {
        // For other converters, generate appropriate examples based on the function name
        const functionName = activeConverter;
        
        if (functionName.toLowerCase().includes('request')) {
          // This is likely a request converter
          const genericRequest = {
            id: "req-" + Math.floor(Math.random() * 1000),
            timestamp: new Date().toISOString(),
            parameters: {
              key1: "value1",
              key2: "value2"
            }
          };
          
          setTestJson(JSON.stringify(genericRequest, null, 2));
        } 
        else if (functionName.toLowerCase().includes('response')) {
          // This is likely a response converter
          const genericResponse = {
            status: "success",
            code: 200,
            data: {
              id: "res-" + Math.floor(Math.random() * 1000),
              result: "Operation completed successfully",
              timestamp: new Date().toISOString()
            }
          };
          
          setTestJson(JSON.stringify(genericResponse, null, 2));
        }
        else {
          // Generic converter
          const genericData = {
            operation: functionName,
            timestamp: new Date().toISOString(),
            data: {
              sample: "This is sample data for testing the converter",
              testId: "test-" + Math.floor(Math.random() * 1000)
            }
          };
          
          setTestJson(JSON.stringify(genericData, null, 2));
        }
      }
    } catch (err) {
      setError('Error generating sample data. Please try again.');
      console.error('Error:', err);
    }
  };

  const handleTestConverter = () => {
    try {
      setError('');
      
      // Parse the input JSON
      const inputData = JSON.parse(testJson);
      
      // Extract function from the code
      const functionCode = apiConfig.mockResponse[activeConverter];
      let result;
      let executionLog = [];
      
      // Simulate executing the function with the input data
      // In a real implementation, we would use Function constructor or eval to run the code
      // but for safety and demo purposes, we'll simulate it
      
      if (activeConverter === 'convertCheckRoamingRequest') {
        // Simulate the conversion for check roaming request
        result = {
          msisdn: inputData.phoneNumber,
          includeCountryName: true
        };
        
        executionLog = [`Executing ${activeConverter}...`, `Successfully converted request data`];
      }
      else if (activeConverter === 'convertRoamingStatusResponse') {
        // Simulate the conversion for roaming status response
        const sourceResponse: any = {
          roaming: inputData.roaming
        };
        
        if (inputData.countryCode !== undefined) {
          sourceResponse.countryCode = inputData.countryCode;
        }
        
        if (inputData.countryName !== undefined) {
          sourceResponse.countryName = inputData.countryName;
        }
        
        result = sourceResponse;
        executionLog = [`Executing ${activeConverter}...`, `Successfully converted response data`];
      }
      else {
        // Generic function simulation for other converters
        result = {
          converted: true,
          originalKeys: Object.keys(inputData),
          processedBy: activeConverter,
          timestamp: new Date().toISOString()
        };
        
        executionLog = [`Executing ${activeConverter}...`, `Generic conversion completed`];
      }
      
      // Create a result object that looks like an HTTP request/response
      const formattedResult = {
        execution: {
          function: activeConverter,
          timestamp: new Date().toISOString(),
          success: true,
          log: executionLog
        },
        request: {
          input: inputData
        },
        response: {
          output: result,
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Converter': activeConverter
          }
        }
      };
      
      setTestResult(JSON.stringify(formattedResult, null, 2));
    } catch (err) {
      setError('Invalid JSON input. Please check the format.');
      console.error('Error parsing JSON:', err);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Execute Transformed API Request
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Review the generated transformation code and execute a mock request to test it.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          API Configuration
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Proxy Endpoint:</Typography>
          <Typography variant="body1" fontFamily="monospace">
            {formattedRoute}
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Proxy Authentication:</Typography>
          <Typography variant="body1">{apiConfig.authType}</Typography>
          {apiConfig.authType === 'apiKey' && (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
              API Key: {apiConfig.apiKey.slice(0, 4)}••••••{apiConfig.apiKey.slice(-4)}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Target Base URL:</Typography>
          <Typography variant="body1" fontFamily="monospace">{apiConfig.targetBaseUrl}</Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Target Authentication:</Typography>
          <Typography variant="body1">{apiConfig.targetAuthType}</Typography>
          {apiConfig.targetAuthType === 'apiKey' && (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1 }}>
              Target API Key: {apiConfig.targetApiKey.slice(0, 4)}••••••{apiConfig.targetApiKey.slice(-4)}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Transformation:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              {apiConfig.inputApi}
            </Typography>
            <ArrowBackIcon sx={{ transform: 'rotate(180deg)', mx: 1 }} />
            <Typography variant="body1">
              {apiConfig.outputApi}
            </Typography>
            {apiConfig.outputApiSpec && (
              <Chip 
                size="small" 
                icon={<DescriptionIcon />}
                label={apiConfig.outputApiSpec.name} 
                color="primary" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
        
        {apiConfig.outputApiSpec && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">CAMARA Specification:</Typography>
            <Link 
              href={getCamaraGitHubLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
            >
              <GitHubIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {apiConfig.outputApiSpec.repo}/{apiConfig.outputApiSpec.path}
              </Typography>
            </Link>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ width: '100%', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Converters
        </Typography>
        
        {availableConverters.length > 0 ? (
          <>
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Select Converter to Test</FormLabel>
              <RadioGroup
                row
                name="converters-group"
                value={activeConverter}
                onChange={handleConverterChange}
              >
                {availableConverters.map((converter) => (
                  <FormControlLabel 
                    key={converter.key} 
                    value={converter.key} 
                    control={<Radio />} 
                    label={converter.label} 
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="converter tabs" sx={{ mb: 2 }}>
              <Tab icon={<CodeIcon />} iconPosition="start" label="Converter Code" />
              <Tab icon={<DataObjectIcon />} iconPosition="start" label="Test" />
            </Tabs>
            
            <Box hidden={activeTab !== 0}>
              <TextField
                fullWidth
                multiline
                rows={16}
                value={activeConverter && apiConfig.mockResponse?.[activeConverter] 
                  ? apiConfig.mockResponse[activeConverter] 
                  : 'No converter code available.'}
                InputProps={{
                  readOnly: true,
                  style: { fontFamily: 'monospace' }
                }}
                variant="outlined"
              />
            </Box>
            
            <Box hidden={activeTab !== 1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
                <Box sx={{ mb: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={async () => {
                      setGeneratingSample(true);
                      try {
                        await generateSampleJson();
                      } finally {
                        setGeneratingSample(false);
                      }
                    }}
                    sx={{ mr: 1 }}
                    disabled={generatingSample}
                    startIcon={generatingSample ? <CircularProgress size={20} /> : <DataObjectIcon />}
                  >
                    {generatingSample ? 'Generating...' : 'Generate Sample JSON'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleTestConverter}
                    disabled={!testJson.trim()}
                  >
                    Test Converter
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Box sx={{ flex: 1, mr: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Input JSON</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    value={testJson}
                    onChange={(e) => setTestJson(e.target.value)}
                    placeholder={`Enter JSON for ${
                      activeConverter === 'request_converter' 
                        ? `${apiConfig.inputApi} request conversion` 
                        : activeConverter === 'response_converter'
                          ? `${apiConfig.outputApi} response conversion`
                          : activeConverter.replace('_converter', '') + ' conversion'
                    }`}
                    variant="outlined"
                    InputProps={{
                      style: { fontFamily: 'monospace' }
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: 1, ml: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Conversion Result</Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                      height: '226px',
                      overflow: 'auto'
                    }}
                  >
                    {testResult || 'Conversion result will appear here after testing'}
                  </Paper>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {activeConverter.includes('Request') 
                  ? `Input should match the ${apiConfig.inputApi} API format. This converter transforms request data for the ${apiConfig.outputApi} API.`
                  : activeConverter.includes('Response')
                    ? `Input should match the ${apiConfig.outputApi} API response format. This converter transforms response data back to the ${apiConfig.inputApi} format.`
                    : `Input data for the ${activeConverter} converter between ${apiConfig.inputApi} and ${apiConfig.outputApi} APIs.`}
              </Typography>
            </Box>
          </>
        ) : (
          <Alert severity="info">
            No converters available. Please generate the transformation code first.
          </Alert>
        )}
      </Box>
      
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            Explanation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" whiteSpace="pre-line">
            {apiConfig.mockResponse?.explanation || 'No explanation available.'}
          </Typography>
        </AccordionDetails>
      </Accordion>
      
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight="bold">
            Execute Full Mock Request
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Execute a complete mock request that uses both converters to transform data and simulate an API call.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {error && !testResult && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {executed && !error && (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon />} 
                sx={{ mb: 2 }}
              >
                API request executed successfully!
              </Alert>
            )}
          </Box>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleExecuteRequest}
            disabled={loading || !apiConfig.mockResponse}
          >
            {loading ? 'Executing...' : executed ? 'Execute Again' : 'Execute Mock Request'}
          </Button>
          
          {executed && mockResult && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(mockResult, null, 2)}
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          disabled={loading}
        >
          Back
        </Button>
        
        {executed && onNext && (
          <Button 
            variant="contained" 
            color="secondary"
            onClick={onNext}
          >
            Test Generated Code
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ExecuteRequest; 