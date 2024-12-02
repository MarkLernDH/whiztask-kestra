-- Add fields to better capture and present business problems
ALTER TABLE automations
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS business_problem TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS tools_integrated TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS use_cases TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_industry TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_time_saved_hours INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS common_pain_points TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_keywords TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS subcategory TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS setup_time_minutes INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_automations_category_id ON automations(category_id);
CREATE INDEX IF NOT EXISTS idx_automations_tools ON automations USING GIN (tools_integrated);
CREATE INDEX IF NOT EXISTS idx_automations_use_cases ON automations USING GIN (use_cases);
CREATE INDEX IF NOT EXISTS idx_automations_target_industry ON automations USING GIN (target_industry);
CREATE INDEX IF NOT EXISTS idx_automations_search_keywords ON automations USING GIN (search_keywords);
CREATE INDEX IF NOT EXISTS idx_automations_category ON automations (category);
CREATE INDEX IF NOT EXISTS idx_automations_subcategory ON automations (subcategory);

-- Add comments for clarity
COMMENT ON COLUMN automations.business_problem IS 'The specific business problem this automation solves';
COMMENT ON COLUMN automations.tools_integrated IS 'Array of tools and platforms this automation integrates with';
COMMENT ON COLUMN automations.use_cases IS 'Array of specific use cases this automation supports';
COMMENT ON COLUMN automations.target_industry IS 'Array of industries this automation is particularly useful for';
COMMENT ON COLUMN automations.estimated_time_saved_hours IS 'Estimated hours saved per month by implementing this automation';
COMMENT ON COLUMN automations.common_pain_points IS 'Array of common pain points this automation addresses';
COMMENT ON COLUMN automations.search_keywords IS 'Array of keywords to improve search discovery';
COMMENT ON COLUMN automations.category IS 'High-level category for the automation';
COMMENT ON COLUMN automations.subcategory IS 'More specific subcategory within the main category';
COMMENT ON COLUMN automations.setup_time_minutes IS 'Estimated time required to set up the automation';
COMMENT ON COLUMN automations.features IS 'JSON array of features included in the automation';
COMMENT ON COLUMN automations.price_monthly IS 'Monthly subscription price';
COMMENT ON COLUMN automations.price_yearly IS 'Annual subscription price';
