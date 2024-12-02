#!/bin/bash

# Install shadcn-ui CLI
pnpm add -D @shadcn/ui

# Initialize shadcn-ui
pnpm dlx shadcn-ui@latest init

# Add commonly used components
pnpm dlx shadcn-ui@latest add button
pnpm dlx shadcn-ui@latest add avatar
pnpm dlx shadcn-ui@latest add badge
pnpm dlx shadcn-ui@latest add card
pnpm dlx shadcn-ui@latest add carousel
pnpm dlx shadcn-ui@latest add dialog
pnpm dlx shadcn-ui@latest add dropdown-menu
pnpm dlx shadcn-ui@latest add form
pnpm dlx shadcn-ui@latest add input
pnpm dlx shadcn-ui@latest add select
pnpm dlx shadcn-ui@latest add separator
pnpm dlx shadcn-ui@latest add table
pnpm dlx shadcn-ui@latest add tabs
pnpm dlx shadcn-ui@latest add textarea
