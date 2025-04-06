"""
Script manager for API Marketplace Adapter.

This module handles loading and managing transformation scripts.
"""
import os
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ScriptManager:
    """Manages transformation scripts for API format conversion."""
    
    def __init__(self, scripts_dir=None):
        """
        Initialize the script manager.
        
        Args:
            scripts_dir (str, optional): Directory containing transformation scripts.
                Defaults to the 'transformers' directory in the package.
        """
        if scripts_dir is None:
            # Get the directory of this module
            package_dir = Path(__file__).parent
            self.scripts_dir = package_dir
        else:
            self.scripts_dir = Path(scripts_dir)
        
        logger.info(f"Script manager initialized with scripts directory: {self.scripts_dir}")
    
    def get_script_path(self, script_name):
        """
        Get the path to a transformation script.
        
        Args:
            script_name (str): Name of the script file.
            
        Returns:
            Path: Path to the script file.
        """
        return self.scripts_dir / script_name
    
    def read_script(self, script_name):
        """
        Read a transformation script from disk.
        
        Args:
            script_name (str): Name of the script file.
            
        Returns:
            str: Contents of the script file.
        """
        script_path = self.get_script_path(script_name)
        try:
            with open(script_path, 'r') as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Script not found: {script_path}")
            return None
        except Exception as e:
            logger.error(f"Error reading script {script_path}: {str(e)}")
            return None
    
    def save_script(self, script_name, script_content):
        """
        Save a transformation script to disk.
        
        Args:
            script_name (str): Name of the script file.
            script_content (str): Contents of the script.
            
        Returns:
            bool: True if the script was saved successfully, False otherwise.
        """
        script_path = self.get_script_path(script_name)
        try:
            with open(script_path, 'w') as f:
                f.write(script_content)
            logger.info(f"Script saved to {script_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving script to {script_path}: {str(e)}")
            return False
    
    def list_scripts(self):
        """
        List all available transformation scripts.
        
        Returns:
            list: List of script names.
        """
        try:
            return [f.name for f in self.scripts_dir.glob('*.js')]
        except Exception as e:
            logger.error(f"Error listing scripts: {str(e)}")
            return [] 