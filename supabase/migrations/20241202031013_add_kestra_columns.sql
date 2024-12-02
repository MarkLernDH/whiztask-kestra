-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Kestra-specific columns to automations table if they don't exist
DO $$ 
BEGIN
    -- Add kestra_namespace if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'automations' 
                  AND column_name = 'kestra_namespace') THEN
        ALTER TABLE public.automations ADD COLUMN kestra_namespace TEXT;
    END IF;

    -- Add kestra_flow_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'automations' 
                  AND column_name = 'kestra_flow_id') THEN
        ALTER TABLE public.automations ADD COLUMN kestra_flow_id TEXT;
    END IF;

    -- Add kestra_template_path if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'automations' 
                  AND column_name = 'kestra_template_path') THEN
        ALTER TABLE public.automations ADD COLUMN kestra_template_path TEXT;
    END IF;

    -- Add configuration_schema if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'automations' 
                  AND column_name = 'configuration_schema') THEN
        ALTER TABLE public.automations ADD COLUMN configuration_schema JSONB;
    END IF;
END $$;

-- Create user_automations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    automation_id UUID REFERENCES public.automations(id),
    configuration JSONB,
    kestra_execution_id TEXT,
    last_run_status TEXT,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);