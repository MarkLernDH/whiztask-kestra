-- Create pricing tiers table
CREATE TABLE pricing_tiers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    automation_id UUID REFERENCES automations(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    interval TEXT NOT NULL CHECK (interval IN ('one_time', 'monthly', 'yearly')),
    usage_limit INTEGER, -- NULL means unlimited
    features JSONB NOT NULL DEFAULT '[]',
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing tiers"
    ON pricing_tiers FOR SELECT
    TO PUBLIC
    USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pricing_tiers_updated_at
    BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Remove old price columns from automations
ALTER TABLE automations 
DROP COLUMN price_monthly,
DROP COLUMN price_yearly;

-- Add comment
COMMENT ON TABLE pricing_tiers IS 'Pricing tiers for automations, supporting both usage-based and subscription pricing';
