# TaskWhiz - Kestra-Based Automation Marketplace

## Project Overview
TaskWhiz is a marketplace for pre-built automation solutions targeting users who understand automation's value but find existing tools overwhelming. Instead of building our own automation engine, we'll leverage Kestra as our workflow orchestration platform.

### Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│  Next.js 14     │ --> │    Kestra    │ --> │ Third-party   │
│  Frontend       │     │  Workflows   │     │ Services      │
└─────────────────┘     └──────────────┘     └───────────────┘
         │                      │
         │                      │
         ▼                      ▼
   ┌─────────────────────────────┐
   │         Supabase            │
   │ - User management          │
   │ - Marketplace data         │
   │ - Usage tracking           │
   └─────────────────────────────┘
```

### Technical Stack
- **Frontend**: Next.js 14+ with App Router
- **UI**: ShadCN/UI + Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Workflow Engine**: Kestra
- **Development**: Docker Compose for local services

### Core Components

#### 1. Frontend (Next.js)
- Modern, responsive UI
- Server-side rendering
- Type-safe API routes
- Real-time workflow status updates

#### 2. Kestra Integration
- Workflow definitions in YAML
- Event-driven triggers
- Built-in error handling and retries
- Visual workflow builder
- Version control integration

#### 3. Supabase
- User authentication
- Marketplace listings
- Usage tracking
- Workflow metadata storage

### Database Schema

#### Migration Files
Located in `supabase/migrations/`:
- `20240000000000_create_user_credentials.sql`: User credential management
- `20240000000001_create_billing_tables.sql`: Billing and usage tracking
- `20241202031013_add_kestra_columns.sql`: Kestra workflow and automation tables

#### Tables
```sql
# Existing tables
create table public.users (
  id uuid references auth.users primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.automations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  kestra_template_id text not null,
  pricing_type text not null,
  price decimal,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  category_id uuid references categories(id)
);

create table public.user_automations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  automation_id uuid references public.automations(id),
  kestra_flow_id text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

# New tables
create table public.user_credentials (
  -- User credential management
);

create table public.usage_metrics (
  -- Workflow execution tracking
);

create table public.billing_customers (
  -- Customer billing information
);

create table public.subscriptions (
  -- User subscription details
);
```

### Marketplace-Kestra Integration

#### Workflow Management
- All marketplace automations must have an associated Kestra workflow
- Workflows are stored in `kestra/workflows/` as YAML files
- Each workflow must follow the naming convention: `{category}-{name}.yml`
- Workflows must include proper input validation and error handling
- Workflows should use structured control flow (e.g., switch-case) for handling different processing types
- Error handling must be implemented at both the task and workflow level

#### Workflow Structure Guidelines
1. **Task Organization**
   - Use descriptive task names that reflect their purpose
   - Group related tasks logically using switch-case or sequential flows
   - Implement proper task dependencies and error handling

2. **Control Flow**
   - Use switch-case structures for handling different processing types
   - Each case should have well-defined tasks and error handling
   - Ensure proper nesting of tasks under control structures

3. **Error Handling**
   - Implement task-level error handling with retry mechanisms
   - Use workflow-level error handling for critical failures
   - Log appropriate error messages for debugging
   - Include cleanup tasks for failed workflows

#### Example Workflow Structure
```yaml
id: process-tasks
namespace: whiztask

tasks:
  - id: determine_task_type
    type: io.kestra.core.tasks.scripts.Python
    # Task implementation...

  - id: process_by_type
    type: io.kestra.core.tasks.flows.Switch
    value: "{{ outputs.determine_task_type.value }}"
    cases:
      FILE_PROCESSING:
        - id: process_file
          type: io.kestra.core.tasks.scripts.Shell
          # File processing implementation...
      
      DATA_TRANSFORMATION:
        - id: transform_data
          type: io.kestra.core.tasks.scripts.Python
          # Data transformation implementation...

  - id: update_status
    type: io.kestra.core.tasks.scripts.Python
    # Status update implementation...
