-- Create the auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the oauth_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.oauth_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id text NOT NULL UNIQUE,
    provider_type text NOT NULL,
    provider_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert or update the Google provider configuration
INSERT INTO auth.oauth_providers (provider_id, provider_type, provider_details)
VALUES (
    'google',
    'oauth',
    jsonb_build_object(
        'client_id', '11503735689-id5eq8ac07erc1o64depen0bdjk9jbd6.apps.googleusercontent.com',
        'secret', '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',
        'redirect_uri', 'http://127.0.0.1:54321/auth/v1/callback'
    )
)
ON CONFLICT (provider_id) 
DO UPDATE SET 
    provider_details = EXCLUDED.provider_details,
    updated_at = now();
