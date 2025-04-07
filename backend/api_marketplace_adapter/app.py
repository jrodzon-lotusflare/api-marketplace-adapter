import os
import anthropic
from flask import Flask, request, jsonify
import requests
import logging
import json
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

def extract_json_content(text):
    """
    Extract JSON content from a string that's wrapped in ```json and ``` markers.
    Returns the content between these markers, excluding the markers themselves.
    """
    if not text:
        return text
        
    # Find the start and end of the JSON content
    start_marker = "```json"
    end_marker = "```"
    
    start_pos = text.find(start_marker)
    if start_pos == -1:
        # No start marker found, try without "json" label
        start_marker = "```"
        start_pos = text.find(start_marker)
        if start_pos == -1:
            # Still no marker, return original text
            return text
    
    # Move past the start marker
    start_pos += len(start_marker)
    
    # Find the end marker after the start marker
    end_pos = text.find(end_marker, start_pos)
    if end_pos == -1:
        # No end marker found, return from start to end
        return text[start_pos:]
    
    # Extract the content between markers
    json_content = text[start_pos:end_pos].strip()
    return json_content

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker."""
    return jsonify({"status": "healthy"}), 200

@app.route('/transform', methods=['POST'])
def process_parameters():
    # Extract parameters from requesta
    logger.info(request)
    data = request.get_json()

    required_params = ['input', 'output']
    for param in required_params:
        if param not in data:
            return jsonify({"error": f"Missing parameter: {param}"}), 400
    try:
        input_data = data['input']
        output_data = data['output']
        
        # Extract required fields
        non_camara_file = input_data.get('input_file')
        input_save_location = input_data.get('save_location')
        input_swagger_url = input_data.get('input_swagger_url')
        api_route = input_data.get('api_route', '')  # Get the API route from the request
        
        camara_file = output_data.get('output_file')
        output_save_location = output_data.get('save_location')
        output_swagger_url = output_data.get('output_swagger_url')

        message = client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": f"Consider this target swagger specification: {camara_file}"},
                {"role": "user", "content": f"Consider this source swagger specification: {non_camara_file}"},
                {"role": "user", "content": f"Analyze each swagger specification and find a match For each API/path"
                                            f"Analyze and match API properties and generate 2 simple typescript scripts. "
                                            f"One that will convert source requests into target requests and the othert that "
                                            f"will convert target responses into source responses."
                                            f"Your response format should be a json placed under '```json' and at the end of all the typescript and json generated closed with  '```' ."
                                            f"Create a typescript which will convert source requests to target requests"
                                            f"Create a second typescript which will convert target responses into source responses"
                                            f"Fields in this json are 'request_converter' and 'response_converter'. "
                 },
            ]
        )
        # Log the response from the external API
        
        raw_content = message.content[0].text
        logger.info(f"Raw API response: {raw_content}")
        
        # Extract JSON content
        response = extract_json_content(raw_content)
        logger.info(f"Extracted JSON: {response}")

        # Try to parse the JSON with error handling
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            
            # Return a default response when JSON parsing fails
            return {
                "request_converter": "// Error parsing JSON response from model",
                "response_converter": "// Error parsing JSON response from model", 
                "rq_test_data": "{}",
                "rs_test_data": "{}"
            }
    
    except requests.exceptions.RequestException as e:
        # Log the error
        logger.error(f"Error calling external API: {str(e)}")
        
        # Return error response to client but still with 200 status
        # since we want to return OK response regardless of external API result
        return jsonify({"status": "OK"}), 200


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