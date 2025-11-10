# /bl:project-set - Set Working Project Context

Set the current working Backlog project for all subsequent commands.

## Usage

```bash
/bl:project-set <project_key_or_name> [--space <space_key>]
```

## Arguments

- `<project_key_or_name>` (required): Project key (e.g., MYPRJ) or project name to search
- `--space <space_key>` (optional): Backlog space key for multi-space environments

## Behavior

1. **Fetch Projects**: Call BacklogMCP `get_project_list` to retrieve all accessible projects
2. **Match Project**:
   - Exact match on project key (case-insensitive)
   - If no exact match, fuzzy match on project name
   - If multiple matches, present interactive selection
3. **Fetch Metadata**: Call BacklogMCP `get_project` to get detailed project information
4. **Save Context**: Write to `.claude/context/backlog-project.json`:
   ```json
   {
     "projectId": 12345,
     "projectKey": "MYPRJ",
     "projectName": "My Project",
     "spaceKey": "my-space",
     "spaceUrl": "https://my-space.backlog.com",
     "setAt": "2025-01-10T12:00:00Z",
     "metadata": {
       "issueCount": { "open": 45, "inProgress": 35, "closed": 120 },
       "memberCount": 8,
       "categories": [...],
       "versions": [...],
       "issueTypes": [...],
       "statuses": [...],
       "priorities": [...]
     },
     "lastSync": "2025-01-10T12:00:00Z"
   }
   ```
5. **Display Summary**: Show project details and confirmation

## Implementation

### Step 1: Check if BacklogMCP is available
```python
# Check if BacklogMCP tools are accessible
if not mcp_available('backlog_get_project_list'):
    error("BacklogMCP server not available. Please check configuration.")
    return
```

### Step 2: Fetch project list
```python
# Call BacklogMCP to get all projects
projects = call_mcp('backlog_get_project_list')

# Parse arguments
project_input = args[0] if args else prompt("Enter project key or name: ")
space_key = get_arg('--space', optional=True)
```

### Step 3: Match project
```python
# Try exact key match first
matched = [p for p in projects if p['projectKey'].upper() == project_input.upper()]

if not matched:
    # Try fuzzy name match
    matched = [p for p in projects if project_input.lower() in p['name'].lower()]

if len(matched) == 0:
    error(f"No project found matching '{project_input}'")
    # Show available projects
    display_projects(projects)
    return
elif len(matched) > 1:
    # Interactive selection
    selected = prompt_selection("Multiple projects found:", matched)
    matched = [selected]

project = matched[0]
```

### Step 4: Fetch detailed metadata
```python
# Get full project details
project_detail = call_mcp('backlog_get_project', projectIdOrKey=project['projectKey'])

# Enrich with metadata
metadata = {
    'issueCount': calculate_issue_counts(project_detail),
    'memberCount': len(project_detail.get('users', [])),
    'categories': project_detail.get('issueTypes', []),
    'versions': project_detail.get('versions', []),
    'issueTypes': project_detail.get('issueTypes', []),
    'statuses': project_detail.get('statuses', []),
    'priorities': project_detail.get('priorities', [])
}
```

### Step 5: Save context
```python
# Prepare context object
context = {
    'projectId': project_detail['id'],
    'projectKey': project_detail['projectKey'],
    'projectName': project_detail['name'],
    'spaceKey': space_key or extract_space_from_url(project_detail),
    'spaceUrl': construct_space_url(project_detail),
    'setAt': now_iso8601(),
    'metadata': metadata,
    'lastSync': now_iso8601()
}

# Write to file
write_json('.claude/context/backlog-project.json', context)
```

### Step 6: Display output
```python
print(f"""
✅ Project set: {context['projectKey']} - {context['projectName']}
📊 Issues: {metadata['issueCount']['open']} open, {metadata['issueCount']['closed']} closed
👥 Members: {metadata['memberCount']}
📍 Context saved to .claude/context/backlog-project.json
""")
```

## Error Handling

**No projects accessible**:
```
❌ Error: No Backlog projects found
💡 Suggestion: Check your API key permissions
📚 Documentation: See docs/setup.md for BacklogMCP configuration
```

**Project not found**:
```
❌ Error: Project 'INVALID' not found
💡 Available projects:
  - MYPRJ: My Project
  - DEMO: Demo Project
Use /bl:project-list to see all projects
```

**API error**:
```
❌ Error: Failed to fetch project details
💡 Suggestion: Check BacklogMCP server status and API key
🔗 BacklogMCP logs: Check MCP server output
```

## Example Usage

**Basic usage**:
```bash
/bl:project-set MYPRJ
```

**With space specification**:
```bash
/bl:project-set MYPRJ --space my-space
```

**Fuzzy name search**:
```bash
/bl:project-set "My Project"
```

## Output Example

```
✅ Project set: MYPRJ - My Project
📊 Issues: 45 open, 120 closed
👥 Members: 8
🏷️ Categories: Feature, Bug, Task
📅 Versions: v1.0, v1.1, v2.0-beta
📍 Context saved to .claude/context/backlog-project.json
```

## Related Commands

- `/bl:project-list` - List all available projects
- `/bl:project-info` - Show detailed current project information
- `/bl:sync` - Sync project metadata with Backlog

## Notes

- Context is persistent across Claude Code sessions
- Changing projects will not affect currently open issues
- Use `/bl:project-info` to verify current project at any time
