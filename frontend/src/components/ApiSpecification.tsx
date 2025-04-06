import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField,
  Paper,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Tooltip,
  ListItemText,
  InputAdornment,
  Divider,
  Chip,
  Grid,
  Tab,
  Tabs,
  TabProps
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';

interface ApiSpecificationProps {
  onSubmit: (inputSpec: File | null, inputApi: string, outputApi: string, outputApiSpec?: any) => void;
  onBack: () => void;
  apiRoute?: string; // Optional API route from the first step
}

// Interface for GitHub repository data
interface CamaraRepo {
  name: string;
  html_url: string;
  description: string;
}

// Interface for API definition file
interface ApiDefinition {
  name: string;
  path: string;
  repo: string;
  url: string;
}

// Tab panel for input methods
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ApiSpecification: React.FC<ApiSpecificationProps> = ({ onSubmit, onBack, apiRoute }) => {
  const [inputSpecFile, setInputSpecFile] = useState<File | null>(null);
  const [outputSpecFile, setOutputSpecFile] = useState<File | null>(null);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [selectedApiDefinition, setSelectedApiDefinition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(false);
  const [apiDefLoading, setApiDefLoading] = useState(false);
  
  // State for URL inputs
  const [inputSpecUrl, setInputSpecUrl] = useState('');
  const [outputSpecUrl, setOutputSpecUrl] = useState('');
  
  // State for tabs
  const [inputTab, setInputTab] = useState(0);
  const [outputTab, setOutputTab] = useState(0);
  
  // State for repositories and API definitions
  const [camaraRepos, setCamaraRepos] = useState<CamaraRepo[]>([]);
  const [apiDefinitions, setApiDefinitions] = useState<ApiDefinition[]>([]);
  
  // State for repository search filter
  const [repoFilter, setRepoFilter] = useState('');
  
  // Counter for auto-incremented save location
  const [saveLocationCounter, setSaveLocationCounter] = useState(0);
  
  // References for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch repositories from CAMARA project
  useEffect(() => {
    const fetchCamaraRepos = async () => {
      setRepoLoading(true);
      try {
        // In a real implementation, you would make an actual API call to GitHub
        // For demonstration purposes, we're simulating this with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data based on the CAMARA GitHub organization
        // Updated with the complete list from https://github.com/orgs/camaraproject/repositories?type=all
        const mockRepos: CamaraRepo[] = [
          { name: 'SimSwap', html_url: 'https://github.com/camaraproject/SimSwap', description: 'Repository to describe, develop, document and test the Sim Swap API family' },
          { name: 'Governance', html_url: 'https://github.com/camaraproject/Governance', description: 'Telco network capabilities exposed through APIs provide a large benefit for customers' },
          { name: 'ConsentInfo', html_url: 'https://github.com/camaraproject/ConsentInfo', description: 'Sandbox API Repository to describe, develop, document and test ConsentInfo API(s), part of IdentityAndConsentManagement working group' },
          { name: 'QualityOnDemand', html_url: 'https://github.com/camaraproject/QualityOnDemand', description: 'Repository to describe, develop, document and test the QualityOnDemand API family' },
          { name: 'IdentityAndConsentManagement', html_url: 'https://github.com/camaraproject/IdentityAndConsentManagement', description: 'Repository to describe, develop, document and test the Identity And Consent Management for CAMARA APIs' },
          { name: 'CarrierBillingCheckOut', html_url: 'https://github.com/camaraproject/CarrierBillingCheckOut', description: 'Repository to describe, develop, document and test the Carrier Billing Check Out API family' },
          { name: 'EdgeCloud', html_url: 'https://github.com/camaraproject/EdgeCloud', description: 'Repository to describe, develop, document and test the EdgeCloud API family' },
          { name: 'camara-landscape', html_url: 'https://github.com/camaraproject/camara-landscape', description: 'CAMARA landscape information' },
          { name: 'DedicatedNetworks', html_url: 'https://github.com/camaraproject/DedicatedNetworks', description: 'Repository to describe, develop, document and test the Service APIs for DedicatedNetworks' },
          { name: 'ConnectivityInsights', html_url: 'https://github.com/camaraproject/ConnectivityInsights', description: 'Repository to describe, develop, document and test the Connectivity Insights family' },
          { name: 'CapabilitiesAndRuntimeRestrictions', html_url: 'https://github.com/camaraproject/CapabilitiesAndRuntimeRestrictions', description: 'Sandbox Repository to develop the concept and APIs for Capabilities and Runtime Restriction synchronization' },
          { name: 'DeviceStatus', html_url: 'https://github.com/camaraproject/DeviceStatus', description: 'Repository for Device Status APIs' },
          { name: 'DeviceLocation', html_url: 'https://github.com/camaraproject/DeviceLocation', description: 'Repository for Device Location APIs' },
          { name: 'NumberVerification', html_url: 'https://github.com/camaraproject/NumberVerification', description: 'Repository to describe, develop, document and test the Number Verification API family' },
          { name: 'OTPValidation', html_url: 'https://github.com/camaraproject/OTPValidation', description: 'Repository for OTP Validation APIs' },
          { name: 'tooling', html_url: 'https://github.com/camaraproject/tooling', description: 'Repository for organization wide tooling in CAMARA, supporting Commonalities' },
          { name: 'IoTDeviceManagement', html_url: 'https://github.com/camaraproject/IoTDeviceManagement', description: 'Sandbox API Repository for IoT Device Management APIs' },
          { name: 'QoSBooking', html_url: 'https://github.com/camaraproject/QoSBooking', description: 'Sandbox API Repository to develop the QoSBooking Service API(s). Part of QualityOnDemand Sub Project' },
          { name: 'TrafficInfluence', html_url: 'https://github.com/camaraproject/TrafficInfluence', description: 'Sandbox API Repository for Traffic Influence API(s)' },
          { name: 'Marketing', html_url: 'https://github.com/camaraproject/Marketing', description: 'Repository for the CAMARA Marketing Working Group' },
          { name: 'IoTSIMFraudPrevention', html_url: 'https://github.com/camaraproject/IoTSIMFraudPrevention', description: 'Sandbox API Repository for IoTSIMFraudPrevention APIs' },
          { name: 'APIBacklog', html_url: 'https://github.com/camaraproject/APIBacklog', description: 'Repository to maintain the API Backlog for CAMARA' },
          { name: 'DeviceDataVolume', html_url: 'https://github.com/camaraproject/DeviceDataVolume', description: 'Repository to describe, develop, document and test the DeviceDataVolume API' },
          { name: 'NetworkAccessManagement', html_url: 'https://github.com/camaraproject/NetworkAccessManagement', description: 'Repository to describe, develop, document and test the Home Devices - Network Access Management API' },
          { name: 'ApplicationProfile', html_url: 'https://github.com/camaraproject/ApplicationProfile', description: 'Repository for Application Profile Service API(s)' },
          { name: 'CustomerInsights', html_url: 'https://github.com/camaraproject/CustomerInsights', description: 'Repository to describe, develop, document and test ServiceAPIs for CustomerInsights' },
          { name: 'QualityOnDemand_PI1', html_url: 'https://github.com/camaraproject/QualityOnDemand_PI1', description: 'Provider Implementation of QualityOnDemand by Deutsche Telekom' },
          { name: 'ReleaseManagement', html_url: 'https://github.com/camaraproject/ReleaseManagement', description: 'Repository to describe, develop, document and test the Release Management process' },
          { name: 'SessionInsights', html_url: 'https://github.com/camaraproject/SessionInsights', description: 'Repository to develop the Quality by Design concept within the Connectivity Insights Sub Project' },
          { name: 'HighThroughputElasticNetworks', html_url: 'https://github.com/camaraproject/HighThroughputElasticNetworks', description: 'Sandbox Repository to develop the service APIs for High Throughput Elastic Networks' },
          { name: 'DeviceIdentifier', html_url: 'https://github.com/camaraproject/DeviceIdentifier', description: 'Repository to describe, develop, document and test the Device Identifier API family' },
          { name: 'DeviceSwap', html_url: 'https://github.com/camaraproject/DeviceSwap', description: 'Repository for Device Swap APIs' },
          { name: 'SimpleEdgeDiscovery', html_url: 'https://github.com/camaraproject/SimpleEdgeDiscovery', description: 'Repository for Simple Edge Discovery APIs' },
          { name: 'CommonalitiesCNCF', html_url: 'https://github.com/camaraproject/CommonalitiesCNCF', description: 'Repository for CNCF Commonalities' },
          { name: 'Commonalities', html_url: 'https://github.com/camaraproject/Commonalities', description: 'Repository to describe, develop, document and test the common guidelines and assets for CAMARA APIs' },
          { name: 'KnowYourCustomer', html_url: 'https://github.com/camaraproject/KnowYourCustomer', description: 'Repository for Know Your Customer APIs' },
          { name: 'Tenure', html_url: 'https://github.com/camaraproject/Tenure', description: 'Repository for Tenure APIs' },
          { name: 'NumberRecycling', html_url: 'https://github.com/camaraproject/NumberRecycling', description: 'Repository for Number Recycling APIs' },
          { name: 'RegionDeviceCount', html_url: 'https://github.com/camaraproject/RegionDeviceCount', description: 'Repository for Region Device Count APIs' },
          { name: 'WebRTC', html_url: 'https://github.com/camaraproject/WebRTC', description: 'Repository for WebRTC APIs' }
        ];
        
        setCamaraRepos(mockRepos);
      } catch (err) {
        console.error('Error fetching CAMARA repositories:', err);
        setError('Failed to load CAMARA repositories. Please try again.');
      } finally {
        setRepoLoading(false);
      }
    };
    
    fetchCamaraRepos();
  }, []);

  // Fetch API definitions when a repository is selected
  useEffect(() => {
    if (!selectedRepo) {
      setApiDefinitions([]);
      return;
    }
    
    const fetchApiDefinitions = async () => {
      setApiDefLoading(true);
      try {
        // In a real implementation, you would fetch actual data from GitHub
        // For demonstration purposes, we're simulating this with a timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock API definitions based on the selected repository
        let mockDefinitions: ApiDefinition[] = [];
        
        switch (selectedRepo) {
          case 'DeviceStatus':
            mockDefinitions = [
              { name: 'device-reachability-status.yaml', path: 'code/API_definitions/device-reachability-status.yaml', repo: selectedRepo, url: '#' },
              { name: 'device-roaming-status.yaml', path: 'code/API_definitions/device-roaming-status.yaml', repo: selectedRepo, url: '#' },
              { name: 'connected-network-type-subscriptions.yaml', path: 'code/API_definitions/connected-network-type-subscriptions.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'DeviceLocation':
            mockDefinitions = [
              { name: 'location-verification.yaml', path: 'code/API_definitions/location-verification.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'NumberVerification':
            mockDefinitions = [
              { name: 'number-verification.yaml', path: 'code/API_definitions/number-verification.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'QualityOnDemand':
            mockDefinitions = [
              { name: 'qos-profiles.yaml', path: 'code/API_definitions/qos-profiles.yaml', repo: selectedRepo, url: '#' },
              { name: 'quality-on-demand.yaml', path: 'code/API_definitions/quality-on-demand.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'SimSwap':
            mockDefinitions = [
              { name: 'sim-swap.yaml', path: 'code/API_definitions/sim-swap.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'ConnectivityInsights':
            mockDefinitions = [
              { name: 'application-profiles.yaml', path: 'code/API_definitions/application-profiles.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'OTPValidation':
            mockDefinitions = [
              { name: 'one-time-password-sms.yaml', path: 'code/API_definitions/one-time-password-sms.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'SimpleEdgeDiscovery':
            mockDefinitions = [
              { name: 'simple-edge-discovery.yaml', path: 'code/API_definitions/simple-edge-discovery.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'DeviceIdentifier':
            mockDefinitions = [
              { name: 'device-identifier.yaml', path: 'code/API_definitions/device-identifier.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'DeviceSwap':
            mockDefinitions = [
              { name: 'device-swap.yaml', path: 'code/API_definitions/device-swap.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'KnowYourCustomer':
            mockDefinitions = [
              { name: 'kyc-age-verification.yaml', path: 'code/API_definitions/kyc-age-verification.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'Tenure':
            mockDefinitions = [
              { name: 'kyc-tenure.yaml', path: 'code/API_definitions/kyc-tenure.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'NumberRecycling':
            mockDefinitions = [
              { name: 'number-recycling.yaml', path: 'code/API_definitions/number-recycling.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'RegionDeviceCount':
            mockDefinitions = [
              { name: 'region-device-count.yaml', path: 'code/API_definitions/region-device-count.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'WebRTC':
            mockDefinitions = [
              { name: 'webrtc-call-handling.yaml', path: 'code/API_definitions/webrtc-call-handling.yaml', repo: selectedRepo, url: '#' },
              { name: 'webrtc-events.yaml', path: 'code/API_definitions/webrtc-events.yaml', repo: selectedRepo, url: '#' },
              { name: 'webrtc-registration.yaml', path: 'code/API_definitions/webrtc-registration.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'EdgeCloud':
            mockDefinitions = [
              { name: 'edge-service-discovery.yaml', path: 'code/API_definitions/edge-service-discovery.yaml', repo: selectedRepo, url: '#' },
              { name: 'edge-service-kpi.yaml', path: 'code/API_definitions/edge-service-kpi.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'CustomerInsights':
            mockDefinitions = [
              { name: 'customer-insights.yaml', path: 'code/API_definitions/customer-insights.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'CarrierBillingCheckOut':
            mockDefinitions = [
              { name: 'carrier-billing-checkout.yaml', path: 'code/API_definitions/carrier-billing-checkout.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          case 'DeviceDataVolume':
            mockDefinitions = [
              { name: 'device-data-volume.yaml', path: 'code/API_definitions/device-data-volume.yaml', repo: selectedRepo, url: '#' }
            ];
            break;
          default:
            // For repositories without specific mock data, create a generic API definition
            mockDefinitions = [
              { name: `${selectedRepo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-api.yaml`, path: `code/API_definitions/${selectedRepo.toLowerCase().replace(/[^a-z0-9]/g, '-')}-api.yaml`, repo: selectedRepo, url: '#' }
            ];
        }
        
        setApiDefinitions(mockDefinitions);
      } catch (err) {
        console.error(`Error fetching API definitions for ${selectedRepo}:`, err);
        setError(`Failed to load API definitions for ${selectedRepo}. Please try again.`);
      } finally {
        setApiDefLoading(false);
      }
    };
    
    fetchApiDefinitions();
  }, [selectedRepo]);

  // Event handlers for file inputs
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    
    if (file) {
      // Check if it's a JSON or YAML file
      if (!/\.(json|yaml|yml)$/i.test(file.name)) {
        setError('Please upload a valid Swagger specification file (JSON or YAML)');
        setInputSpecFile(null);
        return;
      }
      
      setInputSpecFile(file);
      setInputSpecUrl(''); // Clear URL when file is uploaded
      setError('');
    }
  };

  const handleOutputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    
    if (file) {
      // Check if it's a JSON or YAML file
      if (!/\.(json|yaml|yml)$/i.test(file.name)) {
        setError('Please upload a valid Swagger specification file (JSON or YAML)');
        setOutputSpecFile(null);
        return;
      }
      
      setOutputSpecFile(file);
      setOutputSpecUrl(''); // Clear URL when file is uploaded
      setError('');
    }
  };

  // Event handlers for URL inputs
  const handleInputUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSpecUrl(event.target.value);
    setInputSpecFile(null); // Clear file when URL is entered
  };

  const handleOutputUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOutputSpecUrl(event.target.value);
    setOutputSpecFile(null); // Clear file when URL is entered
  };

  // Tab change handlers
  const handleInputTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setInputTab(newValue);
    // Clear data from the other tab
    if (newValue === 0) {
      setInputSpecUrl('');
    } else {
      setInputSpecFile(null);
    }
  };

  const handleOutputTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setOutputTab(newValue);
    // Clear data from the other tab
    if (newValue === 0) {
      setOutputSpecUrl('');
    } else {
      setOutputSpecFile(null);
    }
  };

  // Other event handlers
  const handleRepoChange = (event: SelectChangeEvent) => {
    setSelectedRepo(event.target.value);
    setSelectedApiDefinition(''); // Reset API definition when repo changes
  };

  const handleApiDefinitionChange = (event: SelectChangeEvent) => {
    setSelectedApiDefinition(event.target.value);
  };

  const handleRepoFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepoFilter(event.target.value);
  };

  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  // Helper function to fetch content from URL
  const fetchUrlContent = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from URL: ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching URL content:', error);
      throw new Error(`Error fetching file from URL: ${(error as Error).message}`);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerOutputFileInput = () => {
    if (outputFileInputRef.current) {
      outputFileInputRef.current.click();
    }
  };

  // Filter repositories based on the search input
  const filteredRepos = camaraRepos.filter(repo => 
    repo.name.toLowerCase().includes(repoFilter.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(repoFilter.toLowerCase()))
  );

  // Form submit handler
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      // Validate that we have either a file or URL for both input and output
      if ((inputTab === 0 && !inputSpecFile) || (inputTab === 1 && !inputSpecUrl)) {
        throw new Error('Please provide an input API specification (file or URL).');
      }
      
      // Check that we have a valid output specification based on the selected tab
      const hasValidOutput = (outputTab === 0 && outputSpecFile) || 
                           (outputTab === 1 && outputSpecUrl) || 
                           (outputTab === 2 && selectedApiDefinition);
      
      if (!hasValidOutput) {
        throw new Error('Please provide an output API specification (file, URL, or CAMARA API).');
      }
      
      // Validate URLs if those tabs are selected
      if (inputTab === 1 && !isValidUrl(inputSpecUrl)) {
        throw new Error('Please enter a valid URL for the input API specification.');
      }
      
      if (outputTab === 1 && !isValidUrl(outputSpecUrl)) {
        throw new Error('Please enter a valid URL for the output API specification.');
      }
      
      // Create the API specifications to pass to the next step
      let inputApiSpec: File | { url: string; name: string } | null = null;
      if (inputTab === 0) {
        // Using uploaded file
        inputApiSpec = inputSpecFile;
      } else if (inputTab === 1) {
        // Using URL
        inputApiSpec = { 
          url: inputSpecUrl,
          name: inputSpecUrl ? new URL(inputSpecUrl).pathname.split('/').pop() || 'URL Specification' : 'URL Specification'
        };
      }
      
      let outputApiName = '';
      let outputApiSpec: File | { url: string; name: string; path?: string; repo?: string } | null = null;
      
      if (outputTab === 0) {
        // Using uploaded file
        outputApiSpec = outputSpecFile;
        outputApiName = outputSpecFile?.name.split('.')[0] || 'API';
      } else if (outputTab === 1) {
        // Using URL
        outputApiSpec = { 
          url: outputSpecUrl,
          name: outputSpecUrl ? new URL(outputSpecUrl).pathname.split('/').pop() || 'URL Specification' : 'URL Specification'
        };
        outputApiName = outputSpecUrl ? new URL(outputSpecUrl).pathname.split('/').pop()?.split('.')[0] || 'API' : 'API';
      } else if (outputTab === 2 && selectedApiDefinition) {
        // Get the selected definition from apiDefinitions
        const selectedDef = apiDefinitions.find(def => def.path === selectedApiDefinition);
        
        if (selectedDef) {
          outputApiSpec = {
            name: selectedDef.name,
            path: selectedDef.path,
            repo: selectedDef.repo,
            url: selectedDef.url
          };
          outputApiName = selectedDef.name.split('.')[0];
        } else {
          throw new Error('Selected API definition not found');
        }
      }
      
      // Submit the API specifications to move to the next step
      onSubmit(inputApiSpec as (File | null), outputApiName, outputApiName, outputApiSpec);
      
    } catch (err) {
      console.error('Error processing API definition:', err);
      setError(`Failed to process API definition: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate URLs
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
      return false;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        API Specifications
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Upload or provide URLs for both input and output Swagger API specifications.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stack spacing={3}>
        {/* Input Specification Section */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Input API Specification
          </Typography>
          
          <Tabs value={inputTab} onChange={handleInputTabChange} aria-label="input method tabs">
            <Tab label="Upload File" icon={<FileUploadIcon />} iconPosition="start" />
            <Tab label="From URL" icon={<LinkIcon />} iconPosition="start" />
          </Tabs>
          
          <TabPanel value={inputTab} index={0}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px dashed',
                borderColor: 'grey.400',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.yaml,.yml"
              />
              
              <FileUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
              
              {inputSpecFile ? (
                <Typography variant="body1" color="primary">
                  {inputSpecFile.name}
                </Typography>
              ) : (
                <>
                  <Typography variant="body1">
                    Drag and drop your input Swagger API specification file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse (JSON or YAML)
                  </Typography>
                </>
              )}
            </Paper>
          </TabPanel>
          
          <TabPanel value={inputTab} index={1}>
            <TextField
              label="Swagger Specification URL"
              fullWidth
              margin="normal"
              variant="outlined"
              value={inputSpecUrl}
              onChange={handleInputUrlChange}
              placeholder="https://example.com/api/swagger.yaml"
              helperText="Enter a valid URL to a JSON or YAML Swagger/OpenAPI specification"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
          </TabPanel>
        </Paper>
        
        {/* Output Specification Section */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Output API Specification
          </Typography>
          
          <Tabs value={outputTab} onChange={handleOutputTabChange} aria-label="output method tabs">
            <Tab label="Upload File" icon={<FileUploadIcon />} iconPosition="start" />
            <Tab label="From URL" icon={<LinkIcon />} iconPosition="start" />
            <Tab label="CAMARA API" icon={<GitHubIcon />} iconPosition="start" />
          </Tabs>
          
          <TabPanel value={outputTab} index={0}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px dashed',
                borderColor: 'grey.400',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: 'grey.50',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
              onClick={triggerOutputFileInput}
            >
              <input
                type="file"
                hidden
                ref={outputFileInputRef}
                onChange={handleOutputFileChange}
                accept=".json,.yaml,.yml"
              />
              
              <FileUploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
              
              {outputSpecFile ? (
                <Typography variant="body1" color="primary">
                  {outputSpecFile.name}
                </Typography>
              ) : (
                <>
                  <Typography variant="body1">
                    Drag and drop your output Swagger API specification file here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or click to browse (JSON or YAML)
                  </Typography>
                </>
              )}
            </Paper>
          </TabPanel>
          
          <TabPanel value={outputTab} index={1}>
            <TextField
              label="Swagger Specification URL"
              fullWidth
              margin="normal"
              variant="outlined"
              value={outputSpecUrl}
              onChange={handleOutputUrlChange}
              placeholder="https://example.com/api/swagger.yaml"
              helperText="Enter a valid URL to a JSON or YAML Swagger/OpenAPI specification"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
          </TabPanel>
          
          <TabPanel value={outputTab} index={2}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Filter Repositories"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={repoFilter}
                  onChange={handleRepoFilterChange}
                  placeholder="Type to search..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="repo-select-label">CAMARA Repository</InputLabel>
                  <Select
                    labelId="repo-select-label"
                    id="repo-select"
                    value={selectedRepo}
                    label="CAMARA Repository"
                    onChange={handleRepoChange}
                    startAdornment={repoLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <GitHubIcon sx={{ mr: 1 }} />}
                    disabled={repoLoading}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {filteredRepos.length === 0 && (
                      <MenuItem disabled>
                        <Typography variant="body2">No repositories match your filter</Typography>
                      </MenuItem>
                    )}
                    
                    {filteredRepos.map((repo) => (
                      <MenuItem key={repo.name} value={repo.name}>
                        <Tooltip title={repo.description || "No description available"} placement="right">
                          <ListItemText primary={repo.name} />
                        </Tooltip>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {selectedRepo && (
              <>
                <Divider sx={{ my: 1 }}>
                  <Chip label="API Definitions" />
                </Divider>
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="api-definition-select-label">API Definition</InputLabel>
                  <Select
                    labelId="api-definition-select-label"
                    id="api-definition-select"
                    value={selectedApiDefinition}
                    label="API Definition"
                    onChange={handleApiDefinitionChange}
                    disabled={apiDefLoading}
                    startAdornment={apiDefLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : <DescriptionIcon sx={{ mr: 1 }} />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
                  >
                    {apiDefinitions.length === 0 && (
                      <MenuItem disabled>
                        <Typography variant="body2">No API definitions available</Typography>
                      </MenuItem>
                    )}
                    
                    {apiDefinitions.map((def) => (
                      <MenuItem key={def.path} value={def.path}>
                        <ListItemText 
                          primary={def.name} 
                          secondary={`${def.path.split('/').slice(0, -1).join('/')}/`}
                          secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </TabPanel>
        </Paper>
      </Stack>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          disabled={loading}
        >
          Back
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          type="submit"
          disabled={loading || (!inputSpecFile && !inputSpecUrl) || 
            (outputTab === 2 && (!selectedRepo || !selectedApiDefinition)) || 
            (outputTab === 1 && !outputSpecUrl) ||
            (outputTab === 0 && !outputSpecFile)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Processing...' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default ApiSpecification;
