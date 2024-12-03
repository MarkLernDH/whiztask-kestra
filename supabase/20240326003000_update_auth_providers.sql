-- Update Google provider settings
UPDATE auth.providers
SET
    enabled = true,
    client_id = '11503735689-id5eq8ac07erc1o64depen0bdjk9jbd6.apps.googleusercontent.com',
    client_secret = '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',
    redirect_uri = 'http://127.0.0.1:54331/auth/v1/callback',
    additional_redirect_uris = ARRAY[
        'http://127.0.0.1:3000/auth/callback',
        'http://localhost:3000/auth/callback',
        'http://127.0.0.1:54331/auth/v1/callback'
    ],
    updated_at = timezone('utc'::text, now())
WHERE id = 'google';
