-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.providers (
    id text PRIMARY KEY,
    enabled boolean DEFAULT false,
    client_id text,
    client_secret text,
    redirect_uri text,
    additional_redirect_uris text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert or update Google provider
INSERT INTO auth.providers (id, enabled, client_id, client_secret, redirect_uri, additional_redirect_uris)
VALUES (
    'google',
    true,
    current_setting('app.settings.google_client_id', true),
    current_setting('app.settings.google_client_secret', true),
    'http://localhost:3000/auth/callback',
    ARRAY['http://127.0.0.1:54321/auth/v1/callback']
)
ON CONFLICT (id) DO UPDATE
SET
    enabled = true,
    client_id = current_setting('app.settings.google_client_id', true),
    client_secret = current_setting('app.settings.google_client_secret', true),
    redirect_uri = 'http://localhost:3000/auth/callback',
    additional_redirect_uris = ARRAY['http://127.0.0.1:54321/auth/v1/callback'],
    updated_at = timezone('utc'::text, now());
