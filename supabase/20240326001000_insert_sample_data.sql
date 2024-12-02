-- Insert sample categories if they don't exist
INSERT INTO categories (name, slug, description, icon)
VALUES 
    ('Email Automation', 'email-automation', 'Automate your email workflows and communications', 'mail'),
    ('Document Processing', 'document-processing', 'Automate document handling and processing tasks', 'file-text'),
    ('Data Integration', 'data-integration', 'Connect and sync data between different systems', 'database'),
    ('Sales & Marketing', 'sales-marketing', 'Automate your sales and marketing workflows', 'trending-up'),
    ('Customer Support', 'customer-support', 'Enhance customer support with automation', 'headphones'),
    ('Social Media', 'social-media', 'Automate your social media management tasks', 'share')
ON CONFLICT (slug) DO NOTHING;

-- Insert automations
INSERT INTO automations (
    category_id,
    name,
    slug,
    description,
    business_problem,
    tools_integrated,
    use_cases,
    target_industry,
    estimated_time_saved_hours,
    common_pain_points,
    search_keywords,
    category,
    subcategory,
    setup_time_minutes,
    complexity_level,
    features,
    price_monthly,
    price_yearly
) VALUES 
(
    (SELECT id FROM categories WHERE slug = 'data-integration'),
    'Amazon Sales Data Sync',
    'amazon-sales-sync',
    'Get your Amazon seller metrics automatically updated in Google Sheets every morning',
    'Manual data entry and reporting from Amazon Seller Central is time-consuming and error-prone',
    ARRAY['Amazon Seller Central', 'Google Sheets', 'Google Data Studio'],
    ARRAY['Sales Reporting', 'Inventory Management', 'Performance Analytics'],
    ARRAY['E-commerce', 'Retail', 'Small Business'],
    10,
    ARRAY['Time-consuming manual data entry', 'Delayed reporting', 'Data accuracy issues'],
    ARRAY['amazon data', 'seller central', 'google sheets', 'sales dashboard', 'automation'],
    'Data Integration',
    'E-commerce Analytics',
    15,
    'beginner',
    '["Automatic daily sync", "Pre-built dashboards", "Custom metrics", "Error alerts"]'::jsonb,
    29.99,
    299.99
),
(
    (SELECT id FROM categories WHERE slug = 'document-processing'),
    'Invoice Data Extractor',
    'invoice-data-extractor',
    'Extract key information from invoices and automatically input into your accounting system',
    'Manual data entry of invoices is time-consuming and error-prone',
    ARRAY['OCR API', 'QuickBooks', 'Xero'],
    ARRAY['Invoice Processing', 'Data Entry', 'Accounting'],
    ARRAY['Finance', 'Accounting', 'Professional Services'],
    15,
    ARRAY['Data entry errors', 'Time-consuming manual work', 'Lost invoices'],
    ARRAY['invoice processing', 'OCR', 'data entry', 'accounting'],
    'Document Processing',
    'Financial Documents',
    30,
    'easy',
    '["OCR extraction", "Accounting integration", "Error detection"]'::jsonb,
    49.99,
    499.99
);
