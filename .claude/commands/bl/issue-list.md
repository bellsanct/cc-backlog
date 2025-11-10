# /bl:issue-list - List Issues with Filters

Display issues from the current project with optional filtering and sorting.

## Usage

```bash
/bl:issue-list [--status <status>] [--type <type>]
               [--assignee <user>] [--milestone <version>]
               [--priority <priority>] [--category <category>]
               [--sort <field>] [--limit <n>]
               [--format table|json|compact]
```

## Arguments

- `--status` (optional): Filter by status (Open, In Progress, Closed, etc.)
- `--type` (optional): Filter by issue type (Task, Bug, Feature, etc.)
- `--assignee` (optional): Filter by assignee (`me` for current user, or username)
- `--milestone` (optional): Filter by milestone/version
- `--priority` (optional): Filter by priority (High, Normal, Low)
- `--category` (optional): Filter by category
- `--sort` (optional): Sort by field (priority, created, updated, dueDate) - default: updated
- `--limit` (optional): Maximum number of results (default: 20)
- `--format` (optional): Output format (table, json, compact) - default: table

## Behavior

1. Build filter query from arguments
2. Call BacklogMCP `get_issues` with filters
3. Sort results
4. Format and display

## Implementation

```python
project = load_project_context()

# Build filter parameters
filters = {
    'projectId[]': [project['projectId']]
}

if has_arg('--status'):
    status_id = resolve_status(get_arg('--status'), project)
    filters['statusId[]'] = [status_id]

if has_arg('--type'):
    type_id = resolve_issue_type(get_arg('--type'), project)
    filters['issueTypeId[]'] = [type_id]

if has_arg('--assignee'):
    assignee_arg = get_arg('--assignee')
    if assignee_arg == 'me':
        current_user = call_mcp('backlog_get_myself')
        filters['assigneeId[]'] = [current_user['id']]
    else:
        assignee_id = resolve_user(assignee_arg)
        filters['assigneeId[]'] = [assignee_id]

if has_arg('--milestone'):
    milestone_id = resolve_version(get_arg('--milestone'), project)
    filters['milestoneId[]'] = [milestone_id]

if has_arg('--priority'):
    priority_id = resolve_priority(get_arg('--priority'), project)
    filters['priorityId[]'] = [priority_id]

if has_arg('--category'):
    category_id = resolve_category(get_arg('--category'), project)
    filters['categoryId[]'] = [category_id]

# Get issues
issues = call_mcp('backlog_get_issues', **filters)

# Sort
sort_field = get_arg('--sort', default='updated')
issues = sort_issues(issues, sort_field)

# Limit
limit = get_arg('--limit', default=20, type=int)
issues = issues[:limit]

# Format and display
format_type = get_arg('--format', default='table')

if format_type == 'json':
    print(json.dumps(issues, indent=2))
elif format_type == 'compact':
    display_compact(issues)
else:
    display_table(issues)
    print(f"\n💡 Use /bl:issue-start <key> to start working on an issue")
```

## Output Formats

### Table Format (Default)

```
📋 Issues (5 found, sorted by priority)
┌────────────┬──────────────────────────┬──────────┬──────────┬──────────┐
│ Key        │ Title                    │ Type     │ Priority │ Updated  │
├────────────┼──────────────────────────┼──────────┼──────────┼──────────┤
│ MYPRJ-123  │ Implement user auth      │ Feature  │ High     │ 2h ago   │
│ MYPRJ-125  │ Fix API endpoint         │ Bug      │ High     │ 1d ago   │
│ MYPRJ-130  │ Update documentation     │ Task     │ Normal   │ 3d ago   │
│ MYPRJ-128  │ Refactor database layer  │ Task     │ Low      │ 1w ago   │
│ MYPRJ-127  │ Add unit tests           │ Task     │ Low      │ 2w ago   │
└────────────┴──────────────────────────┴──────────┴──────────┴──────────┘

💡 Use /bl:issue-start <key> to start working on an issue
```

### Compact Format

```
📋 5 issues found:

🔴 MYPRJ-123: Implement user auth [Feature, High, 2h ago]
🔴 MYPRJ-125: Fix API endpoint [Bug, High, 1d ago]
🟡 MYPRJ-130: Update documentation [Task, Normal, 3d ago]
🟢 MYPRJ-128: Refactor database layer [Task, Low, 1w ago]
🟢 MYPRJ-127: Add unit tests [Task, Low, 2w ago]
```

### JSON Format

```json
[
  {
    "id": 98765,
    "issueKey": "MYPRJ-123",
    "summary": "Implement user authentication",
    "issueType": {"id": 3, "name": "Feature"},
    "status": {"id": 2, "name": "In Progress"},
    "priority": {"id": 2, "name": "High"},
    "assignee": {"id": 456, "name": "John Doe"},
    "updated": "2025-01-10T14:30:00Z"
  }
]
```

## Example Usage

**All open issues**:
```bash
/bl:issue-list --status Open
```

**My in-progress issues**:
```bash
/bl:issue-list --status "In Progress" --assignee me
```

**High priority bugs**:
```bash
/bl:issue-list --type Bug --priority High
```

**Issues for milestone**:
```bash
/bl:issue-list --milestone v1.0 --sort dueDate
```

**Compact view, top 10**:
```bash
/bl:issue-list --format compact --limit 10
```

## Related Commands

- `/bl:issue-create` - Create new issue
- `/bl:issue-start` - Start working on issue
- `/bl:next` - Get recommended next task
- `/bl:status` - Project status dashboard
