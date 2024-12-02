#!/bin/bash

# Start Kestra
docker-compose -f docker-compose.yml up -d

# Start Supabase
docker-compose -f docker-compose.supabase.yml up -d

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
