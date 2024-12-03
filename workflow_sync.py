#!/usr/bin/env python3
import os
import sys
import yaml
import logging
import requests
import dotenv
from typing import Dict, Any
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from supabase import create_client, Client
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('workflow_sync.log', mode='w'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
dotenv.load_dotenv('.env.local')

class KestraWorkflowSync:
    def __init__(self, workflows_dir: str, kestra_url: str, api_key: str):
        """
        Initialize Kestra workflow sync utility
        
        :param workflows_dir: Directory containing Kestra workflow YAML files
        :param kestra_url: Base URL of Kestra instance
        :param api_key: Kestra API authentication key
        """
        self.workflows_dir = workflows_dir
        self.kestra_url = kestra_url
        self.headers = {
            'Content-Type': 'application/x-yaml',
            'Authorization': f'Bearer {api_key}'
        }
        
        # Initialize Supabase client
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase configuration missing in .env.local")
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def extract_workflow_metadata(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract metadata from a Kestra workflow
        
        :param workflow: Parsed workflow YAML
        :return: Dictionary of workflow metadata
        """
        try:
            # Extract basic metadata
            metadata = {
                'id': workflow.get('id'),
                'namespace': workflow.get('namespace'),
                'description': workflow.get('description', ''),
                'labels': workflow.get('labels', {}),
            }
            
            # Extract configuration schema from inputs if present
            if 'inputs' in workflow:
                metadata['configuration_schema'] = {
                    input_name: {
                        'type': input_def.get('type', 'string'),
                        'required': input_def.get('required', False),
                        'description': input_def.get('description', ''),
                        'default': input_def.get('default', None)
                    }
                    for input_name, input_def in workflow['inputs'].items()
                }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting workflow metadata: {e}")
            return {}

    def validate_workflow(self, workflow_path: str) -> bool:
        """
        Validate Kestra workflow YAML file
        
        :param workflow_path: Path to workflow YAML file
        :return: Whether workflow is valid
        """
        try:
            with open(workflow_path, 'r') as f:
                workflow = yaml.safe_load(f)
                
            # Check required fields
            required_keys = ['id', 'namespace', 'tasks']
            if not all(key in workflow for key in required_keys):
                logger.error(f"Missing required fields in {workflow_path}")
                return False
            
            # Validate tasks
            if not isinstance(workflow['tasks'], list) or not workflow['tasks']:
                logger.error(f"Tasks must be a non-empty list in {workflow_path}")
                return False
                
            for task in workflow['tasks']:
                if not isinstance(task, dict) or 'id' not in task or 'type' not in task:
                    logger.error(f"Each task must have an id and type in {workflow_path}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Workflow validation error in {workflow_path}: {e}")
            return False

    def sync_workflow_to_supabase(self, workflow_path: str, workflow: Dict[str, Any]):
        """
        Sync workflow metadata to Supabase
        
        :param workflow_path: Path to workflow YAML file
        :param workflow: Parsed workflow YAML
        """
        try:
            metadata = self.extract_workflow_metadata(workflow)
            
            # Update or insert workflow metadata in Supabase
            result = self.supabase.table('automations').upsert({
                'kestra_template_id': f"{metadata['namespace']}.{metadata['id']}",
                'title': metadata['id'],
                'description': metadata['description'],
                'configuration_schema': json.dumps(metadata.get('configuration_schema', {})),
                'labels': json.dumps(metadata.get('labels', {})),
                'updated_at': 'now()'
            }, on_conflict='kestra_template_id').execute()
            
            logger.info(f"Successfully synced metadata for workflow: {workflow_path}")
            
        except Exception as e:
            logger.error(f"Failed to sync workflow metadata to Supabase: {e}")

    def sync_workflow(self, workflow_path: str):
        """
        Sync a single workflow to Kestra and Supabase
        
        :param workflow_path: Path to workflow YAML file
        """
        if not self.validate_workflow(workflow_path):
            logger.warning(f"Skipping invalid workflow: {workflow_path}")
            return

        try:
            with open(workflow_path, 'r') as f:
                workflow_content = f.read()
                workflow = yaml.safe_load(workflow_content)
            
            # Sync to Kestra
            response = requests.post(
                f"{self.kestra_url}/api/v1/flows",
                headers=self.headers,
                data=workflow_content
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully synced workflow to Kestra: {workflow_path}")
                # If Kestra sync successful, sync to Supabase
                self.sync_workflow_to_supabase(workflow_path, workflow)
            else:
                logger.error(f"Failed to sync workflow to Kestra {workflow_path}: {response.text}")
        
        except Exception as e:
            logger.error(f"Sync error for {workflow_path}: {e}")

class WorkflowHandler(FileSystemEventHandler):
    def __init__(self, syncer):
        self.syncer = syncer

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.yml'):
            self.syncer.sync_workflow(event.src_path)

    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.yml'):
            self.syncer.sync_workflow(event.src_path)

def main():
    # Load configuration from environment
    WORKFLOWS_DIR = os.getenv('WORKFLOWS_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), "kestra/workflows"))
    KESTRA_URL = os.getenv('KESTRA_URL', 'http://localhost:8080')
    API_KEY = os.getenv('KESTRA_API_KEY')

    if not API_KEY:
        logger.error("KESTRA_API_KEY not found in environment")
        sys.exit(1)

    syncer = KestraWorkflowSync(WORKFLOWS_DIR, KESTRA_URL, API_KEY)

    # Initial sync of all existing workflows
    for filename in os.listdir(WORKFLOWS_DIR):
        if filename.endswith('.yml'):
            syncer.sync_workflow(os.path.join(WORKFLOWS_DIR, filename))

    # Start file watching
    event_handler = WorkflowHandler(syncer)
    observer = Observer()
    observer.schedule(event_handler, WORKFLOWS_DIR, recursive=False)
    observer.start()

    try:
        logger.info("Workflow sync started. Watching for changes...")
        observer.join()
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == '__main__':
    main()
