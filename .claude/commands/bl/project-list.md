# /bl:project-list - List Available Projects

Display all Backlog projects accessible with current API credentials.

## Usage

```bash
/bl:project-list [--active-only] [--format table|json]
```

## Arguments

- `--active-only` (optional): Show only non-archived projects
- `--format` (optional): Output format (default: table)
  - `table`: Human-readable table format
  - `json`: Machine-readable JSON output

## Behavior

1. **Fetch Projects**: Call Backlog API `/api/v2/projects`
2. **Filter**: Apply `--active-only` filter if specified
3. **Format**: Display in requested format
4. **Usage Hint**: Show command hint for setting project

## Implementation

```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv } = require('../../../lib/utils');

const config = loadEnv();
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});

// Fetch all projects
const projects = await backlog.getProjects();

// Filter if requested
const activeOnly = getFlag('--active-only');
const filteredProjects = activeOnly
  ? projects.filter(p => !p.archived)
  : projects;

// Format output
const formatType = getArg('--format', { default: 'table' });

if (formatType === 'json') {
  console.log(JSON.stringify(filteredProjects, null, 2));
} else {
  displayProjectsTable(filteredProjects);
  console.log("\n💡 Use /bl:project-set <key> to set working project");
}
```

## Output Formats

### Table Format (Default)

```
Available Projects:
┌──────────┬─────────────────┬─────────┬────────┐
│ Key      │ Name            │ Issues  │ Status │
├──────────┼─────────────────┼─────────┼────────┤
│ MYPRJ    │ My Project      │ 165     │ Active │
│ DEMO     │ Demo Project    │ 23      │ Active │
│ ARCHIVE  │ Old Project     │ 450     │ Closed │
└──────────┴─────────────────┴─────────┴────────┘

💡 Use /bl:project-set <key> to set working project
```

### JSON Format

```json
[
  {
    "id": 12345,
    "projectKey": "MYPRJ",
    "name": "My Project",
    "archived": false,
    "issueCount": 165
  },
  {
    "id": 12346,
    "projectKey": "DEMO",
    "name": "Demo Project",
    "archived": false,
    "issueCount": 23
  }
]
```

## Error Handling

**No projects found**:
```
❌ Error: No Backlog projects accessible
💡 Suggestion: Check API key permissions
📚 Documentation: Backlog API requires project access permissions
```

**API connection error**:
```
❌ Error: Failed to connect to Backlog API
💡 Suggestion: Check BACKLOG_SPACE_KEY and BACKLOG_API_KEY in .env
📚 Documentation: See docs/setup.md
```

## Example Usage

**List all projects**:
```bash
/bl:project-list
```

**Active projects only**:
```bash
/bl:project-list --active-only
```

**JSON output**:
```bash
/bl:project-list --format json
```

## Related Commands

- `/bl:project-set` - Set working project
- `/bl:project-info` - Show current project details
