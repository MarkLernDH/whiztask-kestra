-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_automations;
DROP TABLE IF EXISTS public.automations;
DROP TABLE IF EXISTS public.categories;

-- Create tables
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  kestra_template_id TEXT NOT NULL,
  pricing_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  creator_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  configuration JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Add compatibility with existing schema
  category TEXT,
  difficulty_level TEXT,
  kestra_namespace TEXT,
  kestra_flow_id TEXT,
  kestra_template_path TEXT,
  configuration_schema JSONB
);

CREATE TABLE public.user_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  automation_id UUID REFERENCES public.automations(id),
  status TEXT NOT NULL DEFAULT 'active',
  configuration JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create categories
INSERT INTO public.categories (id, name, description) VALUES
  ('c1b1b3e0-0b1a-4e1a-9e1a-0b1a4e1a9e1a', 'Email Marketing', 'Email automation and marketing tools'),
  ('c2b2b3e0-0b2a-4e2a-9e2a-0b2a4e2a9e2a', 'Document Processing', 'Document analysis and management tools'),
  ('c3b3b3e0-0b3a-4e3a-9e3a-0b3a4e3a9e3a', 'Social Media', 'Social media management and analytics');

-- Insert new automations
INSERT INTO public.automations (
  id,
  title,
  description,
  kestra_template_id,
  pricing_type,
  price,
  category_id,
  creator_id,
  status,
  configuration,
  stats,
  -- Add compatibility with existing schema
  category,
  kestra_namespace,
  kestra_flow_id,
  kestra_template_path
) VALUES
(
  'a1b1b3e0-0b1a-4e1a-9e1a-0b1a4e1a9e1a',
  'Smart Lead Nurturing',
  'Automatically nurture leads with personalized email sequences based on their behavior and source. Perfect for sales teams and marketers looking to convert more leads with less effort.',
  'marketplace.email/email-lead-nurture',
  'monthly',
  29.99,
  'c1b1b3e0-0b1a-4e1a-9e1a-0b1a4e1a9e1a',
  '00000000-0000-0000-0000-000000000000',
  'published',
  jsonb_build_object(
    'required_inputs', jsonb_build_array(
      'smtp_host',
      'smtp_port',
      'smtp_username',
      'smtp_password'
    ),
    'optional_inputs', jsonb_build_array(
      'lead_data'
    )
  ),
  jsonb_build_object(
    'avg_response_rate', 0.35,
    'avg_setup_time', 10,
    'total_leads_processed', 1500
  ),
  'Email Marketing',
  'marketplace.email',
  'email-lead-nurture',
  'kestra/workflows/email-lead-nurture.yml'
),
(
  'a2b2b3e0-0b2a-4e2a-9e2a-0b2a4e2a9e2a',
  'Intelligent Document Processor',
  'Transform your document management with AI-powered processing. Extract text, generate summaries, and organize files automatically with metadata and cloud storage integration.',
  'marketplace.documents/document-processor',
  'monthly',
  49.99,
  'c2b2b3e0-0b2a-4e2a-9e2a-0b2a4e2a9e2a',
  '00000000-0000-0000-0000-000000000000',
  'published',
  jsonb_build_object(
    'required_inputs', jsonb_build_array(
      'openai_api_key',
      'output_bucket'
    ),
    'optional_inputs', jsonb_build_array(
      'min_confidence'
    )
  ),
  jsonb_build_object(
    'avg_processing_time', 45,
    'accuracy_rate', 0.95,
    'documents_processed', 10000
  ),
  'Document Processing',
  'marketplace.documents',
  'document-processor',
  'kestra/workflows/document-processor.yml'
),
(
  'a3b3b3e0-0b3a-4e3a-9e3a-0b3a4e3a9e3a',
  'Social Media Performance Analyzer',
  'Get actionable insights from your social media presence. Track engagement, analyze trends, and receive beautiful reports with recommendations for improvement.',
  'marketplace.social/social-analytics',
  'monthly',
  39.99,
  'c3b3b3e0-0b3a-4e3a-9e3a-0b3a4e3a9e3a',
  '00000000-0000-0000-0000-000000000000',
  'published',
  jsonb_build_object(
    'required_inputs', jsonb_build_array(
      'platforms',
      'report_period',
      'notification_email'
    ),
    'optional_inputs', jsonb_build_array(
      'twitter_token',
      'linkedin_token',
      'instagram_token'
    )
  ),
  jsonb_build_object(
    'platforms_supported', 3,
    'avg_insights_per_report', 15,
    'reports_generated', 5000
  ),
  'Social Media',
  'marketplace.social',
  'social-analytics',
  'kestra/workflows/social-analytics.yml'
);
