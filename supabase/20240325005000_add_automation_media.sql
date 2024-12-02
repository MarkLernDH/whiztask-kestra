-- Add media support to automations
ALTER TABLE automations
ADD COLUMN featured_image TEXT NOT NULL DEFAULT 'https://placehold.co/600x400',
ADD COLUMN media JSONB NOT NULL DEFAULT '[]';

-- Add comment explaining the media column structure
COMMENT ON COLUMN automations.media IS 'Array of media items: [{"type": "image"|"video", "url": string, "title": string, "description": string}]';
