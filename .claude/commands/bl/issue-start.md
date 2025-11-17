# /bl:issue-start - Start Working on Issue

Mark an issue as "In Progress" and set as current working issue.

## Usage

```bash
/bl:issue-start <issue_key> [--comment <comment>] [--assignee-me]
```

## Arguments

- `<issue_key>` (required): Issue key (e.g., MYPRJ-123)
- `--comment` (optional): Comment to add when starting work
- `--assignee-me` (optional): Assign issue to current user

## Behavior

1. **Fetch Issue**: Get issue details via Backlog API `/api/v2/issues/:issueIdOrKey`
2. **Validate Status**: Check if status transition is allowed
3. **Update Status**: Change status to "In Progress" via Backlog API PATCH `/api/v2/issues/:issueIdOrKey`
4. **Assign**: Assign to current user if `--assignee-me`
5. **Add Comment**: Add comment if `--comment` specified via POST `/api/v2/issues/:issueIdOrKey/comments`
6. **Save Context**: Write to `.claude/context/current-issue.json`
7. **Display**: Show start confirmation

## Implementation

```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv } = require('../../../lib/utils');

const config = loadEnv();
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});

// Parse arguments
const issueKey = args[0] || error("Issue key required");
const commentText = getArg('--comment');
const assignToMe = getFlag('--assignee-me');

// Load project context
const project = loadProjectContext();
if (!project) {
  error("No project set");
  return;
}

// Fetch issue
const issue = await backlog.getIssue(issueKey);
if not issue:
    error(f"Issue {issue_key} not found")
    return

# Check current status
current_status = issue['status']['name']
allowed_transitions = get_allowed_transitions(current_status, project)

if "In Progress" not in allowed_transitions:
    error(f"Cannot transition from '{current_status}' to 'In Progress'")
    print(f"💡 Allowed transitions: {', '.join(allowed_transitions)}")
    return

# Find "In Progress" status ID
in_progress_status = find_status_by_name("In Progress", project['metadata']['statuses'])
if not in_progress_status:
    error("'In Progress' status not found in project")
    return

# Prepare update
update_params = {
    'issueIdOrKey': issue_key,
    'statusId': in_progress_status['id']
}

# Assign to current user if requested
if assign_to_me:
    current_user = call_mcp('backlog_get_myself')
    update_params['assigneeId'] = current_user['id']

// Update issue
const updatedIssue = await backlog.updateIssue(issueKey, updateParams);

// Add comment if provided
if (commentText) {
  await backlog.addIssueComment(issueKey, { content: commentText });
}

# Save to current issue context
current_issue_data = {
    'issueKey': updated_issue['issueKey'],
    'issueId': updated_issue['id'],
    'title': updated_issue['summary'],
    'issueType': updated_issue['issueType']['name'],
    'status': updated_issue['status']['name'],
    'priority': updated_issue['priority']['name'],
    'assignee': updated_issue.get('assignee'),
    'startedAt': now_iso8601(),
    'milestone': updated_issue.get('milestone'),
    'category': updated_issue.get('category'),
    'url': f"{project['spaceUrl']}/view/{updated_issue['issueKey']}",
    'estimatedHours': updated_issue.get('estimatedHours'),
    'actualHours': updated_issue.get('actualHours'),
    'notes': ''
}

write_json('.claude/context/current-issue.json', current_issue_data)

# Display result
print(f"""
🚀 Started: {updated_issue['issueKey']} - {updated_issue['summary']}
📊 Status: {current_status} → In Progress
👤 Assignee: {updated_issue.get('assignee', {}).get('name', '(none)')}
""")

if comment_text:
    print(f"💬 Comment added: \"{comment_text}\"")

print(f"""
⏰ Started at: {format_time(current_issue_data['startedAt'])}

📍 Current issue saved to .claude/context/current-issue.json
""")

# Update cache
update_issue_cache(updated_issue)
```

## Status Transition Rules

Status transitions are configured in `.claude/context/workflow-config.json`:

```json
{
  "statusTransitions": {
    "Open": ["In Progress", "Closed"],
    "In Progress": ["Resolved", "Open", "Closed"],
    "Resolved": ["Closed", "In Progress"],
    "Closed": ["Open"]
  }
}
```

If the project uses custom statuses, the command will adapt based on project metadata.

## Error Handling

**Issue not found**:
```
❌ Error: Issue MYPRJ-999 not found
💡 Use /bl:issue-list to see available issues
```

**Invalid status transition**:
```
❌ Error: Cannot transition from 'Closed' to 'In Progress'
💡 Allowed transitions: Open
📚 Status workflow: See .claude/context/workflow-config.json
```

**Already in progress**:
```
⚠️ Warning: Issue MYPRJ-123 is already In Progress
📊 Started: 2 hours ago
👤 Assignee: johndoe
💡 Use /bl:issue-update to modify or continue working
```

## Example Usage

**Basic usage**:
```bash
/bl:issue-start MYPRJ-123
```

**With comment**:
```bash
/bl:issue-start MYPRJ-123 --comment "Starting implementation"
```

**Assign to self**:
```bash
/bl:issue-start MYPRJ-123 --assignee-me
```

**Full usage**:
```bash
/bl:issue-start MYPRJ-123 --assignee-me --comment "Beginning work on authentication feature"
```

## Output Example

```
🚀 Started: MYPRJ-123 - Implement user authentication
📊 Status: Open → In Progress
👤 Assignee: johndoe (you)
💬 Comment added: "Beginning work on authentication feature"
⏰ Started at: 2025-01-10 14:30:00

📍 Current issue saved to .claude/context/current-issue.json
```

## Current Issue Context

The `.claude/context/current-issue.json` file stores:

```json
{
  "issueKey": "MYPRJ-123",
  "issueId": 98765,
  "title": "Implement user authentication",
  "issueType": "Feature",
  "status": "In Progress",
  "priority": "High",
  "assignee": {
    "id": 456,
    "userId": "johndoe",
    "name": "John Doe"
  },
  "startedAt": "2025-01-10T14:30:00Z",
  "milestone": {"id": 10, "name": "v1.0"},
  "category": {"id": 1, "name": "Backend"},
  "url": "https://my-space.backlog.com/view/MYPRJ-123",
  "estimatedHours": 8,
  "actualHours": 0,
  "notes": ""
}
```

This enables:
- Quick reference to current work
- Time tracking
- Session continuity
- Progress notes

## Related Commands

- `/bl:issue-create` - Create new issue
- `/bl:issue-update` - Update issue details
- `/bl:issue-close` - Close completed issue
- `/bl:issue-comment` - Add comment to issue
- `/bl:next` - Get recommended next task
