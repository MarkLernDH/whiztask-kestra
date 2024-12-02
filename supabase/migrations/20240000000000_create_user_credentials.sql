create table public.user_credentials (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    provider text not null,
    access_token text not null,
    refresh_token text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, provider)
);
