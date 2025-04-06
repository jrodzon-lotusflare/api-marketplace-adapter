import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface DeploymentConfigurationProps {
  apiConfig: {
    route: string;
    inputApi: string;
    outputApi: string;
    mockResponse: any;
  };
  onComplete: (config: string) => void;
  onBack: () => void;
}

const DeploymentConfiguration: React.FC<DeploymentConfigurationProps> = ({
  apiConfig,
  onComplete,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deploymentConfig, setDeploymentConfig] = useState<string | null>(null);
  const [tested, setTested] = useState(false);

  const generateDeploymentConfig = async () => {
    setLoading(true);
    setError('');
    setTested(false);
    
    try {
      // Simulate API call to generate deployment config
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = `<?xml version="1.0" encoding="UTF-8"?>
<api-config>
  <route>${apiConfig.route}</route>
  <input-api>${apiConfig.inputApi}</input-api>
  <output-api>${apiConfig.outputApi}</output-api>
  <transformers>
    <request>${apiConfig.mockResponse?.request_converter || ''}</request>
    <response>${apiConfig.mockResponse?.response_converter || ''}</response>
  </transformers>
</api-config>`;
      
      setDeploymentConfig(config);
      // Don't call onComplete here - wait for user to click Next
    } catch (err) {
      setError('Error generating deployment configuration');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testDeployment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate deployment test
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTested(true);
    } catch (err) {
      setError('Error testing deployment configuration');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle navigation to the next step
  const handleNext = () => {
    if (deploymentConfig) {
      onComplete(deploymentConfig);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Deployment Configuration
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Generate and test the deployment configuration for your API transformation.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
        
        {!deploymentConfig && (
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            onClick={generateDeploymentConfig}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? 'Generating...' : 'Generate Deployment Configuration'}
          </Button>
        )}
      </Box>
      
      {deploymentConfig && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'grey.100',
            borderRadius: 1,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto'
          }}
        >
          {deploymentConfig}
        </Paper>
      )}
      
      {tested && !error && (
        <Alert 
          severity="success" 
          icon={<CheckCircleIcon />} 
          sx={{ mb: 3 }}
        >
          Deployment configuration tested successfully!
        </Alert>
      )}
      
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
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {deploymentConfig && !tested && (
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={testDeployment}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Deployment'}
            </Button>
          )}
          
          {deploymentConfig && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DeploymentConfiguration; 