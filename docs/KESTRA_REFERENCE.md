# Kestra Flow Reference Guide

## Flow Properties

Kestra allows you to automate complex flows using a simple declarative interface. Flows are defined in YAML to keep the code portable and language-agnostic.

### Required Properties

A flow must have:
- `id`: Unique identifier within a namespace (immutable)
- `namespace`: Groups flows and provides structure (immutable)
- `tasks`: List of tasks to execute

### Optional Properties

- `revision`: Flow version (managed internally)
- `description`: Flow documentation
- `labels`: Key-value pairs for organization
- `inputs`: Strongly-typed inputs for dynamic flows
- `variables`: Reusable values across tasks
- `errors`: Error handling tasks
- `triggers`: Automatic execution triggers
- `pluginDefaults`: Default task values
- `disabled`: Temporarily stop executions
- `outputs`: Flow output definitions
- `concurrency`: Control parallel executions
- `retry`: Flow-level retry policy

## Task Properties

Every task has these core properties:

- `id`: Unique task identifier
- `type`: Full Java class name of task type
- `description`: Task documentation
- `retry`: Retry strategy configuration
- `timeout`: Maximum execution time
- `disabled`: Skip task if true
- `workerGroup`: Eligible worker groups
- `allowFailure`: Continue on failure if true
- `logLevel`: Log detail level
- `logToFile`: Store logs as files

## Best Practices and Common Issues

### Task Types and Plugin Support

1. **Preferred Task Types**:
   - Use `io.kestra.plugin.scripts.python.Script` for Python scripts
   - Avoid `io.kestra.plugin.scripts.shell.Shell` or `Commands` as they may not be available

2. **Python Scripts**:
   ```yaml
   - id: python_task
     type: io.kestra.plugin.scripts.python.Script
     script: |
       # Your Python code here
   ```

3. **Input Files (if needed)**:
   ```yaml
   - id: python_task
     type: io.kestra.plugin.scripts.python.Script
     inputFiles:
       requirements.txt: |
         requests==2.31.0
         pandas==2.0.3
   ```

### Notifications and Webhooks

1. **Prefer Python-based Notifications**:
   Instead of using specific notification plugins (which may not be available), use Python scripts:
   ```yaml
   - id: notify
     type: io.kestra.plugin.scripts.python.Script
     script: |
       import requests
       webhook_url = "{{ inputs.webhook_url }}"
       if webhook_url:
           requests.post(webhook_url, json={"status": "complete"})
   ```

### Error Handling

1. **Python Error Tasks**:
   ```yaml
   errors:
     - id: on_failure
       type: io.kestra.plugin.scripts.python.Script
       script: |
         print(f"Workflow failed: {{ error }}")
   ```

### YAML Syntax

1. **Common Issues**:
   - Proper indentation is crucial
   - Use `|` for multi-line scripts
   - Avoid mixing tabs and spaces

2. **Script Example**:
   ```yaml
   tasks:
     - id: process_data
       type: io.kestra.plugin.scripts.python.Script
       script: |
         import json
         data = {"key": "value"}
         print(json.dumps(data))
   ```

### Flow Management

1. **ID Conflicts**:
   - Flow IDs must be unique within a namespace
   - Use descriptive IDs following kebab-case: `email-processor`, `data-transformer`
   - When updating existing flows, use the update endpoint instead of create

2. **Namespace Organization**:
   - Group related flows in namespaces: `marketplace.data`, `marketplace.content`
   - Use consistent naming patterns across namespaces

## Docker Options Reference

When using Docker-based tasks, configure resources using:

```yaml
dockerOptions:
  memory:
    memory: "256MB"      # Maximum memory
    memoryReservation: "128MB"  # Minimum memory reservation
  cpu:
    cpus: 1  # Number of CPU cores (use whole numbers)
  image: "python:3.9"  # Specify Python version
```

## Templating Reference

Kestra uses Pebble templating for dynamic values:

### Common Expressions

- Flow: `{{ flow.id }}`, `{{ flow.namespace }}`
- Execution: `{{ execution.id }}`, `{{ execution.startDate }}`
- Task: `{{ task.id }}`, `{{ task.type }}`
- Variables: `{{ vars.my_variable }}`
- Inputs: `{{ inputs.myInput }}`
- Outputs: `{{ outputs.taskId.outputAttribute }}`
- Environment: `{{ envs.foo }}`
- Secrets: `{{ secret('MY_SECRET') }}`

## Plugin Best Practices

### Script Tasks

