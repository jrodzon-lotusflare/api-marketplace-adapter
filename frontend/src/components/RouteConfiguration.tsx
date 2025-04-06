import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent,
  Paper,
  Divider
} from '@mui/material';

interface RouteConfigurationProps {
  onSubmit: (
    route: string, 
    authType: string,
    apiKey: string,
    targetBaseUrl: string,
    targetAuthType: string,
    targetApiKey: string
  ) => void;
}

const AUTH_TYPES = [
  { value: 'none', label: 'No Authentication' },
  { value: 'apiKey', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'bearer', label: 'Bearer Token' },
];

const RouteConfiguration: React.FC<RouteConfigurationProps> = ({ onSubmit }) => {
  // Proxy configuration
  const [route, setRoute] = useState('');
  const [authType, setAuthType] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // Target configuration
  const [targetBaseUrl, setTargetBaseUrl] = useState('');
  const [targetAuthType, setTargetAuthType] = useState('');
  const [targetApiKey, setTargetApiKey] = useState('');
  
  const [errors, setErrors] = useState({
    route: '',
    authType: '',
    apiKey: '',
    targetBaseUrl: '',
    targetAuthType: '',
    targetApiKey: '',
  });

  const handleRouteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoute(event.target.value);
    if (!event.target.value) {
      setErrors({ ...errors, route: 'API route is required' });
    } else if (!/^\/[a-zA-Z0-9/\-_{}]*$/.test(event.target.value)) {
      setErrors({ ...errors, route: 'API route should start with / and contain valid characters' });
    } else {
      setErrors({ ...errors, route: '' });
    }
  };

  const handleAuthTypeChange = (event: SelectChangeEvent<string>) => {
    setAuthType(event.target.value);
    setApiKey(''); // Reset API key when auth type changes
    if (!event.target.value) {
      setErrors({ ...errors, authType: 'Authentication type is required' });
    } else {
      setErrors({ ...errors, authType: '' });
    }
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
    if (authType === 'apiKey' && !event.target.value) {
      setErrors({ ...errors, apiKey: 'API key is required for API Key authentication' });
    } else {
      setErrors({ ...errors, apiKey: '' });
    }
  };

  const handleTargetBaseUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTargetBaseUrl(event.target.value);
    if (!event.target.value) {
      setErrors({ ...errors, targetBaseUrl: 'Target Base URL is required' });
    } else {
      setErrors({ ...errors, targetBaseUrl: '' });
    }
  };

  const handleTargetAuthTypeChange = (event: SelectChangeEvent<string>) => {
    setTargetAuthType(event.target.value);
    setTargetApiKey(''); // Reset target API key when auth type changes
    if (!event.target.value) {
      setErrors({ ...errors, targetAuthType: 'Target authentication type is required' });
    } else {
      setErrors({ ...errors, targetAuthType: '' });
    }
  };

  const handleTargetApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTargetApiKey(event.target.value);
    if (targetAuthType === 'apiKey' && !event.target.value) {
      setErrors({ ...errors, targetApiKey: 'Target API key is required for API Key authentication' });
    } else {
      setErrors({ ...errors, targetApiKey: '' });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate inputs
    const newErrors = {
      route: !route ? 'API route is required' : '',
      authType: !authType ? 'Authentication type is required' : '',
      apiKey: authType === 'apiKey' && !apiKey ? 'API key is required for API Key authentication' : '',
      targetBaseUrl: !targetBaseUrl ? 'Target Base URL is required' : '',
      targetAuthType: !targetAuthType ? 'Target authentication type is required' : '',
      targetApiKey: targetAuthType === 'apiKey' && !targetApiKey ? 'Target API key is required for API Key authentication' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    
    // If no errors, submit the form
    if (!hasErrors) {
      onSubmit(route, authType, apiKey, targetBaseUrl, targetAuthType, targetApiKey);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Configure API Route and Authentication
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Define the API route where your transformation logic will be executed and configure authentication methods.
      </Typography>
      
      {/* Proxy Route Configuration Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Proxy Route Configuration
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          Configure how clients will access your API transformation endpoint.
        </Typography>
        
        <TextField
          label="API Route"
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="/api/transform/{inputApi}/to/{outputApi}"
          value={route}
          onChange={handleRouteChange}
          error={!!errors.route}
          helperText={errors.route || "This will be the endpoint where API transformation will be executed"}
          required
        />
        
        <FormControl fullWidth margin="normal" error={!!errors.authType} required>
          <InputLabel id="auth-type-label">Authentication Type</InputLabel>
          <Select
            labelId="auth-type-label"
            id="auth-type"
            value={authType}
            label="Authentication Type"
            onChange={handleAuthTypeChange}
          >
            {AUTH_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {errors.authType || "Select the authentication method for your API route"}
          </FormHelperText>
        </FormControl>
        
        {authType === 'apiKey' && (
          <TextField
            label="API Key"
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={handleApiKeyChange}
            error={!!errors.apiKey}
            helperText={errors.apiKey || "API key for authenticating requests to your proxy endpoint"}
            required
          />
        )}
      </Paper>
      
      {/* Target Configuration Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Target Configuration
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          Configure the target API service that will receive the transformed requests.
        </Typography>
        
        <TextField
          label="Target Base URL"
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="https://api.example.com/v1"
          value={targetBaseUrl}
          onChange={handleTargetBaseUrlChange}
          error={!!errors.targetBaseUrl}
          helperText={errors.targetBaseUrl || "The base URL of the target API service"}
          required
        />
        
        <FormControl fullWidth margin="normal" error={!!errors.targetAuthType} required>
          <InputLabel id="target-auth-type-label">Target Authentication Type</InputLabel>
          <Select
            labelId="target-auth-type-label"
            id="target-auth-type"
            value={targetAuthType}
            label="Target Authentication Type"
            onChange={handleTargetAuthTypeChange}
          >
            {AUTH_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {errors.targetAuthType || "Select the authentication method for the target API"}
          </FormHelperText>
        </FormControl>
        
        {targetAuthType === 'apiKey' && (
          <TextField
            label="Target API Key"
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Enter the target API key"
            value={targetApiKey}
            onChange={handleTargetApiKeyChange}
            error={!!errors.targetApiKey}
            helperText={errors.targetApiKey || "API key for authenticating requests to the target API"}
            required
          />
        )}
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          type="submit"
          size="large"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default RouteConfiguration; 