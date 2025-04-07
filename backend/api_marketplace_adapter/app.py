import os
import anthropic
from flask import Flask, request, jsonify, send_file
import requests
import logging
import json
import shutil
import tempfile
import zipfile
from pathlib import Path
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

# Define paths to Apigee templates
APIGEE_TEMPLATES_PATH = os.environ.get("APIGEE_TEMPLATES_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "apigee", "templates", "src", "main", "apigee", "apiproxies"))
NORTHBOUND_TEMPLATE_PATH = os.path.join(APIGEE_TEMPLATES_PATH, "northbound-api-key")
SOUTHBOUND_TEMPLATE_PATH = os.path.join(APIGEE_TEMPLATES_PATH, "southbound-api-key")

# Log the paths for debugging
logger.info(f"APIGEE_TEMPLATES_PATH: {APIGEE_TEMPLATES_PATH}")
logger.info(f"NORTHBOUND_TEMPLATE_PATH: {NORTHBOUND_TEMPLATE_PATH}")
logger.info(f"SOUTHBOUND_TEMPLATE_PATH: {SOUTHBOUND_TEMPLATE_PATH}")

# Check if the Apigee templates exist
def check_apigee_templates():
    """Check if the Apigee templates exist and log a warning if they don't."""
    if not os.path.exists(NORTHBOUND_TEMPLATE_PATH):
        logger.warning(f"Northbound API key template not found at {NORTHBOUND_TEMPLATE_PATH}")
        return False
    
    if not os.path.exists(SOUTHBOUND_TEMPLATE_PATH):
        logger.warning(f"Southbound API key template not found at {SOUTHBOUND_TEMPLATE_PATH}")
        return False
    
    logger.info("Apigee templates found")
    return True

# Check the templates on startup
check_apigee_templates()

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

@app.route('/merge-apiproxy', methods=['POST'])
def merge_apiproxy():
    """
    Endpoint to merge northbound-api-key and southbound-api-key templates.
    
    Expected request body:
    {
        "route": "/example",
        "authType": "apiKey",
        "apiKey": "abc",
        "targetBaseUrl": "wiremockEndpointUrl",
        "targetAuthType": "apiKey",
        "targetApiKey": "abc",
        "request_converter": "JS script",
        "response_converter": "JS script"
    }
    """
    try:
        # Check if the Apigee templates exist
        if not check_apigee_templates():
            return jsonify({"error": "Apigee templates not found. Please ensure the templates are properly mounted in the container."}), 500
        
        # Extract parameters from request
        data = request.get_json()
        
        # Validate required parameters
        required_params = ['route', 'authType', 'apiKey', 'targetBaseUrl', 'targetAuthType', 'targetApiKey']
        for param in required_params:
            if param not in data:
                return jsonify({"error": f"Missing parameter: {param}"}), 400
        
        # Extract parameters
        route = data.get('route')
        api_key = data.get('apiKey')
        target_base_url = data.get('targetBaseUrl')
        target_api_key = data.get('targetApiKey')
        request_converter = data.get('request_converter', '')
        response_converter = data.get('response_converter', '')
        
        # Create a temporary directory for the merged template
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create the directory structure for the Apigee emulator format
            apiproxy_dir = os.path.join(temp_dir, "apiproxy")
            apiproxies_dir = os.path.join(apiproxy_dir, "apiproxies")
            merged_apiproxy_dir = os.path.join(apiproxies_dir, "merged-apiproxy")
            policies_dir = os.path.join(merged_apiproxy_dir, "policies")
            proxies_dir = os.path.join(merged_apiproxy_dir, "proxies")
            resources_dir = os.path.join(merged_apiproxy_dir, "resources")
            targets_dir = os.path.join(merged_apiproxy_dir, "targets")
            
            # Create the environments directory structure
            environments_dir = os.path.join(apiproxy_dir, "environments")
            local_dir = os.path.join(environments_dir, "local")
            
            # Create all directories
            for directory in [apiproxy_dir, apiproxies_dir, merged_apiproxy_dir, 
                             policies_dir, proxies_dir, resources_dir, targets_dir,
                             environments_dir, local_dir]:
                os.makedirs(directory, exist_ok=True)
            
            # Copy and merge policies from both templates
            _copy_and_merge_policies(NORTHBOUND_TEMPLATE_PATH, SOUTHBOUND_TEMPLATE_PATH, policies_dir)
            
            # Copy and merge proxies from both templates
            _copy_and_merge_proxies(NORTHBOUND_TEMPLATE_PATH, SOUTHBOUND_TEMPLATE_PATH, proxies_dir, route)
            
            # Copy and merge targets from both templates
            _copy_and_merge_targets(NORTHBOUND_TEMPLATE_PATH, SOUTHBOUND_TEMPLATE_PATH, targets_dir, target_base_url, target_api_key)
            
            # Create the merged API proxy XML file
            _create_merged_apiproxy_xml(merged_apiproxy_dir, route)
            
            # Create the deployments.json file
            _create_deployments_json(local_dir, route)
            
            # Add request and response converter scripts as resources
            _add_converter_scripts(resources_dir, request_converter, response_converter)
            
            # Create a zip file of the merged template
            zip_path = os.path.join(temp_dir, "merged-apiproxy.zip")
            _create_zip_file(apiproxy_dir, zip_path)
            
            # Return the zip file
            return send_file(
                zip_path,
                as_attachment=True,
                download_name="merged-apiproxy.zip",
                mimetype="application/zip"
            )
    
    except Exception as e:
        logger.error(f"Error merging API proxy templates: {str(e)}")
        return jsonify({"error": f"Error merging API proxy templates: {str(e)}"}), 500

def _copy_and_merge_policies(northbound_path, southbound_path, target_dir):
    """Copy and merge policies from both templates."""
    # Copy policies from northbound template
    northbound_policies_dir = os.path.join(northbound_path, "policies")
    if os.path.exists(northbound_policies_dir):
        for file in os.listdir(northbound_policies_dir):
            if file.endswith('.xml') or file.endswith('.js'):
                shutil.copy(
                    os.path.join(northbound_policies_dir, file),
                    os.path.join(target_dir, file)
                )
    
    # Copy policies from southbound template
    southbound_policies_dir = os.path.join(southbound_path, "apiproxy", "policies")
    if os.path.exists(southbound_policies_dir):
        for file in os.listdir(southbound_policies_dir):
            if file.endswith('.xml') or file.endswith('.js'):
                shutil.copy(
                    os.path.join(southbound_policies_dir, file),
                    os.path.join(target_dir, file)
                )

def _copy_and_merge_proxies(northbound_path, southbound_path, target_dir, route):
    """Copy and merge proxies from both templates."""
    # Copy and modify proxy from northbound template
    northbound_proxies_dir = os.path.join(northbound_path, "proxies")
    if os.path.exists(northbound_proxies_dir):
        for file in os.listdir(northbound_proxies_dir):
            if file.endswith('.xml'):
                with open(os.path.join(northbound_proxies_dir, file), 'r') as f:
                    content = f.read()
                
                # Replace variables
                content = content.replace("{proxy.basepath}", route)
                
                with open(os.path.join(target_dir, file), 'w') as f:
                    f.write(content)
    
    # Copy and modify proxy from southbound template
    southbound_proxies_dir = os.path.join(southbound_path, "apiproxy", "proxies")
    if os.path.exists(southbound_proxies_dir):
        for file in os.listdir(southbound_proxies_dir):
            if file.endswith('.xml'):
                with open(os.path.join(southbound_proxies_dir, file), 'r') as f:
                    content = f.read()
                
                # Replace variables
                content = content.replace("{proxy.basepath}", route)
                
                with open(os.path.join(target_dir, file), 'w') as f:
                    f.write(content)

def _copy_and_merge_targets(northbound_path, southbound_path, target_dir, target_base_url, target_api_key):
    """Copy and merge targets from both templates."""
    # Copy and modify target from northbound template
    northbound_targets_dir = os.path.join(northbound_path, "targets")
    if os.path.exists(northbound_targets_dir):
        for file in os.listdir(northbound_targets_dir):
            if file.endswith('.xml'):
                with open(os.path.join(northbound_targets_dir, file), 'r') as f:
                    content = f.read()
                
                # Replace variables
                content = content.replace("{target.url}", target_base_url)
                
                with open(os.path.join(target_dir, file), 'w') as f:
                    f.write(content)
    
    # Copy and modify target from southbound template
    southbound_targets_dir = os.path.join(southbound_path, "apiproxy", "targets")
    if os.path.exists(southbound_targets_dir):
        for file in os.listdir(southbound_targets_dir):
            if file.endswith('.xml'):
                with open(os.path.join(southbound_targets_dir, file), 'r') as f:
                    content = f.read()
                
                # Replace variables
                content = content.replace("{target.url}", target_base_url)
                content = content.replace("{api.key}", target_api_key)
                
                with open(os.path.join(target_dir, file), 'w') as f:
                    f.write(content)

def _create_merged_apiproxy_xml(target_dir, route):
    """Create the merged API proxy XML file."""
    # Read the northbound API proxy XML file
    northbound_xml_path = os.path.join(NORTHBOUND_TEMPLATE_PATH, "northbound-api-key.xml")
    with open(northbound_xml_path, 'r') as f:
        content = f.read()
    
    # Replace variables
    content = content.replace("northbound-api-key", "merged-apiproxy")
    content = content.replace("Northbound API Key Proxy", "Merged API Proxy")
    content = content.replace("API proxy template that verifies a predefined API key in requests and forwards them to a target endpoint", 
                             "API proxy template that merges northbound and southbound API key proxies")
    
    # Write the merged API proxy XML file
    with open(os.path.join(target_dir, "merged-apiproxy.xml"), 'w') as f:
        f.write(content)

def _create_deployments_json(target_dir, route):
    """Create the deployments.json file."""
    deployments = {
        "deployments": [
            {
                "name": "merged-apiproxy",
                "revision": "1",
                "configuration": {
                    "hardcoded.api.key": "{api.key}",
                    "proxy.basepath": route,
                    "target.url": "{target.url}",
                    "api.key": "{target.api.key}"
                }
            }
        ]
    }
    
    with open(os.path.join(target_dir, "deployments.json"), 'w') as f:
        json.dump(deployments, f, indent=2)

def _add_converter_scripts(target_dir, request_converter, response_converter):
    """Add request and response converter scripts as resources."""
    # Add request converter script
    if request_converter:
        with open(os.path.join(target_dir, "request-converter.js"), 'w') as f:
            f.write(request_converter)
    
    # Add response converter script
    if response_converter:
        with open(os.path.join(target_dir, "response-converter.js"), 'w') as f:
            f.write(response_converter)

def _create_zip_file(source_dir, zip_path):
    """Create a zip file of the source directory."""
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

def create_app():
    """Factory function to create the Flask application."""
    return app

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5555) 