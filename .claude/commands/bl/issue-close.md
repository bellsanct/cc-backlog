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
2. Update status to "Closed" or "Resolved"
3. Set resolution if specified
4. Add comment if specified
5. Remove from `.claude/context/current-issue.json` if it's the current issue
6. Update cache

## Implementation

```python
issue_key = args[0]
resolution = get_arg('--resolution')
comment_text = get_arg('--comment')

project = load_project_context()

# Fetch issue
issue = call_mcp('backlog_get_issue', issueIdOrKey=issue_key)

# Find Closed/Resolved status
closed_status = find_status_by_name("Closed", project['metadata']['statuses'])
if not closed_status:
    closed_status = find_status_by_name("Resolved", project['metadata']['statuses'])

if not closed_status:
    error("No 'Closed' or 'Resolved' status found in project")
    return

# Update issue
updated_issue = call_mcp('backlog_update_issue',
                         issueIdOrKey=issue_key,
                         statusId=closed_status['id'])

# Add comment
if comment_text:
    call_mcp('backlog_add_comment',
             issueIdOrKey=issue_key,
             content=comment_text)

# Display
print(f"""
✅ Closed: {issue_key} - {issue['summary']}
📊 Status: {issue['status']['name']} → {closed_status['name']}
""")

if resolution:
    print(f"🔧 Resolution: {resolution}")
if comment_text:
    print(f"💬 Comment: \"{comment_text}\"")

print(f"⏰ Closed at: {now_formatted()}")

# Remove from current issue if it matches
remove_current_issue_if_match(issue_key)

# Update cache
update_issue_cache(updated_issue)
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
