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
import DataObjectIcon from '@mui/icons-material/DataObject';
import CodeIcon from '@mui/icons-material/Code';

interface TestCodeProps {
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
  onComplete: () => void;
  onBack: () => void;
}

const TestCode: React.FC<TestCodeProps> = ({ apiConfig, onComplete, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [mockData, setMockData] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [activeConverter, setActiveConverter] = useState<string>('');
  const [availableConverters, setAvailableConverters] = useState<Array<{key: string, label: string}>>([]);
  
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleConverterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveConverter(event.target.value);
    setMockData('');
    setTestResult('');
    setExecuted(false);
  };

  const handleGenerateMockData = async () => {
    setGenerating(true);
    setError('');
    
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
        
        setMockData(JSON.stringify(exampleInputRequest, null, 2));
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
        
        setMockData(JSON.stringify(exampleOutputResponse, null, 2));
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
          
          setMockData(JSON.stringify(genericRequest, null, 2));
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
          
          setMockData(JSON.stringify(genericResponse, null, 2));
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
          
          setMockData(JSON.stringify(genericData, null, 2));
        }
      }
    } catch (err) {
      setError('Error generating mock data. Please try again.');
      console.error('Error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleTestCode = async () => {
    setLoading(true);
    setError('');
    setExecuted(false);
    
    try {
      // Simulate testing the code with the mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Parse the mock data
      let inputData;
      try {
        inputData = JSON.parse(mockData);
      } catch (err) {
        throw new Error('Invalid JSON input data. Please check the format.');
      }
      
      // Extract function from the code
      const functionCode = apiConfig.mockResponse[activeConverter];
      let result;
      let executionLog = [];
      
      // Simulate executing the function with the input data
      // In a real implementation, we would use Function constructor or eval to run the code
      // but for safety and demo purposes, we'll simulate it
      
      executionLog.push(`Executing ${activeConverter}...`);
      
      if (activeConverter === 'convertCheckRoamingRequest') {
        // Simulate the conversion for check roaming request
        result = {
          msisdn: inputData.phoneNumber,
          includeCountryName: true
        };
        
        executionLog.push(`Successfully converted request data`);
      }
      else if (activeConverter === 'convertRoamingStatusResponse') {
        // Simulate the conversion for roaming status response
        const roamingResult: { 
          roaming: any; 
          countryCode?: string; 
          countryName?: string; 
        } = {
          roaming: inputData.roaming
        };
        
        if (inputData.countryCode !== undefined) {
          roamingResult.countryCode = inputData.countryCode;
        }
        
        if (inputData.countryName !== undefined) {
          roamingResult.countryName = inputData.countryName;
        }
        
        result = roamingResult;
        executionLog.push(`Successfully converted response data`);
      }
      else {
        // Generic function simulation for other converters
        result = {
          converted: true,
          originalKeys: Object.keys(inputData),
          processedBy: activeConverter,
          timestamp: new Date().toISOString()
        };
        
        executionLog.push(`Generic conversion completed`);
      }
      
      // Simulate HTTP request/response for visualization
      const testResultObj = {
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
      
      setTestResult(JSON.stringify(testResultObj, null, 2));
      setExecuted(true);
      setActiveTab(2); // Switch to results tab
    } catch (err) {
      setError(`Error testing code: ${(err as Error).message}`);
      setExecuted(false);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Test Generated Code
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Test the generated TypeScript transformation functions using mock data.
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
          <Typography variant="body2" color="text.secondary">Target URL:</Typography>
          <Typography variant="body1" fontFamily="monospace">
            {apiConfig.targetBaseUrl}
          </Typography>
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
      </Paper>
      
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
          
          <Box sx={{ width: '100%', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="code tabs">
              <Tab icon={<CodeIcon />} iconPosition="start" label="TypeScript Code" />
              <Tab icon={<DataObjectIcon />} iconPosition="start" label="Test Data" />
              {executed && <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Test Results" />}
            </Tabs>
            
            <Box hidden={activeTab !== 0} sx={{ mt: 2 }}>
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
            
            <Box hidden={activeTab !== 1} sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleGenerateMockData}
                  startIcon={generating ? <CircularProgress size={20} /> : <DataObjectIcon />}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Mock Data'}
                </Button>
              </Box>
              
              <TextField
                fullWidth
                multiline
                rows={12}
                value={mockData}
                onChange={(e) => setMockData(e.target.value)}
                placeholder={`Enter or generate mock JSON data to test the ${
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
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {activeConverter.includes('Request') 
                  ? `Input should match the ${apiConfig.inputApi} API format. This converter transforms request data for the ${apiConfig.outputApi} API.`
                  : activeConverter.includes('Response')
                    ? `Input should match the ${apiConfig.outputApi} API response format. This converter transforms response data back to the ${apiConfig.inputApi} format.`
                    : `Input data for the ${activeConverter} converter between ${apiConfig.inputApi} and ${apiConfig.outputApi} APIs.`}
              </Typography>
            </Box>
            
            <Box hidden={activeTab !== 2 || !executed} sx={{ mt: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  minHeight: '300px',
                  maxHeight: '500px',
                  overflow: 'auto'
                }}
              >
                {testResult}
              </Paper>
            </Box>
          </Box>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No converters available. Please generate the transformation code first.
        </Alert>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          {error && (
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
              Code executed successfully!
            </Alert>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            disabled={loading}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleTestCode}
              disabled={loading || !mockData}
            >
              {loading ? 'Testing...' : 'Test Script Locally'}
            </Button>
            
            {executed && !error && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={onComplete}
              >
                Deployment Configuration
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TestCode; 