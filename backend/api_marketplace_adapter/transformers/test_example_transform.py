import os
import sys
import unittest
import subprocess
import json

class TestExampleTransform(unittest.TestCase):
    def setUp(self):
        # Path to the example transformation script
        self.script_path = os.path.join(
            os.path.dirname(__file__),
            'scripts',
            'example_transform.js'
        )
        
        # Create a Node.js script to test the transformation functions
        self.test_script = """
        const transform = require('{script_path}');
        
        // Test converting a request to CAMARA format
        const request = {{
            status: 'active',
            data: 'test data'
        }};
        const camaraRequest = transform.convertRequestToCamara(request);
        console.log(JSON.stringify(camaraRequest));
        
        // Test converting a response from CAMARA format
        const response = {{
            status: 'ACTIVE',
            data: 'test data'
        }};
        const nonCamaraResponse = transform.convertResponseFromCamara(response);
        console.log(JSON.stringify(nonCamaraResponse));
        """.format(script_path=self.script_path)
        
        # Write the test script to a temporary file
        self.test_script_path = os.path.join(
            os.path.dirname(__file__),
            'test_transform.js'
        )
        with open(self.test_script_path, 'w') as f:
            f.write(self.test_script)
    
    def tearDown(self):
        # Clean up the temporary test script
        if os.path.exists(self.test_script_path):
            os.remove(self.test_script_path)
    
    def test_transform_functions(self):
        # Run the test script with Node.js
        try:
            result = subprocess.run(
                ['node', self.test_script_path],
                capture_output=True,
                text=True,
                check=True
            )
            
            # Parse the output
            output_lines = result.stdout.strip().split('\n')
            camara_request = json.loads(output_lines[0])
            non_camara_response = json.loads(output_lines[1])
            
            # Verify the transformations
            self.assertEqual(camara_request['status'], 'ACTIVE')
            self.assertEqual(camara_request['data'], 'test data')
            
            self.assertEqual(non_camara_response['status'], 'active')
            self.assertEqual(non_camara_response['data'], 'test data')
            
        except subprocess.CalledProcessError as e:
            self.fail(f"Failed to run test script: {e.stderr}")
        except json.JSONDecodeError as e:
            self.fail(f"Failed to parse test script output: {e}")
        except Exception as e:
            self.fail(f"Unexpected error: {e}")

if __name__ == '__main__':
    unittest.main() 