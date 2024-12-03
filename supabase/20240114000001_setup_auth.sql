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
-- Note: Actual credentials should be set via environment variables or secrets management
INSERT INTO auth.oauth_providers (provider_id, provider_type, provider_details)
VALUES (
    'google',
    'oauth',
    jsonb_build_object(
        'client_id', '${GOOGLE_OAUTH_CLIENT_ID}',
        'secret', '${GOOGLE_OAUTH_CLIENT_SECRET}',
        'redirect_uri', '${OAUTH_REDIRECT_URI}'
    )
)
ON CONFLICT (provider_id) 
DO UPDATE SET 
    provider_details = EXCLUDED.provider_details,
    updated_at = now();