```

#### Database Schema
The `automations` table links marketplace listings to Kestra workflows:
```sql
create table public.automations (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  kestra_template_id text not null,  -- Format: "{namespace}.{workflow_id}"
  pricing_type text not null,
  price decimal,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  category_id uuid references categories(id),
  creator_id uuid references public.users(id),
  status text not null default 'draft',  -- draft, published, archived
  configuration jsonb,  -- Workflow-specific configuration
  stats jsonb  -- Usage statistics and metrics
);

create table public.user_automations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  automation_id uuid references public.automations(id),
  kestra_flow_id text not null,  -- Unique instance ID for the user's flow
  status text not null,  -- active, paused, error
  configuration jsonb,  -- User's specific configuration
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

#### Workflow Lifecycle
1. **Creation**
   - Developer creates a Kestra workflow in `kestra/workflows/`
   - Workflow is tested and validated
   - Workflow is registered in Supabase with `kestra_template_id`

2. **Publication**
   - Automation is listed in marketplace
   - Users can view details and pricing
   - Setup wizard is configured based on workflow inputs

3. **Purchase & Instantiation**
   - User purchases automation
   - System creates a new instance of the Kestra workflow
   - Instance ID is stored in `user_automations.kestra_flow_id`
   - User configures their instance via setup wizard

4. **Monitoring & Management**
   - User can monitor workflow status
   - Pause, resume, or reconfigure their instance
   - View logs and performance metrics

#### Implementation Requirements
1. **Workflow Templates**
   - Must define all required inputs
   - Include proper error handling
   - Support pause/resume operations
   - Implement usage tracking

2. **Database Records**
   - Each marketplace automation must have valid `kestra_template_id`
   - `kestra_template_id` must match an existing workflow
   - Configuration schema must match workflow inputs

3. **API Integration**
   - Marketplace backend must validate workflow existence
   - Handle workflow instantiation for new purchases
   - Manage workflow lifecycle (pause, resume, delete)
   - Track usage and handle billing

4. **Error Handling**
   - Validate workflow existence before purchase
   - Handle workflow creation failures
   - Monitor for orphaned workflows
   - Provide clear error messages to users

### Development Scripts

#### Database Verification
`verify_database.py`:
- Checks Supabase database connection
- Validates existence of migration tables
- Confirms database connectivity

#### Workflow Synchronization
`sync_workflows.py`:
- Synchronizes Kestra workflow metadata with Supabase
- Extracts workflow information from YAML files
- Updates automations table with workflow details

### Development Setup

1. Clone the repository
```bash
git clone [repository-url]
cd whiztask-kestra
```

