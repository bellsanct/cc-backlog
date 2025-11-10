# Context Directory

This directory stores persistent context and configuration for cc-backlog.

## Files

### Configuration Files

- `backlog-config.json` - Backlog API connection settings and preferences
  - Copy from `backlog-config.example.json` to get started
  - Configure your Backlog space and API key

- `workflow-config.json` - Workflow automation and priority algorithm settings
  - Copy from `workflow-config.example.json` to customize
  - Adjust priority weights and custom rules

### Runtime Context Files

These files are created automatically during usage:

- `backlog-project.json` - Current working project context (created by `/bl:project-set`)
- `current-issue.json` - Currently active issue (created by `/bl:issue-start`)
- `issue-cache.json` - Cached issue data for performance
- `prd-registry.json` - PRD tracking and Wiki sync status
- `session-history.json` - Command execution history

## Setup

1. Copy example files:
   ```bash
   cp backlog-config.example.json backlog-config.json
   cp workflow-config.example.json workflow-config.json
   ```

2. Edit `backlog-config.json`:
   - Set your `spaceKey`
   - Update `apiEndpoint`
   - Ensure `BACKLOG_API_KEY` environment variable is set

3. (Optional) Customize `workflow-config.json` to adjust task prioritization

## Security

- **Never commit** actual context files to version control
- `.gitignore` is configured to exclude all files except examples
- Store API keys in environment variables, never in JSON files
