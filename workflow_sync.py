#!/usr/bin/env python3
import os
import sys
import yaml
import logging
import requests
from typing import Dict, Any
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

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

    def validate_workflow(self, workflow_path: str) -> bool:
        """
        Validate Kestra workflow YAML file
        
        :param workflow_path: Path to workflow YAML file
        :return: Whether workflow is valid
        """
        try:
            with open(workflow_path, 'r') as f:
                workflow = yaml.safe_load(f)
                required_keys = ['id', 'namespace', 'tasks']
                return all(key in workflow for key in required_keys)
        except Exception as e:
            logger.error(f"Workflow validation error in {workflow_path}: {e}")
            return False

    def sync_workflow(self, workflow_path: str):
        """
        Sync a single workflow to Kestra
        
        :param workflow_path: Path to workflow YAML file
        """
        if not self.validate_workflow(workflow_path):
            logger.warning(f"Skipping invalid workflow: {workflow_path}")
            return

        try:
            with open(workflow_path, 'r') as f:
                workflow_content = f.read()
            
            response = requests.post(
                f"{self.kestra_url}/api/v1/flows",
                headers=self.headers,
                data=workflow_content
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"Successfully synced workflow: {workflow_path}")
            else:
                logger.error(f"Failed to sync workflow {workflow_path}: {response.text}")
        
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
    # Configuration - replace with your actual Kestra details
    WORKFLOWS_DIR = '/path/to/kestra/workflows'
    KESTRA_URL = 'https://your-kestra-instance.com'
    API_KEY = 'your-api-key'

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