2. Install Python dependencies
```bash
pip3 install -r requirements.txt
```
3. Configure Environment Create a .env.local file with the following configurations:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Kestra Configuration
KESTRA_USERNAME=admin
KESTRA_PASSWORD=admin123
KESTRA_POSTGRES_USER=kestra
KESTRA_POSTGRES_PASSWORD=k3str4
KESTRA_POSTGRES_URL=jdbc:postgresql://postgres:5432/kestra
```

4. Start the services
```bash
docker-compose up -d
```

5. Verify the Database
```bash
python3 verify_database.py
```

6. Start the workflow sync script
```bash
python3 ./sync_workflows.py
```

The sync script automatically watches the `kestra/workflows` directory and syncs any changes to your Kestra instance. You don't need to manually copy/paste workflows or restart containers.

### Troubleshooting

1. Common Issues:
   - Ensure Supabase and Kestra Docker containers are running
   - Check `.env.local` for correct configuration
   - Verify network connectivity between services

### Future Improvements

1. Development Roadmap:
   - Implement frontend components for workflow marketplace
   - Enhance error handling and logging
   - Add more comprehensive testing

### Contributing

1. Process:
   - Fork the repository
   - Create a feature branch
   - Commit your changes
   - Push to the branch
   - Create a Pull Request

### Workflow Development Guidelines

#### Plugin Usage
When creating or modifying workflows, always use the latest plugin versions:

- For Python scripts: Use `io.kestra.plugin.scripts.python.Script`
- For Shell scripts: Use `io.kestra.plugin.scripts.shell.Commands` or `io.kestra.plugin.scripts.shell.Shell`
- Check the [Kestra Plugin Documentation](https://kestra.io/plugins/) for the latest versions
- Use the Plugin UI in Kestra to verify plugin availability and versions

Avoid using deprecated plugins like:
- `io.kestra.core.tasks.scripts.Python`
- `io.kestra.core.tasks.scripts.Bash`
- `io.kestra.core.tasks.scripts.Shell`

### Important URLs and Ports

#### Kestra
- UI: http://localhost:8080
- API: http://localhost:8080/api

### Database Access
- Host: localhost
- Port: 54322
- Database: postgres
- Username: postgres
- Password: postgres

### Stopping the Services
```bash
# Stop Kestra
docker-compose down
```

### Project Structure
```
src/
├── app/                    # Next.js app router pages
├── components/            # UI components
│   ├── ui/               # ShadcnUI components
│   ├── layout/           # Layout components
│   ├── auth/             # Auth components
│   └── marketing/        # Marketing components
└── kestra/               # Kestra integration
    ├── workflows/        # YAML workflow definitions
    ├── templates/        # Reusable workflow templates
    └── client/           # Kestra API client

docker-compose.yml         # Kestra service configuration
start-services.sh         # Script to start all services
```

### Available Services

#### 1. Kestra
- **URL**: http://localhost:8080
- **Purpose**: Workflow orchestration
- **Features**:
  - Visual workflow builder
  - Workflow execution monitoring
  - Error handling and retries
  - API for workflow management

#### 2. Next.js Development Server
- **URL**: http://localhost:3000
- **Features**:
  - Hot module reloading
  - API routes
  - Server components
  - Server actions

### Kestra Workflow Format
Workflows in Kestra are defined using YAML files with a specific structure. Here's the required format:

```yaml
id: workflow-name
namespace: whiztask  # or your preferred namespace

description: |
  A detailed description of what this workflow does.
  Can be multiple lines.

inputs:
  - id: input_parameter    # Use 'id' instead of 'name'
    type: STRING          # Types should be uppercase
    required: true
    description: "Description of the input parameter"

tasks:
  - id: task-name
    type: io.kestra.plugin.scripts.shell.Commands  # Preferred task type for scripts
    commands:
      - echo "Hello World"
```

#### Key Points for Workflow Files
1. **Input Parameters**:
   - Use `id` instead of `name` for input parameters
   - Use uppercase for parameter types
   - Valid types include: `STRING`, `INT`, `FLOAT`, `BOOLEAN`, `OBJECT`, `ARRAY`, `DATETIME`, `FILE`

2. **Task Types**:
   - For shell commands, use `io.kestra.plugin.scripts.shell.Commands`
   - For Python scripts, use `io.kestra.core.tasks.scripts.Python`
   - Each task must have a unique `id`

3. **Python Tasks**:
   - Python code must be specified under `inputFiles` with a `.py` file
   - Requirements can be specified in a `requirements.txt` file
   - Use `outputs` dictionary in Python code to pass data between tasks

4. **Variable Usage**:
   - Access input variables using `{{ inputs.input_name }}`
   - Access task outputs using `{{ outputs.task_id.output_name }}`

5. **Example Python Workflow**:
```yaml
id: data-processor
namespace: whiztask

description: |
  Process data using Python.

inputs:
  - id: data_url
    type: STRING
    required: true
    description: "URL of data to process"

