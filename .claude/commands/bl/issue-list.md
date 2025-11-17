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
2. Call Backlog API GET `/api/v2/issues` with filters
3. Sort results
4. Format and display

## Implementation

```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv, loadProjectContext } = require('../../../lib/utils');

const config = loadEnv();
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});

const project = loadProjectContext();

// Build filter parameters
const filters = {
  projectId: [project.projectId]
};

if (hasArg('--status')) {
  const statusId = await resolveStatus(getArg('--status'), project);
  filters.statusId = [statusId];
}

if (hasArg('--type')) {
  const typeId = await resolveIssueType(getArg('--type'), project);
  filters.issueTypeId = [typeId];
}

if (hasArg('--assignee')) {
  const assigneeArg = getArg('--assignee');
  if (assigneeArg === 'me') {
    const currentUser = await backlog.getMyself();
    filters.assigneeId = [currentUser.id];
  } else {
    const assigneeId = await resolveUser(assigneeArg);
    filters.assigneeId = [assigneeId];
  }
}

if (hasArg('--milestone')) {
  const milestoneId = await resolveVersion(getArg('--milestone'), project);
  filters.milestoneId = [milestoneId];
}

if (hasArg('--priority')) {
  const priorityId = await resolvePriority(getArg('--priority'), project);
  filters.priorityId = [priorityId];
}

if (hasArg('--category')) {
  const categoryId = await resolveCategory(getArg('--category'), project);
  filters.categoryId = [categoryId];
}

// Get issues
const issues = await backlog.getIssues(filters);

// Sort
const sortField = getArg('--sort', 'updated');
const sortedIssues = sortIssues(issues, sortField);

// Limit
const limit = parseInt(getArg('--limit', '20'));
const limitedIssues = sortedIssues.slice(0, limit);

// Format and display
const formatType = getArg('--format', 'table');

if (formatType === 'json') {
  console.log(JSON.stringify(limitedIssues, null, 2));
} else if (formatType === 'compact') {
  displayCompact(limitedIssues);
} else {
  displayTable(limitedIssues);
  console.log(`\n💡 Use /bl:issue-start <key> to start working on an issue`);
}
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
