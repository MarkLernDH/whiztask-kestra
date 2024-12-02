'use client';

import { useState, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useGoogleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const signIn = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Store the credentials in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user found');
        }

        const { error } = await supabase
          .from('user_credentials')
          .upsert({
            user_id: user.id,
            provider: 'google',
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            expires_at: new Date(Date.now() + response.expires_in * 1000).toISOString(),
          }, {
            onConflict: 'user_id,provider'
          });

        if (error) {
          throw error;
        }

        setAccessToken(response.access_token);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to store Google credentials:', error);
        // Handle error appropriately
      }
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    flow: 'auth-code',
  });

  const listSheets = useCallback(async () => {
    if (!accessToken) return [];

    const response = await fetch(
      'https://sheets.googleapis.com/v4/spreadsheets',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.files;
  }, [accessToken]);

  const getSheetColumns = useCallback(async (sheetId: string) => {
    if (!accessToken) return [];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?includeGridData=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return data.sheets[0].data[0].rowData[0].values.map(
      (cell: any) => cell.formattedValue
    );
  }, [accessToken]);

  return {
    isAuthenticated,
    signIn,
    listSheets,
    getSheetColumns,
  };
}
