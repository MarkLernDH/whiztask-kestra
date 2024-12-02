'use client';

import { useState, useEffect } from 'react';

interface WorkflowInputs {
  user_id: string;
  google_sheets_id: string;
  sheet_name: string;
  topic_column: string;
  wordpress_url: string;
  wordpress_username: string;
  wordpress_password: string;
}

export function useKestraWorkflow(workflowId: string) {
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [executionId, setExecutionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (executionId && workflowStatus === 'running') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/kestra/executions/${executionId}`);
          const data = await response.json();
          
          if (data.state === 'COMPLETED') {
            setWorkflowStatus('completed');
            clearInterval(interval);
          } else if (data.state === 'FAILED') {
            setWorkflowStatus('failed');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Failed to check workflow status:', error);
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [executionId, workflowStatus]);

  const startWorkflow = async (config: { inputs: WorkflowInputs }) => {
    try {
      const response = await fetch('/api/kestra/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace: 'whiztask',
          flowId: workflowId,
          inputs: config.inputs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const data = await response.json();
      setExecutionId(data.id);
      setWorkflowStatus('running');
    } catch (error) {
      console.error('Failed to start workflow:', error);
      setWorkflowStatus('failed');
      throw error;
    }
  };

  return {
    workflowStatus,
    startWorkflow,
    executionId,
  };
}