#### Python Scripts
```yaml
- id: python_task
  type: io.kestra.plugin.scripts.python.Script  # Preferred over deprecated io.kestra.core.tasks.scripts.Python
  inputFiles:
    main.py: |
      # Your Python code here
  dockerOptions:
    image: "python:3.9"  # Specify Python version
```

#### Shell Scripts
```yaml
# For multiple commands
- id: shell_commands
  type: io.kestra.plugin.scripts.shell.Commands  # For multiple shell commands
  commands:
    - echo "Step 1"
    - echo "Step 2"

# For single script
- id: shell_script
  type: io.kestra.plugin.scripts.shell.Shell  # Preferred over deprecated io.kestra.core.tasks.scripts.Shell
  script: |
    #!/bin/bash
    echo "Running script"
```

### Common Plugin Categories

1. **File Operations**
   - `io.kestra.plugin.fs.amazon.s3`: S3 operations
   - `io.kestra.plugin.fs.sftp`: SFTP operations
   - `io.kestra.plugin.fs.gcp`: GCP Storage operations

2. **Databases**
   - `io.kestra.plugin.jdbc.postgresql`: PostgreSQL operations
   - `io.kestra.plugin.jdbc.mysql`: MySQL operations
   - `io.kestra.plugin.elasticsearch`: Elasticsearch operations

3. **APIs and Services**
   - `io.kestra.plugin.notifications.discord`: Discord notifications
   - `io.kestra.plugin.notifications.slack`: Slack notifications
   - `io.kestra.plugin.notifications.email`: Email notifications

4. **Data Processing**
   - `io.kestra.plugin.serdes.json`: JSON processing
   - `io.kestra.plugin.serdes.csv`: CSV processing
   - `io.kestra.plugin.serdes.xml`: XML processing

### Plugin Configuration Tips

1. **Version Control**
   - Always specify plugin versions in task configurations when needed
   - Check for deprecated plugins in the Kestra UI
   - Use the Plugin UI to explore available options

2. **Resource Management**
   - Configure appropriate memory and CPU limits
   - Use environment variables for configuration
   - Handle sensitive data using Kestra secrets

3. **Error Handling**
   - Implement proper error handling in scripts
   - Use appropriate retry policies
   - Log meaningful error messages

## Example Flow

```yaml
id: example_flow
namespace: dev

description: Example flow with common patterns

labels:
  owner: team.name
  environment: dev

inputs:
  - id: data_date
    type: STRING
    required: true
    description: Date to process data for

variables:
  base_path: "/data/processing"
  
tasks:
  - id: process_data
    type: io.kestra.plugin.scripts.python.Script
    dockerOptions:
      memory:
        memory: "256MB"
        memoryReservation: "128MB"
      cpu:
        cpus: 1
      image: "python:3.9"
    inputFiles:
      main.py: |
        import os
        import json
        
        date = os.environ['DATA_DATE']
        print(json.dumps({"processed": True, "date": date}))
    env:
      DATA_DATE: "{{ inputs.data_date }}"

triggers:
  - id: schedule
    type: io.kestra.core.trigger.Schedule
    cron: "0 0 * * *"  # Daily at midnight
```

## Best Practices

1. Use descriptive IDs for flows and tasks
2. Document with markdown in descriptions
3. Use variables for reusable values
4. Configure appropriate resource limits
5. Handle errors gracefully
6. Use labels for organization
7. Set appropriate logging levels
8. Use pluginDefaults for common configurations

## Common Task Types

- Python Scripts: `io.kestra.plugin.scripts.python.Script`
- Shell Scripts: `io.kestra.plugin.scripts.shell.Shell`
- File Operations: `io.kestra.plugin.fs.*`
- Flow Control: `io.kestra.core.tasks.flows.*`
- Notifications: `io.kestra.plugin.notifications.*`

## Error Handling

```yaml
errors:
  - id: on_failure
    type: io.kestra.plugin.notifications.Teams
    url: "{{ secret('TEAMS_WEBHOOK') }}"
    message: "Flow {{ flow.id }} failed: {{ error }}"
```

## Resource Management

Memory specifications:
- Use string format with units: "128MB", "1GB"
- Always set both memory and memoryReservation
- Use whole numbers for CPU cores

## Environment Variables

Access environment variables using:
- `{{ envs.VARIABLE_NAME }}`
- For secrets: `{{ secret('SECRET_NAME') }}`

## Useful Links

- [Kestra Documentation](https://kestra.io/docs)
- [Task Reference](https://kestra.io/plugins)
- [Templates Guide](https://kestra.io/docs/developer-guide/variables)