tasks:
  - id: process_data
    type: io.kestra.core.tasks.scripts.Python
    inputFiles:
      requirements.txt: |
        pandas==2.0.0
        requests==2.31.0
      process.py: |
        import pandas as pd
        import requests
        
        # Get data from URL
        url = "{{ inputs.data_url }}"
        response = requests.get(url)
        data = pd.DataFrame(response.json())
        
        # Process data
        result = data.describe().to_dict()
        
        # Set outputs for next tasks
        outputs = {"statistics": result}
```

### Next Steps
1. [x] Set up new Next.js 14 project
2. [x] Configure ShadcnUI and Tailwind
3. [x] Port over UI components
4. [x] Set up Kestra in Docker
5. [x] Set up PostgreSQL in Docker
6. [ ] Create initial workflow templates
7. [ ] Implement workflow marketplace
8. [ ] Add usage tracking
9. [ ] Set up CI/CD pipeline

### Key Differences from Previous Approach
1. No custom provider implementations
2. Leverage Kestra's built-in integrations
3. Focus on workflow definitions rather than code
4. Visual workflow builder for marketplace items
5. Better separation of concerns

### Benefits of New Approach
1. Faster time to market
2. Reduced maintenance burden
3. Built-in monitoring and error handling
4. Visual workflow management
5. Scalable architecture

### WhizTask Integration Development Guide

## Overview

This guide provides instructions for developing integrations for the WhizTask marketplace using Kestra as the workflow engine. Our marketplace supports hundreds of automation workflows across various platforms and use cases.

## Integration Categories

### 1. Data Platforms
- Databases & Spreadsheets (Airtable, Google Sheets, Excel)
- Document Storage (Box, Dropbox, Google Drive)
- NoSQL & Low-Code (NocoDB, Airtable)

### 2. Business Tools
- CRM/ERP (Salesforce, HubSpot, Microsoft Dynamics)
- Project Management (Monday.com, Asana, Jira)
- Documentation (Notion, Google Docs, Microsoft Word)

### 3. Communication
- Team Chat (Slack, Microsoft Teams, Discord)
- Messaging (WhatsApp, Telegram)
- Social Media (LinkedIn, X, Facebook, Instagram)

### 4. Commerce & Finance
- eCommerce (Shopify, WooCommerce, Squarespace)
- Payment Processing (Stripe)
- Accounting (QuickBooks)

## Integration Methods

### 1. Native Kestra Plugin
Use when the platform is already supported by Kestra:

```yaml
tasks:
  - id: google-sheets-task
    type: io.kestra.plugin.googlesheets.Sheets
    credentials: "{{ inputs.google_credentials }}"
    spreadsheetId: "{{ inputs.spreadsheet_id }}"
```

### 2. Python Script Integration
Use for platforms without native Kestra support:

```yaml
tasks:
  - id: custom-integration
    type: io.kestra.plugin.scripts.python.Script
    script: |
      import platform_sdk
      
      # Initialize client
      client = platform_sdk.Client(
          api_key="{{ inputs.api_key }}"
      )
      
      # Perform operations
      result = client.do_something()
      
      # Output results as JSON
      print(json.dumps(result))
```

### 3. Web Automation
Use for platforms without APIs:

```yaml
tasks:
  - id: web-automation
    type: io.kestra.plugin.scripts.python.Script
    script: |
      from playwright.sync_api import sync_playwright
      
      with sync_playwright() as p:
          browser = p.chromium.launch()
          page = browser.new_page()
          # Perform web automation
```

## Authentication Handling

### 1. OAuth Flow
```yaml
inputs:
  - id: oauth_token
    type: STRING
    required: true
    description: "OAuth token from authentication flow"

tasks:
  - id: auth-check
    type: io.kestra.plugin.scripts.python.Script
    script: |
      import json
      from supabase import create_client
      
      # Verify and refresh token if needed
      supabase = create_client(url, key)
      result = supabase.table('user_credentials').select().execute()
```

### 2. API Keys
```yaml
inputs:
  - id: api_key
    type: STRING
    required: true
    description: "Platform API key"
    secret: true  # Marks as sensitive
