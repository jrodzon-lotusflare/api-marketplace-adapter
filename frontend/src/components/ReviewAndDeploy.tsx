import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CodeIcon from '@mui/icons-material/Code';

interface ReviewAndDeployProps {
  apiConfig: {
    route: string;
    authType: string;
    apiKey: string;
    targetBaseUrl: string;
    targetAuthType: string;
    targetApiKey: string;
    inputApi: string;
    outputApi: string;
    mockResponse: any;
    deploymentConfig: string | null;
  };
  onBack: () => void;
}

const ReviewAndDeploy: React.FC<ReviewAndDeployProps> = ({
  apiConfig,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deployed, setDeployed] = useState(false);
  const [showCode, setShowCode] = useState<{
    inputConverter: boolean;
    outputConverter: boolean;
    deployment: boolean;
  }>({
    inputConverter: false,
    outputConverter: false,
    deployment: false
  });

  const handleDeploy = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeployed(true);
    } catch (err) {
      setError('Error deploying the configuration');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCode = (type: 'inputConverter' | 'outputConverter' | 'deployment') => {
    setShowCode(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Review and Deploy
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Review your configuration and deploy the API transformation.
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
        <Box sx={{ mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {deployed && !error && (
            <Alert 
              severity="success" 
              icon={<CheckCircleIcon />} 
              sx={{ mb: 2 }}
            >
              API transformation deployed successfully!
            </Alert>
          )}
        </Box>
      </Box>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Input Route Configuration
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Route"
              secondary={apiConfig.route}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText
              primary="Authentication"
              secondary={`Type: ${apiConfig.authType}${apiConfig.apiKey ? ', API Key configured' : ''}`}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText
              primary="Conversion Code"
              secondary={
                <Button
                  startIcon={<CodeIcon />}
                  onClick={() => toggleCode('inputConverter')}
                  size="small"
                >
                  View Code
                </Button>
              }
            />
          </ListItem>
          
          <Collapse in={showCode.inputConverter}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}
            >
              {apiConfig.mockResponse?.request_converter || 'No input converter code available'}
            </Paper>
          </Collapse>
        </List>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Output Route Configuration
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Base URL"
              secondary={apiConfig.targetBaseUrl}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText
              primary="Authentication"
              secondary={`Type: ${apiConfig.targetAuthType}${apiConfig.targetApiKey ? ', API Key configured' : ''}`}
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemText
              primary="Conversion Code"
              secondary={
                <Button
                  startIcon={<CodeIcon />}
                  onClick={() => toggleCode('outputConverter')}
                  size="small"
                >
                  View Code
                </Button>
              }
            />
          </ListItem>
          
          <Collapse in={showCode.outputConverter}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}
            >
              {apiConfig.mockResponse?.response_converter || 'No output converter code available'}
            </Paper>
          </Collapse>
        </List>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Deployment Configuration
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Configuration"
              secondary={
                <Button
                  startIcon={<CodeIcon />}
                  onClick={() => toggleCode('deployment')}
                  size="small"
                >
                  View Configuration
                </Button>
              }
            />
          </ListItem>
          
          <Collapse in={showCode.deployment}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mt: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto'
              }}
            >
              {apiConfig.deploymentConfig || 'No deployment configuration available'}
            </Paper>
          </Collapse>
        </List>
      </Paper>
      
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
        
        {!deployed && (
          <Button 
            variant="contained" 
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            onClick={handleDeploy}
            disabled={loading}
          >
            {loading ? 'Deploying...' : 'Deploy'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ReviewAndDeploy; 