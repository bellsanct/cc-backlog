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

1. **Fetch Projects**: Call BacklogMCP `get_project_list`
2. **Filter**: Apply `--active-only` filter if specified
3. **Format**: Display in requested format
4. **Usage Hint**: Show command hint for setting project

## Implementation

```python
# Fetch all projects
projects = call_mcp('backlog_get_project_list')

# Filter if requested
if get_flag('--active-only'):
    projects = [p for p in projects if not p.get('archived', False)]

# Format output
format_type = get_arg('--format', default='table')

if format_type == 'json':
    print(json.dumps(projects, indent=2))
else:
    display_projects_table(projects)
    print("\n💡 Use /bl:project-set <key> to set working project")
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

**BacklogMCP unavailable**:
```
❌ Error: BacklogMCP server not available
💡 Suggestion: Start BacklogMCP server
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
