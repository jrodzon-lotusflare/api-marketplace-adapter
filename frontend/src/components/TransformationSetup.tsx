import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import * as ts from 'typescript';
import React from 'react';

interface ApiConfig {
  route: string;
  authType: string;
  apiKey: string;
  targetBaseUrl: string;
  targetAuthType: string;
  targetApiKey: string;
  inputSpec: (File | { url: string; name?: string }) | null;
  inputApi: string;
  outputApi: string;
  outputApiSpec: (File | { url: string; name?: string; repo?: string }) | null;
  mockResponse?: {
    request_converter: string;
    response_converter: string;
    rq_test_data: string;
    rs_test_data: string;
  };
}

interface TransformationSetupProps {
  apiConfig: ApiConfig;
  onComplete: (response: any) => void;
  onBack: () => void;
}

const TransformationSetup: React.FC<TransformationSetupProps> = ({ 
  apiConfig, 
  onComplete, 
  onBack 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executed, setExecuted] = useState(false);
  const [selectedConverter, setSelectedConverter] = useState<string>('');
  const [converterTypes, setConverterTypes] = useState<string[]>([]);
  const [converterCode, setConverterCode] = useState<string>('');
  const [syntaxError, setSyntaxError] = useState<string>('');
  const [inputFileContent, setInputFileContent] = useState<string>('');
  const [outputFileContent, setOutputFileContent] = useState<string>('');
  const [requestConverter, setRequestConverter] = useState<string>('');
  const [responseConverter, setResponseConverter] = useState<string>('');
  
  // Use a ref to track if we've already triggered the transform request
  const hasTriggeredTransform = React.useRef(false);
  const transformRequestInProgress = React.useRef(false);
  
  // Automatically trigger transformation only on initial component mount
  useEffect(() => {
    if (!hasTriggeredTransform.current && !loading) {
      hasTriggeredTransform.current = true;
      handleTransformRequest();
    }
  }, []); // Empty dependency array ensures it runs only once

  const handleTransformRequest = async () => {
    // Prevent duplicate calls if already loading or in progress
    if (loading || transformRequestInProgress.current) return;
    
    transformRequestInProgress.current = true;
    setLoading(true);
    setError('');
    setExecuted(false);
    setSyntaxError('');
    setConverterTypes([]);
    setConverterCode('');
    
    try {
      let inputContent = '';
      let outputContent = '';

      // Handle input file - ONLY PROCESS ONCE
      if (apiConfig.inputSpec instanceof File) {
        console.log("Using input from uploaded file");
        inputContent = await apiConfig.inputSpec.text();
      } else if (apiConfig.inputSpec && 'url' in apiConfig.inputSpec) {
        console.log("Downloading input from URL");
        const response = await fetch(apiConfig.inputSpec.url);
        if (!response.ok) {
          throw new Error(`Failed to download input specification from URL: ${response.status}`);
        }
        inputContent = await response.text();
      } else {
        console.log("No input specification found");
      }

      // Handle output file - ONLY PROCESS ONCE
      if (apiConfig.outputApiSpec instanceof File) {
        console.log("Using output from uploaded file");
        outputContent = await apiConfig.outputApiSpec.text();
      } else if (apiConfig.outputApiSpec && 'url' in apiConfig.outputApiSpec) {
        // Check if this is a CAMARA API definition (has path and repo properties)
        if ('path' in apiConfig.outputApiSpec && 'repo' in apiConfig.outputApiSpec) {
          console.log("Downloading CAMARA API definition from GitHub");
          // Construct the raw GitHub URL for the YAML file
          // Format: https://raw.githubusercontent.com/camaraproject/{repo}/main/{path}
          const rawGitHubUrl = `https://raw.githubusercontent.com/camaraproject/${apiConfig.outputApiSpec.repo}/main/${apiConfig.outputApiSpec.path}`;
          console.log(`Fetching CAMARA API from: ${rawGitHubUrl}`);
          
          const response = await fetch(rawGitHubUrl);
          if (!response.ok) {
            throw new Error(`Failed to download CAMARA API definition: ${response.status}`);
          }
          outputContent = await response.text();
        } else {
          console.log("Downloading output from URL");
          const response = await fetch(apiConfig.outputApiSpec.url);
          if (!response.ok) {
            throw new Error(`Failed to download output specification from URL: ${response.status}`);
          }
          outputContent = await response.text();
        }
      } else {
        console.log("No output specification found");
      }

      // Save the file contents for reference
      setInputFileContent(inputContent);
      setOutputFileContent(outputContent);

      // Log what we're sending
      console.log("Making single request to /transform");
      console.log(`Input content length: ${inputContent.length}`);
      console.log(`Output content length: ${outputContent.length}`);

      // Make a single request to /transform with both input and output
      const response = await fetch('http://localhost:5555/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            input_file: inputContent
          },
          output: {
            output_file: outputContent
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Set converter types for radio group (only request and response converters)
      setConverterTypes(['request_converter', 'response_converter']);
      
      // Store all response data
      setRequestConverter(data.request_converter || '');
      setResponseConverter(data.response_converter || '');
      
      // Set initial converter code
      setSelectedConverter('request_converter');
      setConverterCode(data.request_converter || '');

      setExecuted(true);
      onComplete(data);
    } catch (err) {
      console.error('Error transforming request:', err);
      setError('Error transforming request: ' + (err as Error).message);
      setExecuted(false); // Reset executed state on error
      // Reset selected converter and code on error
      setSelectedConverter('');
      setConverterCode('');
    } finally {
      setLoading(false);
      transformRequestInProgress.current = false;
    }
  };

  const handleConverterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedType = event.target.value;
    setSelectedConverter(selectedType);
    
    // Update converter code based on selection
    if (selectedType === 'request_converter') {
      setConverterCode(requestConverter);
    } else if (selectedType === 'response_converter') {
      setConverterCode(responseConverter);
    }
  };

  const handleVerifySyntax = () => {
    try {
      // Basic syntax check by attempting to parse the code
      const sourceFile = ts.createSourceFile(
        'temp.ts',
        converterCode,
        ts.ScriptTarget.Latest,
        true
      );
      
      // If we get here, the syntax is valid
      setSyntaxError('');
      // Set a success message
      setSyntaxSuccess(true);
    } catch (err) {
      setSyntaxError('Invalid TypeScript syntax: ' + (err as Error).message);
      setSyntaxSuccess(false);
    }
  };

  // Add state for syntax success
  const [syntaxSuccess, setSyntaxSuccess] = useState(false);

  // Function to navigate to the next step
  const handleNext = () => {
    // Pass data to parent and explicitly request next step
    onComplete({
      request_converter: requestConverter || '',
      response_converter: responseConverter || '',
      navigateToNext: true
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Generate Transformation Code
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Generate TypeScript transformation functions to convert between the input and output API formats.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Configuration Summary
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Proxy API Route:</Typography>
          <Typography variant="body1">{apiConfig.route}</Typography>
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
          <Typography variant="body1">{apiConfig.targetBaseUrl}</Typography>
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
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">Input Specification:</Typography>
            <Typography variant="body1" fontFamily="monospace">
              {apiConfig.inputSpec?.name || 'No file uploaded'}
            </Typography>
          </Box>
          
          <CompareArrowsIcon sx={{ mx: 2 }} />
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">Output Specification:</Typography>
            <Typography variant="body1" fontFamily="monospace">
              {apiConfig.outputApiSpec?.name || 'No specification selected'}
            </Typography>
            {apiConfig.outputApiSpec && 'repo' in apiConfig.outputApiSpec && apiConfig.outputApiSpec.repo && (
              <Chip 
                size="small" 
                label={`CAMARA: ${apiConfig.outputApiSpec.repo}`} 
                color="primary" 
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {converterTypes.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Converter Type</FormLabel>
            <RadioGroup
              value={selectedConverter}
              onChange={handleConverterChange}
            >
              {converterTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  value={type}
                  control={<Radio />}
                  label={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                />
              ))}
            </RadioGroup>
          </FormControl>

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
            <Typography variant="subtitle2" gutterBottom>
              {selectedConverter === 'request_converter' ? 'Request Converter Code:' : 'Response Converter Code:'}
            </Typography>
            {converterCode}
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleVerifySyntax}
              disabled={!selectedConverter}
            >
              Verify TypeScript Syntax
            </Button>

            <Button
              variant="outlined"
              onClick={handleTransformRequest}
              disabled={loading}
              sx={{ ml: 2 }}
            >
              Retry Transform
            </Button>

            {syntaxError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {syntaxError}
              </Alert>
            )}
            
            {syntaxSuccess && !syntaxError && (
              <Alert severity="success" sx={{ mt: 2 }}>
                TypeScript syntax verification passed!
              </Alert>
            )}
          </Box>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {!error && loading && (
            <Alert 
              severity="info"
              icon={<CircularProgress size={20} color="inherit" />}
              sx={{ mb: 2 }}
            >
              Transformation in progress... Please wait.
            </Alert>
          )}
          
          {!error && !loading && (
            <Alert 
              severity={executed ? "success" : "info"} 
              icon={executed ? <CheckCircleIcon /> : undefined}
              sx={{ mb: 2 }}
            >
              {executed 
                ? "Transformation code generated successfully! Click Next to continue." 
                : "Preparing transformation..."}
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
              variant="contained" 
              color="primary"
              onClick={handleNext}
              disabled={loading} // Only enable when loading is complete
            >
              Next
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Input API Specification
        </Typography>
        {apiConfig.inputSpec ? (
          <Chip 
            label={apiConfig.inputSpec instanceof File ? apiConfig.inputSpec.name : 'URL Specification'} 
            onDelete={() => onBack()}
            color="primary"
          />
        ) : (
          <Typography color="text.secondary">No input specification provided</Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Output API Specification
        </Typography>
        {apiConfig.outputApiSpec ? (
          <Chip 
            label={apiConfig.outputApiSpec instanceof File ? apiConfig.outputApiSpec.name : 'URL Specification'} 
            onDelete={() => onBack()}
            color="primary"
          />
        ) : (
          <Typography color="text.secondary">No output specification provided</Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Repository
        </Typography>
        <Chip 
          label={apiConfig.inputSpec instanceof File ? 'Local File' : 'URL'} 
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default TransformationSetup; 