```

## Best Practices

### 1. Error Handling
```python
try:
    result = api_call()
    print(json.dumps({"status": "success", "data": result}))
except Exception as e:
    print(json.dumps({
        "status": "error",
        "error": str(e),
        "type": e.__class__.__name__
    }))
    exit(1)
```

### 2. Rate Limiting
```python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=100, period=60)  # 100 calls per minute
def rate_limited_api_call():
    # API call implementation
```

### 3. Versioning
Include version information in your workflow:
```yaml
id: platform-integration
namespace: marketplace.integrations

labels:
  version: "1.0.0"
  platform: "notion"
  category: "productivity"
```

## Testing Requirements

1. **Unit Tests**
```python
def test_integration():
    # Test with mock credentials
    # Test error cases
    # Test rate limiting
```

2. **Integration Tests**
```yaml
triggers:
  - id: test-trigger
    type: io.kestra.plugin.core.trigger.Schedule
    cron: "*/5 * * * *"  # Test every 5 minutes
    disabled: true  # Enable only for testing
```

## Documentation Requirements

1. **Integration Metadata**
```yaml
description: |
  Integration Name: Notion
  Version: 1.0.0
  Category: Productivity
  
  Capabilities:
  - Feature 1
  - Feature 2
  
  Requirements:
  - API Key
  - Workspace ID
```

2. **Input Documentation**
```yaml
inputs:
  - id: parameter_name
    type: STRING
    required: true
    description: |
      Detailed description of the parameter
      - Format requirements
      - Example values
      - Usage notes
```

## Submission Process

1. Create integration in `integrations/<category>/<platform>/`
2. Include:
   - Workflow YAML
   - README.md with setup instructions
   - Test cases
   - Example configurations

## Example Integration

See `kestra/workflows/content_automation.yml` for a complete example showcasing:
- Multiple platform integration
- Authentication handling
- Error management
- Rate limiting
- Documentation standards

## Serverless Execution Strategy

TaskWhiz uses Google Cloud Run for serverless execution of marketplace integrations, providing cost-effective scaling while maintaining flexibility.

### Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│  Next.js 14     │ --> │    Kestra    │ --> │  Cloud Run    │
│  Frontend       │     │ Orchestrator │     │  Containers   │
└─────────────────┘     └──────────────┘     └───────────────┘
         │                      │                     │
         │                      │                     │
         ▼                      ▼                     ▼
   ┌─────────────────────────────────────────────────┐
   │                   Supabase                      │
   │ - User management  - Usage tracking             │
   │ - Marketplace data - Execution history          │
   └─────────────────────────────────────────────────┘
```

### Execution Model

