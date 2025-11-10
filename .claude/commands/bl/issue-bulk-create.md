# /bl:issue-bulk-create - Bulk Issue Creation

Create multiple Backlog issues from CSV or JSON files with batch processing.

## Syntax

```bash
/bl:issue-bulk-create <file_path> [--type <default_type>]
                      [--dry-run] [--batch-size <n>]
```

## Arguments

- `<file_path>` (required): Path to CSV or JSON file containing issue data
- `--type <default_type>`: Default issue type if not specified in file (Task, Bug, Feature, etc.)
- `--dry-run`: Preview issues without creating them
- `--batch-size <n>`: Number of issues to create per batch (default: 10)

## File Formats

### CSV Format

```csv
title,description,type,priority,assignee,category,milestone
"User login","Implement JWT auth",Feature,High,johndoe,Backend,v1.0
"Fix layout","Mobile view broken",Bug,High,janedoe,Frontend,
"Add logging","System-wide logging",Task,Normal,,Infrastructure,v1.1
```

**CSV Columns:**
- `title` (required): Issue title
- `description` (optional): Issue description (Markdown supported)
- `type` (optional): Issue type (uses --type default if not specified)
- `priority` (optional): Priority level (High, Normal, Low)
- `assignee` (optional): Username or user ID
- `category` (optional): Category name
- `milestone` (optional): Milestone/version name

### JSON Format

```json
{
  "issues": [
    {
      "title": "User login",
      "description": "Implement JWT authentication system",
      "type": "Feature",
      "priority": "High",
      "assignee": "johndoe",
      "category": "Backend",
      "milestone": "v1.0"
    },
    {
      "title": "Fix mobile layout",
      "description": "Mobile view broken on Safari",
      "type": "Bug",
      "priority": "High",
      "assignee": "janedoe",
      "category": "Frontend"
    }
  ]
}
```

## Behavior

1. **Parse File**: Read and validate CSV or JSON file format
2. **Validate Entries**: Check required fields and data types
3. **Dry Run Check**: If `--dry-run`, display preview and exit without creating
4. **Batch Processing**: Create issues in batches via BacklogMCP `add_issue`
5. **Progress Display**: Show progress bar during creation
6. **Summary Report**: Display success/failure counts and created issue keys

## Examples

### Basic CSV Import
```bash
/bl:issue-bulk-create bugs.csv --type Bug
```

### Dry Run Preview
```bash
/bl:issue-bulk-create features.json --dry-run
```

**Output:**
```
📂 Loading: features.json
📊 Found 8 issues to create

Preview (dry-run mode):
1. [Feature] User authentication - High priority
2. [Feature] Dashboard UI - Normal priority
3. [Feature] Report generation - Normal priority
...

💡 Remove --dry-run to create these issues
```

### Custom Batch Size
```bash
/bl:issue-bulk-create large-import.csv --batch-size 5
```

## Output Example

```
📂 Loading: bugs.csv
📊 Found 15 issues to create

Creating issues (batch size: 10)...
[████████████████████] 15/15 (100%)

✅ Successfully created: 15 issues
⚠️ Failed: 0 issues
📋 Created issue keys: MYPRJ-125 to MYPRJ-139

💡 Use /bl:issue-list --keys MYPRJ-125..MYPRJ-139 to view
```

## Error Handling

**File Not Found:**
```
❌ Error: File not found: bugs.csv
💡 Check file path and try again
```

**Invalid Format:**
```
❌ Error: Invalid CSV format on line 5
   Missing required field: title
💡 Ensure all required fields are present
```

**API Errors:**
```
Creating issues...
[████████████░░░░░░░░] 12/15 (80%)

✅ Successfully created: 12 issues
❌ Failed: 3 issues

Failed issues:
- Line 7: Invalid assignee "unknown_user"
- Line 10: Category "Invalid" does not exist
- Line 13: API rate limit exceeded (retry in 60s)

💡 Fix errors and re-run with remaining issues
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `add_issue` tool for issue creation
- Validates project context from `backlog-project.json`
- Handles API rate limiting with exponential backoff

**Performance:**
- Batch processing reduces API calls
- Progress tracking for large imports
- Graceful error handling continues batch on failures

**Data Validation:**
- Required field check: title
- Optional field defaults from workflow-config.json
- Type/priority validation against Backlog API

## Related Commands

- `/bl:issue-create` - Create single issue interactively
- `/bl:issue-list` - View created issues
- `/bl:project-set` - Set project context before bulk import
