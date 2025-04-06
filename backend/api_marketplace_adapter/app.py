import os
import anthropic
from flask import Flask, request, jsonify
import requests
import logging
from dotenv import load_dotenv
from api_marketplace_adapter.transformers.script_manager import ScriptManager

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize Anthropic client with API key from environment variable
client = anthropic.Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)
logger.info("Using newer Anthropic client")


# Initialize script manager
script_manager = ScriptManager()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker."""
    return jsonify({"status": "healthy"}), 200

@app.route('/transform', methods=['POST'])
def process_parameters():
    """
    Transform API requests and responses between CAMARA-compliant and non-CAMARA-compliant formats.
    
    Expected JSON payload:
    {
        "input_spec_url": "URL to non-CAMARA-compliant Swagger 3 spec",
        "camara_spec_url": "URL to CAMARA-compliant Swagger 3 spec"
    }
    """
    # Check if client is initialized
    if client is None:
        return jsonify({
            "status": "ERROR",
            "message": "Anthropic client not initialized. Check your API key and Anthropic library version."
        }), 500
    
    # Extract parameters from request
    data = request.get_json()

    required_params = ['input_spec_url', 'camara_spec_url']
    for param in required_params:
        if param not in data:
            return jsonify({"error": f"Missing parameter: {param}"}), 400
    
    try:
        input_spec = data['input_spec_url']
        camara_spec = data['camara_spec_url']
        
        # Check if we already have a script for this transformation
        script_name = f"transform_{hash(input_spec + camara_spec)}.js"
        existing_script = script_manager.read_script(script_name)
        
        if existing_script:
            logger.info(f"Using existing transformation script: {script_name}")
            transformation_script = existing_script
        else:
            # Create prompt for Claude
            PROMPT = f"""
            Generate a JavaScript script that:
            1. Converts requests from the format defined in {input_spec} to the format defined in {camara_spec}
            2. Converts responses from the format defined in {camara_spec} back to the format defined in {input_spec}
            
            The script should handle all necessary transformations to ensure compatibility between the two API formats.
            """
            
            logger.info(f"Generating transformation script with prompt: {PROMPT}")
            
            # Newer Anthropic client
            message = client.messages.create(
                model="claude-3-7-sonnet-20250219",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": PROMPT}
                ]
            )
            transformation_script = message.content[0].text
            
            # Save the script for future use
            script_manager.save_script(script_name, transformation_script)
            logger.info(f"Transformation script saved as {script_name}")
        
        # Return the transformation script to the client
        return jsonify({
            "status": "OK",
            "transformation_script": transformation_script
        }), 200
    
    except requests.exceptions.RequestException as e:
        # Log the error
        logger.error(f"Error calling external API: {str(e)}")
        
        # Return error response to client
        return jsonify({
            "status": "ERROR",
            "message": f"Error generating transformation script: {str(e)}"
        }), 500
    except Exception as e:
        # Log any other errors
        logger.error(f"Unexpected error: {str(e)}")
        
        # Return error response to client
        return jsonify({
            "status": "ERROR",
            "message": f"Unexpected error: {str(e)}"
        }), 500

@app.route('/scripts', methods=['GET'])
def list_scripts():
    """List all available transformation scripts."""
    scripts = script_manager.list_scripts()
    return jsonify({
        "status": "OK",
        "scripts": scripts
    }), 200

@app.route('/scripts/<script_name>', methods=['GET'])
def get_script(script_name):
    """Get a specific transformation script."""
    script_content = script_manager.read_script(script_name)
    if script_content:
        return jsonify({
            "status": "OK",
            "script": script_content
        }), 200
    else:
        return jsonify({
            "status": "ERROR",
            "message": f"Script not found: {script_name}"
        }), 404

def create_app():
    """Factory function to create the Flask application."""
    return app

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5555) 