1. **Workflow Definition**
```yaml
id: multi-step-automation
namespace: marketplace

errors:
  - id: on-failure
    type: io.kestra.core.tasks.scripts.Python
    inputFiles:
      main.py: |
        print(json.dumps({"status": "failed", "error": "{{ error }}" }))

tasks:
  - id: track-start
    type: io.kestra.core.tasks.scripts.Python
    env:
      EXECUTION_ID: "{{ execution.id }}"
    dockerOptions:
      image: gcr.io/whiztask/usage-tracker
      memory:
        limit: 134217728
        reservation: 67108864
      cpu: "0.1"
    inputFiles:
      main.py: |
        import os
        import json
        print(json.dumps({
            "execution_id": os.environ['EXECUTION_ID'],
            "start_time": "{{ now() }}"
        }))

  - id: extract-data
    type: io.kestra.core.tasks.scripts.Python
    env:
      SOURCE_API_KEY: "{{ inputs.source_api_key }}"
    dockerOptions:
      image: gcr.io/whiztask/data-extractor
      memory:
        limit: 268435456
        reservation: 134217728
      cpu: "0.2"
    requirements:
      - requests==2.31.0
    inputFiles:
      main.py: |
        import os
        import json
        import requests
        
        api_key = os.environ['SOURCE_API_KEY']
        result = {"data": "extracted"}
        print(json.dumps(result))

  - id: transform-data
    type: io.kestra.core.tasks.scripts.Python
    dockerOptions:
      memory:
        limit: 536870912
        reservation: 268435456
      cpu: "0.5"
    requirements:
      - pandas==2.0.0
    inputFiles:
      main.py: |
        import json
        import pandas as pd
        
        input_data = json.loads('''{{ outputs.extract-data.stdout }}''')
        result = {"data": "transformed"}
        print(json.dumps(result))

  - id: load-data
    type: io.kestra.core.tasks.scripts.Python
    env:
      DEST_API_KEY: "{{ inputs.destination_api_key }}"
    dockerOptions:
      image: gcr.io/whiztask/data-loader
      memory:
        limit: 268435456
        reservation: 134217728
      cpu: "0.2"
    inputFiles:
      main.py: |
        import os
        import json
        
        api_key = os.environ['DEST_API_KEY']
        input_data = json.loads('''{{ outputs.transform-data.stdout }}''')
        result = {"status": "loaded"}
        print(json.dumps(result))

  - id: track-end
    type: io.kestra.core.tasks.scripts.Python
    env:
      EXECUTION_ID: "{{ execution.id }}"
    dockerOptions:
      memory:
        limit: 134217728
        reservation: 67108864
      cpu: "0.1"
    inputFiles:
      main.py: |
        import os
        import json
        print(json.dumps({
            "execution_id": os.environ['EXECUTION_ID'],
            "end_time": "{{ now() }}",
            "status": "completed"
        }))
```

### Resource Management

```yaml
dockerOptions:
  memory:
    limit: "{{ inputs.memory_limit || '134217728' }}"
    reservation: "{{ inputs.memory_reservation || '67108864' }}"
  cpu: "{{ inputs.cpu_request || '0.1' }}"
  image: "gcr.io/whiztask/worker"
  pullPolicy: "IfNotPresent"
  networkMode: "bridge"
  volumes:
    - "/host/path:/container/path"
```

### Cost Structure

1. **Base Infrastructure**
- Kestra Orchestrator: ~$70/month
- State Management: ~$20/month
- API Gateway: ~$15/month
- Monitoring: ~$35/month

2. **Per-Execution Costs**
- Small Tasks (128MB, 30s): $0.000045/execution
- Medium Tasks (512MB, 60s): $0.00036/execution
- Large Tasks (1GB, 120s): $0.00144/execution

3. **Cost Optimization**
- No cold starts
- Pay per 100ms
- Auto-scaling to zero
- Resource-based billing

### Implementation Tasks

- [ ] Set up Cloud Run infrastructure
  - [ ] Create base container images
  - [ ] Configure auto-scaling
  - [ ] Set up monitoring

- [ ] Implement resource optimization
  - [ ] Dynamic resource allocation
  - [ ] Usage-based scaling
  - [ ] Cost tracking

- [ ] Create CI/CD pipeline
  - [ ] Container build automation
  - [ ] Version management
  - [ ] Deployment automation

## Self-Hosted Integration Support

TaskWhiz will support both platform-hosted and self-hosted integrations, allowing developers to monetize their existing automation scripts while maintaining control over their infrastructure.

### Developer Integration Process

1. **Script Adaptation**
   - Install TaskWhiz SDK
   - Wrap existing script with our standardized interface
   - Implement usage tracking (API calls, data processed, etc.)
   - Deploy to their own infrastructure

2. **Marketplace Integration**
   - Register script endpoint
   - Configure pricing model (subscription/usage-based)
   - Set resource limits and requirements
   - Enable revenue sharing

3. **Security & Monitoring**
   - API key authentication
   - Usage tracking and reporting
   - Health monitoring
   - Rate limiting

### Technical Requirements

#### 1. Developer SDK
- Script wrapper library
- Usage tracking utilities
- Standard input/output formatting
- Error handling

