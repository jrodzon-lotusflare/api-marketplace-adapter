import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Paper from '@mui/material/Paper';

import RouteConfiguration from './components/RouteConfiguration';
import ApiSpecification from './components/ApiSpecification';
import TransformationSetup from './components/TransformationSetup';
import ExecuteRequest from './components/ExecuteRequest';
import TestCode from './components/TestCode';
import DeploymentConfiguration from './components/DeploymentConfiguration';
import ReviewAndDeploy from './components/ReviewAndDeploy';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const steps = [
  'Configure API Route',
  'Upload API Specifications',
  'Generate Transformation',
  'Deployment Configuration',
  'Review and Deploy'
];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [apiConfig, setApiConfig] = useState({
    route: '',
    authType: '',
    apiKey: '',
    targetBaseUrl: '',
    targetAuthType: '',
    targetApiKey: '',
    inputSpec: null as File | null,
    inputApi: '',
    outputApi: '',
    outputApiSpec: null as any,
    transformationPrompt: '',
    mockResponse: null as {
      request_converter?: string;
      response_converter?: string;
      rq_test_data?: string;
      rs_test_data?: string;
      inputApi?: string;
      outputApi?: string;
      interfaces?: string;
      explanation?: string;
    } | null,
    testResults: null as any,
    executed: false,
    deploymentConfig: null as string | null,
    deployed: false
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleRouteConfigurationComplete = (
    route: string, 
    authType: string, 
    apiKey: string,
    targetBaseUrl: string,
    targetAuthType: string,
    targetApiKey: string
  ) => {
    setApiConfig({ 
      ...apiConfig, 
      route, 
      authType, 
      apiKey,
      targetBaseUrl,
      targetAuthType,
      targetApiKey
    });
    handleNext();
  };

  const handleMoveToTransformStep = () => {
    setActiveStep(2);
  };

  const handleApiSpecificationComplete = (
    inputSpec: File | null, 
    inputApi: string, 
    outputApi: string, 
    outputApiSpec: any = null
  ) => {
    setApiConfig({ 
      ...apiConfig, 
      inputSpec, 
      inputApi, 
      outputApi, 
      outputApiSpec 
    });
    handleMoveToTransformStep();
  };

  const handleTransformationComplete = (mockResponse: any) => {
    setApiConfig({ 
      ...apiConfig, 
      mockResponse: mockResponse,
      executed: true
    });
    
    if (mockResponse.navigateToNext) {
      console.log("Navigating to step 3 (Deployment Configuration)");
      setActiveStep(3);
    }
  };

  const handleTestComplete = () => {
    // Not used anymore
  };

  const handleDeploymentComplete = (deploymentConfig: string) => {
    setApiConfig({ 
      ...apiConfig, 
      deploymentConfig 
    });
    setActiveStep(4);
  };

  const getStepContent = (step: number) => {
    console.log(`Rendering step: ${step}`);
    
    switch (step) {
      case 0:
        return (
          <RouteConfiguration
            onSubmit={handleRouteConfigurationComplete}
          />
        );
      case 1:
        return (
          <ApiSpecification
            onSubmit={handleApiSpecificationComplete}
            onBack={() => setActiveStep(0)}
          />
        );
      case 2:
        return (
          <TransformationSetup
            apiConfig={apiConfig}
            onComplete={handleTransformationComplete}
            onBack={() => setActiveStep(1)}
          />
        );
      case 3:
        console.log("Rendering Deployment Configuration");
        return (
          <DeploymentConfiguration
            apiConfig={apiConfig}
            onComplete={handleDeploymentComplete}
            onBack={() => setActiveStep(2)}
          />
        );
      case 4:
        return (
          <ReviewAndDeploy
            apiConfig={apiConfig}
            onBack={() => setActiveStep(4)}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return !!apiConfig.route;
      case 1:
        return !!apiConfig.inputSpec && !!apiConfig.outputApiSpec;
      case 2:
        return !!apiConfig.mockResponse;
      case 3:
        return !!apiConfig.deploymentConfig;
      case 4:
        return apiConfig.deployed;
      default:
        return false;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            API Configurator
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '60vh' 
            }}
          >
            {getStepContent(activeStep)}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
