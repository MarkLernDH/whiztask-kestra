-- Add pay-per-use pricing fields
ALTER TABLE automations
ADD COLUMN IF NOT EXISTS price_per_use DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_period TEXT CHECK (usage_period IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS usage_reset_frequency TEXT CHECK (usage_reset_frequency IN ('daily', 'weekly', 'monthly', 'yearly')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS overage_price_per_use DECIMAL(10,2) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN automations.price_per_use IS 'Cost per individual use of the automation';
COMMENT ON COLUMN automations.usage_limit IS 'Maximum number of uses allowed within the usage period';
COMMENT ON COLUMN automations.usage_period IS 'Time period for tracking usage (daily/weekly/monthly/yearly)';
COMMENT ON COLUMN automations.usage_reset_frequency IS 'How often the usage count resets';
COMMENT ON COLUMN automations.overage_price_per_use IS 'Cost per use when exceeding the usage limit';
