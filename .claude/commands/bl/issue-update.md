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
3. Call BacklogMCP `update_issue`
4. Add comment if `--add-comment` specified
5. Update cache and current issue context if applicable
6. Display updated fields

## Implementation

```python
issue_key = args[0]
project = load_project_context()

# Collect update fields
updates = {}
if has_arg('--title'):
    updates['summary'] = get_arg('--title')
if has_arg('--description'):
    updates['description'] = get_arg('--description')
if has_arg('--status'):
    status_id = resolve_status(get_arg('--status'), project)
    updates['statusId'] = status_id
if has_arg('--priority'):
    priority_id = resolve_priority(get_arg('--priority'), project)
    updates['priorityId'] = priority_id
if has_arg('--assignee'):
    assignee_id = resolve_user(get_arg('--assignee'))
    updates['assigneeId'] = assignee_id
if has_arg('--milestone'):
    milestone_id = resolve_version(get_arg('--milestone'), project)
    updates['milestoneId'] = [milestone_id]
if has_arg('--category'):
    category_id = resolve_category(get_arg('--category'), project)
    updates['categoryId'] = [category_id]

# Update issue
updated_issue = call_mcp('backlog_update_issue',
                         issueIdOrKey=issue_key,
                         **updates)

# Add comment if specified
if has_arg('--add-comment'):
    call_mcp('backlog_add_comment',
             issueIdOrKey=issue_key,
             content=get_arg('--add-comment'))

# Display changes
print(f"✅ Updated: {issue_key}")
print("📊 Changes:")
for field, value in updates.items():
    print(f"  - {field}: {value}")
print(f"🔗 {project['spaceUrl']}/view/{issue_key}")

# Update cache
update_issue_cache(updated_issue)

# Update current issue if it's the one being updated
update_current_issue_if_match(issue_key, updated_issue)
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
