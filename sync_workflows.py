#!/usr/bin/env python3
import os
import sys
import yaml
import requests
import logging
from typing import Tuple, Dict, Any, List
from requests.auth import HTTPBasicAuth
import json
import dotenv
from supabase import create_client, Client
import time
from pathlib import Path
import hashlib
import base64

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env.local
dotenv.load_dotenv('.env.local')

KESTRA_URL = os.getenv('KESTRA_URL', 'http://localhost:8080')
WORKFLOWS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kestra/workflows")
CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".workflow_cache")

# Get credentials from .env.local
USERNAME = os.getenv('KESTRA_USERNAME', 'markzlerner@gmail.com')
PASSWORD = os.getenv('KESTRA_PASSWORD', 'admin123')  

# Rate limiting settings
REQUEST_DELAY = 1  # seconds between requests

def get_file_hash(filepath: str) -> str:
    """Calculate SHA-256 hash of file contents"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def load_cache() -> Dict[str, str]:
    """Load the cache of previously synced workflows"""
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.warning("Cache file corrupted, starting fresh")
    return {}

def save_cache(cache: Dict[str, str]):
    """Save the cache of synced workflows"""
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

def validate_workflow(workflow: Dict) -> bool:
    """
    Validate workflow YAML structure before sending to Kestra
    """
    required_fields = ['namespace', 'id', 'tasks']
    
    try:
        # Check required fields
        for field in required_fields:
            if field not in workflow:
                logger.error(f"Missing required field: {field}")
                return False
        
        # Validate tasks
        if not isinstance(workflow['tasks'], list) or not workflow['tasks']:
            logger.error("Tasks must be a non-empty list")
            return False
            
        for task in workflow['tasks']:
            if not isinstance(task, dict) or 'id' not in task or 'type' not in task:
                logger.error("Each task must have an id and type")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        return False

def extract_workflow_metadata(workflow_path: str) -> Dict[str, Any]:
    """
    Extract metadata from a Kestra workflow YAML file
    
    Args:
        workflow_path (str): Path to the workflow YAML file
    
    Returns:
        Dict containing workflow metadata
    """
    with open(workflow_path, 'r') as f:
        workflow = yaml.safe_load(f)
    
    # Extract configuration schema from workflow inputs
    configuration_schema = {
        "type": "object",
        "properties": {}
    }
    
    if 'inputs' in workflow:
        for input_name, input_details in workflow.get('inputs', {}).items():
            schema_type = 'string'  # Default to string
            
            # Map Kestra input types to JSON schema types
            type_mapping = {
                'STRING': 'string',
                'INTEGER': 'number',
                'BOOLEAN': 'boolean',
                'FLOAT': 'number'
            }
            
            # Determine schema type
            if 'type' in input_details:
                schema_type = type_mapping.get(input_details['type'], 'string')
            
            configuration_schema['properties'][input_name] = {
                "type": schema_type,
                "title": input_details.get('description', input_name),
                "required": input_details.get('required', False)
            }
    
    # Determine category and other metadata
    filename = os.path.basename(workflow_path).replace('_', ' ').replace('.yml', '').title()
    
    return {
        'title': workflow.get('description', filename),
        'description': workflow.get('description', 'No description available'),
        'kestra_namespace': workflow.get('namespace', 'default'),
        'kestra_flow_id': workflow.get('id'),
        'kestra_template_path': workflow_path,
        'configuration_schema': json.dumps(configuration_schema),
        'category': filename,
        'difficulty_level': 'Intermediate',
        'price': 0.00  # Default price
    }

def sync_workflow_to_supabase(workflow_path):
    """
    Synchronize a Kestra workflow file to Supabase automations table
    """
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()

    # Initialize Supabase client
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase URL or Service Role Key not set in environment variables")
        return
    
    supabase: Client = create_client(supabase_url, supabase_key)

    try:
        # Extract workflow metadata
        workflow_metadata = extract_workflow_metadata(workflow_path)
        
        # Upsert into Supabase
        response = supabase.table('automations').upsert(
            workflow_metadata, 
            on_conflict='kestra_flow_id'
        ).execute()
        
        logger.info(f"Synced workflow: {os.path.basename(workflow_path)}")
    except Exception as e:
        logger.error(f"Error syncing {workflow_path}: {e}")

def get_auth_headers():
    """Get authentication headers for Kestra API"""
    auth_string = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    return {
        'Authorization': f'Basic {auth_string}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

def sync_workflow(file_path: str, cache: Dict[str, str]) -> Tuple[int, int]:
    """Sync a single workflow file with Kestra if it has changed.
    Returns (success_count, error_count)"""
    
    try:
        current_hash = get_file_hash(file_path)
        if cache.get(file_path) == current_hash:
            logger.info(f"Workflow unchanged, skipping: {file_path}")
            return 0, 0
            
        logger.info(f"Processing workflow file: {file_path}")
        
        with open(file_path, 'r') as f:
            workflow = yaml.safe_load(f)
            
        if not workflow:
            logger.error(f"Empty or invalid YAML file: {file_path}")
            return 0, 1
            
        if not validate_workflow(workflow):
            logger.error(f"Workflow validation failed: {file_path}")
            return 0, 1
            
        # Try to create the workflow first
        create_url = f"{KESTRA_URL}/api/v1/flows"
        logger.info(f"Attempting to create workflow at: {create_url}")
        
        headers = get_auth_headers()
        
        try:
            create_response = requests.post(
                create_url,
                json=workflow,
                headers=headers,
                timeout=10
            )
            
            time.sleep(REQUEST_DELAY)  # Rate limiting
            
            if create_response.status_code in [200, 201]:
                logger.info(f"Successfully created workflow: {os.path.basename(file_path)}")
                cache[file_path] = current_hash
                sync_workflow_to_supabase(file_path)
                return 1, 0
            elif create_response.status_code in [409, 422]:
                # Try to update the workflow
                update_url = f"{KESTRA_URL}/api/v1/flows/{workflow['namespace']}/{workflow['id']}"
                update_response = requests.put(
                    update_url,
                    json=workflow,
                    headers=headers,
                    timeout=10
                )
                
                time.sleep(REQUEST_DELAY)  # Rate limiting
                
                if update_response.status_code in [200, 201]:
                    logger.info(f"Successfully updated workflow: {os.path.basename(file_path)}")
                    cache[file_path] = current_hash
                    sync_workflow_to_supabase(file_path)
                    return 1, 0
                else:
                    logger.error(f"Failed to update workflow: {update_response.text}")
                    return 0, 1
            else:
                logger.error(f"Failed to create workflow: {create_response.text}")
                return 0, 1
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error for {file_path}: {str(e)}")
            return 0, 1
            
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        return 0, 1

def sync_all_workflows() -> Tuple[int, int]:
    """
    Sync all workflow files in the workflows directory.
    Returns (total_success_count, total_error_count)
    """
    if not os.path.exists(WORKFLOWS_DIR):
        logger.error(f"Workflows directory not found: {WORKFLOWS_DIR}")
        return 0, 0
        
    cache = load_cache()
    total_success = 0
    total_errors = 0
    
    workflow_files = [f for f in Path(WORKFLOWS_DIR).rglob("*.y*ml") 
                     if f.is_file() and not f.name.startswith(".")]
                     
    for workflow_file in workflow_files:
        success, error = sync_workflow(str(workflow_file), cache)
        total_success += success
        total_errors += error
        
    save_cache(cache)
    
    return total_success, total_errors

def main():
    logger.info("=== Workflow Sync Script Started ===")
    logger.info(f"Kestra URL: {KESTRA_URL}")
    logger.info(f"Workflows Directory: {WORKFLOWS_DIR}")
    logger.info(f"Using username: {USERNAME}")
    
    # Sync all workflows
    success_count, error_count = sync_all_workflows()
    
    # Print summary
    logger.info("\nSync Summary:")
    logger.info(f"Successfully synced: {success_count} workflow(s)")
    logger.info(f"Failed to sync: {error_count} workflow(s)")
    logger.info("=== Workflow Sync Script Ended ===")
    
    # Exit with appropriate status code
    sys.exit(0 if error_count == 0 else 1)

if __name__ == "__main__":
    main()