#### 2. Endpoint Management
- Endpoint validation system
- Health check monitoring
- Usage metrics collection
- Security verification

#### 3. Billing Integration
- Usage-based pricing support
- Revenue sharing calculation
- Payment processing
- Usage limits enforcement

### Implementation Tasks

- [ ] Create Developer SDK
  - [ ] Script wrapper library
  - [ ] Usage tracking utilities

### Design Implementation

#### Global Styling
- White background throughout the application (`globals.css`)
- Clean, professional appearance with consistent spacing
- Navbar transitions:
  - Initially transparent to blend with hero sections
  - Transitions to white with blur effect on scroll
  - Adds subtle border-bottom when scrolled

#### Marketplace Interface
- Consistent white background
- Top margin (5rem) to accommodate fixed navbar
- Grid layout for automation cards
- Category filters with subtle hover effects

#### Automation Cards
- Clean, professional design
- Creator information with avatar (proxied through `/api/avatar`)
- Key metrics displayed with icons
- Hover effects for better interactivity
- Price and action button prominently displayed

#### Navigation
- Fixed position with z-index to stay above content
- Transparent initially, transitions to white on scroll
- Subtle blur effect when scrolled
- Consistent spacing and typography

#### Avatar Implementation
- Proxied DiceBear avatars through Next.js API route
- Cached responses for better performance
- SVG format for crisp display at all sizes
- Fallback handling for failed loads

#### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Appropriate spacing at all breakpoints
- Optimized navigation for mobile devices

### Best Practices
- Consistent use of Tailwind classes
- Component-based architecture
- Type-safe props and interfaces
- Optimized image loading
- Server-side rendering where appropriate
- API route proxying for external services

## WhizTask Kestra Implementation Progress

## Current Status

### Working Components
- Basic Kestra setup with Docker is operational
- `document-processor.yml` workflow is successfully loading in Kestra UI
- Environment configuration in `application.yaml` is set up correctly
- All workflow files have proper read permissions

### Recent Changes
1. Removed `revision` field from all workflow files:
   - `document-processor.yml`
   - `email-lead-nurture.yml`
   - `social-analytics.yml`

2. File Structure:
   ```
   kestra/workflows/
   ├── document-processor.yml
   ├── email-lead-nurture.yml
   └── social-analytics.yml
   ```

### Current Blockers
1. **Workflow Loading Issues**:
   - Only `document-processor.yml` is visible in Kestra UI
   - `email-lead-nurture.yml` and `social-analytics.yml` still not appearing despite:
     - Removing the `revision` field
     - Ensuring proper YAML formatting
     - Restarting the Kestra server

2. **Validation Process**:
   - Need to implement proper workflow validation using Kestra CLI
   - Current attempt to validate workflows in Docker container unsuccessful
   - May need to mount workflows directory properly in Docker container

### Next Steps
1. **Implement Workflow Validation**:
   - Set up proper volume mounting for workflow files in Docker
   - Use Kestra CLI to validate workflows:
     ```bash
     ./kestra flow validate flows/ --server http://localhost:8080
     ```
   - Check for specific YAML validation errors

2. **Docker Container Setup**:
   - Verify Docker volume mappings in docker-compose.yml
   - Ensure workflows directory is properly mounted
   - Configure container to allow CLI access

3. **Workflow Structure Verification**:
   - Compare working workflow structure with Kestra examples
   - Verify all required fields are present
   - Check for any YAML formatting issues

4. **Documentation**:
   - Document validation process once established
   - Create workflow templates based on working examples
   - Document any specific Kestra YAML requirements

### Notes
- The `document-processor.yml` workflow can serve as a reference for correct YAML structure
- Kestra CLI validation will help identify specific issues in workflow files
- Consider implementing CI/CD pipeline for automated validation once basic setup is working
- Keep monitoring Kestra logs for detailed error messages

## Environment Setup
{{ ... }}
