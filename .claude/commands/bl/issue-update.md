# /bl:issue-update - Update Issue Properties

Update one or more properties of an existing Backlog issue.

## Usage

```bash
/bl:issue-update <issue_key> [--title <title>] [--description <desc>]
                 [--status <status>] [--priority <priority>]
                 [--assignee <user>] [--milestone <version>]
                 [--category <category>] [--add-comment <comment>]
```

## Arguments

- `<issue_key>` (required): Issue key (e.g., MYPRJ-123)
- `--title` (optional): New title
- `--description` (optional): New description
- `--status` (optional): New status
- `--priority` (optional): New priority
- `--assignee` (optional): New assignee (username or ID)
- `--milestone` (optional): New milestone/version
- `--category` (optional): New category
- `--add-comment` (optional): Add a comment with the update

## Behavior

1. Collect specified update fields
2. Resolve names to IDs (for status, priority, assignee, etc.)
3. Call Backlog API PATCH `/api/v2/issues/:issueIdOrKey`
4. Add comment if `--add-comment` specified via POST `/api/v2/issues/:issueIdOrKey/comments`
5. Update cache and current issue context if applicable
6. Display updated fields

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
const project = loadProjectContext();

// Collect update fields
const updates = {};
if (hasArg('--title')) {
  updates.summary = getArg('--title');
}
if (hasArg('--description')) {
  updates.description = getArg('--description');
}
if (hasArg('--status')) {
  const statusId = await resolveStatus(getArg('--status'), project);
  updates.statusId = statusId;
}
if (hasArg('--priority')) {
  const priorityId = await resolvePriority(getArg('--priority'), project);
  updates.priorityId = priorityId;
}
if (hasArg('--assignee')) {
  const assigneeId = await resolveUser(getArg('--assignee'));
  updates.assigneeId = assigneeId;
}
if (hasArg('--milestone')) {
  const milestoneId = await resolveVersion(getArg('--milestone'), project);
  updates.milestoneId = [milestoneId];
}
if (hasArg('--category')) {
  const categoryId = await resolveCategory(getArg('--category'), project);
  updates.categoryId = [categoryId];
}

// Update issue
const updatedIssue = await backlog.updateIssue(issueKey, updates);

// Add comment if specified
if (hasArg('--add-comment')) {
  await backlog.addComment(issueKey, {
    content: getArg('--add-comment')
  });
}

// Display changes
console.log(`✅ Updated: ${issueKey}`);
console.log("📊 Changes:");
for (const [field, value] of Object.entries(updates)) {
  console.log(`  - ${field}: ${value}`);
}
console.log(`🔗 ${project.spaceUrl}/view/${issueKey}`);

// Update cache
updateIssueCache(updatedIssue);

// Update current issue if it's the one being updated
updateCurrentIssueIfMatch(issueKey, updatedIssue);
```

## Example Usage

**Update status**:
```bash
/bl:issue-update MYPRJ-123 --status "In Progress"
```

**Update multiple fields**:
```bash
/bl:issue-update MYPRJ-123 --status "In Progress" --priority High --assignee johndoe
```

**With comment**:
```bash
/bl:issue-update MYPRJ-123 --status Resolved --add-comment "Fixed and tested"
```

## Output Example

```
✅ Updated: MYPRJ-123
📊 Changes:
  - Status: Open → In Progress
  - Priority: Normal → High
  - Assignee: (none) → johndoe
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

## Related Commands

- `/bl:issue-start` - Start working on issue
- `/bl:issue-close` - Close issue
- `/bl:issue-comment` - Add comment only
