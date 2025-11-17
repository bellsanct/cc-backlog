# /bl:issue-close - Close Completed Issue

Mark an issue as closed/resolved.

## Usage

```bash
/bl:issue-close <issue_key> [--resolution <resolution>] [--comment <comment>]
```

## Arguments

- `<issue_key>` (required): Issue key (e.g., MYPRJ-123)
- `--resolution` (optional): Resolution reason (Fixed, Won't Fix, Duplicate, etc.)
- `--comment` (optional): Closing comment

## Behavior

1. Fetch issue to verify it exists
2. Call Backlog API GET `/api/v2/issues/:issueIdOrKey`
3. Update status to "Closed" or "Resolved" via PATCH `/api/v2/issues/:issueIdOrKey`
4. Set resolution if specified
5. Add comment if specified via POST `/api/v2/issues/:issueIdOrKey/comments`
6. Remove from `.claude/context/current-issue.json` if it's the current issue
7. Update cache

## Implementation

```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv, loadProjectContext } = require('../../../lib/utils');

const config = loadEnv();
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});

const issueKey = args[0];
const resolution = getArg('--resolution');
const commentText = getArg('--comment');

const project = loadProjectContext();

// Fetch issue
const issue = await backlog.getIssue(issueKey);

// Find Closed/Resolved status
let closedStatus = null;
for (const status of project.metadata.statuses) {
  if (status.name === 'Closed' || status.name === 'Resolved') {
    closedStatus = status;
    break;
  }
}

if (!closedStatus) {
  console.error('❌ No "Closed" or "Resolved" status found in project');
  return;
}

// Update issue
const updatedIssue = await backlog.updateIssue(issueKey, {
  statusId: closedStatus.id
});

// Add comment if specified
if (commentText) {
  await backlog.addComment(issueKey, {
    content: commentText
  });
}

// Display
console.log(`
✅ Closed: ${issueKey} - ${issue.summary}
📊 Status: ${issue.status.name} → ${closedStatus.name}
`);

if (resolution) {
  console.log(`🔧 Resolution: ${resolution}`);
}
if (commentText) {
  console.log(`💬 Comment: "${commentText}"`);
}

console.log(`⏰ Closed at: ${new Date().toISOString()}`);

// Remove from current issue if it matches
removeCurrentIssueIfMatch(issueKey);

// Update cache
updateIssueCache(updatedIssue);
```

## Example Usage

**Simple close**:
```bash
/bl:issue-close MYPRJ-123
```

**With resolution**:
```bash
/bl:issue-close MYPRJ-123 --resolution Fixed
```

**With comment**:
```bash
/bl:issue-close MYPRJ-123 --resolution Fixed --comment "Implemented and tested successfully"
```

## Output Example

```
✅ Closed: MYPRJ-123 - Implement user authentication
📊 Status: In Progress → Closed
🔧 Resolution: Fixed
💬 Comment: "Implemented and tested successfully"
⏰ Closed at: 2025-01-10 16:45:00
```

## Related Commands

- `/bl:issue-start` - Start working on issue
- `/bl:issue-update` - Update issue properties
