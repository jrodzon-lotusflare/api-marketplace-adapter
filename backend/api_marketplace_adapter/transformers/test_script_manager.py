import os
import unittest
from api_marketplace_adapter.transformers.script_manager import ScriptManager

class TestScriptManager(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for testing
        self.test_dir = os.path.join(os.path.dirname(__file__), 'test_scripts')
        os.makedirs(self.test_dir, exist_ok=True)
        
        # Initialize the script manager with the test directory
        self.script_manager = ScriptManager(scripts_dir=self.test_dir)
        
        # Create a test script
        self.test_script_name = 'test_script.js'
        self.test_script_content = 'console.log("Hello, World!");'
        self.script_manager.save_script(self.test_script_name, self.test_script_content)
    
    def tearDown(self):
        # Clean up the test directory
        if os.path.exists(self.test_dir):
            for file in os.listdir(self.test_dir):
                os.remove(os.path.join(self.test_dir, file))
            os.rmdir(self.test_dir)
    
    def test_save_script(self):
        # Test saving a script
        script_name = 'new_script.js'
        script_content = 'console.log("New script");'
        
        # Save the script
        self.script_manager.save_script(script_name, script_content)
        
        # Verify the script was saved
        script_path = os.path.join(self.test_dir, script_name)
        self.assertTrue(os.path.exists(script_path))
        
        # Verify the script content
        with open(script_path, 'r') as f:
            saved_content = f.read()
        self.assertEqual(saved_content, script_content)
    
    def test_read_script(self):
        # Test reading a script
        script_content = self.script_manager.read_script(self.test_script_name)
        self.assertEqual(script_content, self.test_script_content)
    
    def test_read_nonexistent_script(self):
        # Test reading a nonexistent script
        script_content = self.script_manager.read_script('nonexistent.js')
        self.assertIsNone(script_content)
    
    def test_list_scripts(self):
        # Test listing scripts
        scripts = self.script_manager.list_scripts()
        self.assertIn(self.test_script_name, scripts)
        
        # Create another script
        another_script = 'another_script.js'
        self.script_manager.save_script(another_script, 'console.log("Another script");')
        
        # Verify both scripts are listed
        scripts = self.script_manager.list_scripts()
        self.assertIn(self.test_script_name, scripts)
        self.assertIn(another_script, scripts)

if __name__ == '__main__':
    unittest.main() 