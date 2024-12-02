# TaskWhiz - Automation Marketplace

## Project Overview
TaskWhiz is a marketplace for pre-built automation solutions, leveraging Kestra as the workflow orchestration platform.

### Tech Stack
- Frontend: Next.js 14
- Workflow Engine: Kestra
- Database: Supabase
- UI: ShadCN/UI + Tailwind CSS

## Project Structure
- `kestra/workflows/`: Kestra workflow definitions
- `resources/encoding-tables/`: Encoding-related binary resources
- `docs/`: Project documentation

## Development Setup

### Prerequisites
- Docker
- Python 3.8+
- Node.js 16+

### Local Development
1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```

3. Start local services:
   ```bash
   docker-compose up
   ```

### Workflow Synchronization
Use `workflow_sync.py` to sync workflows between local and Kestra instance:
```bash
python workflow_sync.py
```

## CI/CD Workflow Synchronization

### GitHub Actions Workflow
We use a comprehensive GitHub Actions workflow for Kestra workflow validation and deployment:

- **Triggers**: 
  - Runs on pushes to `main` branch
  - Triggered by changes in `kestra/workflows/` directory

- **Validation Steps**:
  1. Kestra Official Workflow Validation
  2. Custom Python Validation
   - Checks for required workflow keys
   - Ensures workflow structure integrity

- **Deployment**:
  - Deploys workflows to specified Kestra namespaces
  - Preserves existing flows

### Required Secrets
Configure the following GitHub Repository Secrets:
- `KESTRA_HOSTNAME`: Kestra instance URL
- `KESTRA_API_TOKEN`: Kestra API authentication token
- `SLACK_WEBHOOK`: (Optional) Slack notification webhook

### Local Development
To simulate CI/CD locally:
```bash
# Validate workflows
kestra flow validate kestra/workflows/

# Deploy workflows
kestra flow namespace update whiztask kestra/workflows/
```

## Troubleshooting
- Ensure Kestra instance is running
- Check `workflow_sync.log` for sync errors
- Verify workflow YAML validity

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and create a Pull Request

## License
[Insert License Information]
