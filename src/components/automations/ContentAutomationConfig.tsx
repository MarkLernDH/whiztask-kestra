'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useKestraWorkflow } from '@/hooks/useKestraWorkflow';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function ContentAutomationConfig({ automationId }: { automationId: string }) {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isAuthenticated: isGoogleAuthed,
    signIn: googleSignIn,
    listSheets,
    getSheetColumns 
  } = useGoogleAuth();

  const { 
    startWorkflow,
    workflowStatus
  } = useKestraWorkflow('content-automation');

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (isGoogleAuthed) {
      loadSheets();
    }
  }, [isGoogleAuthed]);

  const loadSheets = async () => {
    try {
      setIsLoading(true);
      const sheetsList = await listSheets();
      setSheets(sheetsList);
    } catch (error) {
      console.error('Failed to load sheets:', error);
      setError('Failed to load Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetSelect = async (sheetId: string) => {
    try {
      setIsLoading(true);
      setSelectedSheet(sheetId);
      const columns = await getSheetColumns(sheetId);
      setSheetColumns(columns);
    } catch (error) {
      console.error('Failed to load sheet columns:', error);
      setError('Failed to load sheet columns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAutomation = async () => {
    if (!selectedSheet || !selectedColumn) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Start the Kestra workflow with the configured parameters
      await startWorkflow({
        inputs: {
          user_id: user.id,
          google_sheets_id: selectedSheet,
          sheet_name: sheets.find(s => s.id === selectedSheet)?.name || '',
          topic_column: selectedColumn,
          wordpress_url: process.env.NEXT_PUBLIC_WORDPRESS_URL || '',
          wordpress_username: process.env.NEXT_PUBLIC_WORDPRESS_USERNAME || '',
          wordpress_password: process.env.NEXT_PUBLIC_WORDPRESS_PASSWORD || '',
        }
      });
    } catch (error) {
      console.error('Failed to start workflow:', error);
      setError('Failed to start the automation workflow');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Configure Content Automation</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {!isGoogleAuthed ? (
        <Button 
          onClick={() => googleSignIn()}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Connect Google Sheets'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Google Sheet
            </label>
            <select 
              className="w-full p-2 border rounded"
              onChange={(e) => handleSheetSelect(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select a sheet...</option>
              {sheets.map(sheet => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>

          {sheetColumns.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Topics Column
              </label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => setSelectedColumn(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select a column...</option>
                {sheetColumns.map(column => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedSheet && selectedColumn && (
            <Button 
              onClick={handleStartAutomation}
              disabled={isLoading || workflowStatus === 'running'}
              className="w-full"
            >
              {isLoading ? 'Starting...' : workflowStatus === 'running' ? 'Running...' : 'Start Automation'}
            </Button>
          )}

          {workflowStatus && (
            <div className="mt-4">
              <h3 className="font-medium">Status: {workflowStatus}</h3>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
