# /bl:export - Export Project Data

Export Backlog project issues and metadata to various file formats for reporting, backup, or external analysis.

## Syntax

```bash
/bl:export [--format csv|json|markdown] [--output <file>]
           [--filter <expression>] [--include-comments]
           [--milestone <name>]
```

## Arguments

- `--format <type>`: Output format (default: csv)
  - `csv` - Comma-separated values
  - `json` - JSON format
  - `markdown` - Markdown table
- `--output <file>`: Output file path (default: stdout)
- `--filter <expression>`: Filter issues to export
- `--include-comments`: Include issue comments in export
- `--milestone <name>`: Filter by milestone

## Behavior

1. **Fetch Issues**: Retrieve issues via BacklogMCP based on filters
2. **Format Data**: Transform to requested format
3. **Write Output**: Save to file or display to stdout
4. **Report Summary**: Display export statistics

## Examples

### Basic CSV Export
```bash
/bl:export --output issues.csv
```

**Output:**
```
📊 Exporting project: MYPRJ
🔄 Fetching issues...
[████████████████████] 165/165 (100%)

✅ Export complete
📁 File: issues.csv
📊 Exported: 165 issues
💾 File size: 85 KB

💡 Open with: Excel, Google Sheets, or any CSV reader
```

**issues.csv:**
```csv
key,title,type,priority,status,assignee,created,updated,milestone
MYPRJ-123,User authentication,Feature,High,Closed,johndoe,2025-01-05,2025-01-09,v1.0.0
MYPRJ-124,Login bug fix,Bug,High,Closed,johndoe,2025-01-06,2025-01-09,v1.0.0
MYPRJ-125,API optimization,Task,Normal,In Progress,janedoe,2025-01-08,2025-01-10,v1.1.0
```

### JSON Export
```bash
/bl:export --format json --output project-export.json
```

**project-export.json:**
```json
{
  "project": {
    "key": "MYPRJ",
    "name": "My Project",
    "id": 12345
  },
  "exportDate": "2025-01-10T14:30:00Z",
  "issues": [
    {
      "key": "MYPRJ-123",
      "title": "User authentication",
      "description": "Implement JWT authentication system",
      "type": "Feature",
      "priority": "High",
      "status": "Closed",
      "assignee": {
        "username": "johndoe",
        "name": "John Doe"
      },
      "milestone": "v1.0.0",
      "created": "2025-01-05T10:00:00Z",
      "updated": "2025-01-09T16:30:00Z",
      "closed": "2025-01-09T16:30:00Z",
      "resolution": "Fixed"
    }
  ],
  "summary": {
    "totalIssues": 165,
    "byStatus": {
      "Open": 45,
      "In Progress": 12,
      "Resolved": 23,
      "Closed": 85
    },
    "byType": {
      "Feature": 50,
      "Bug": 40,
      "Task": 60,
      "Improvement": 15
    }
  }
}
```

### Markdown Export
```bash
/bl:export --format markdown --output report.md
```

**report.md:**
```markdown
# MYPRJ - Project Export

**Export Date:** 2025-01-10 14:30:00
**Total Issues:** 165

## Issues

| Key | Title | Type | Priority | Status | Assignee | Milestone |
|-----|-------|------|----------|--------|----------|-----------|
| MYPRJ-123 | User authentication | Feature | High | Closed | johndoe | v1.0.0 |
| MYPRJ-124 | Login bug fix | Bug | High | Closed | johndoe | v1.0.0 |
| MYPRJ-125 | API optimization | Task | Normal | In Progress | janedoe | v1.1.0 |

## Summary

**By Status:**
- Open: 45
- In Progress: 12
- Resolved: 23
- Closed: 85

**By Type:**
- Feature: 50
- Bug: 40
- Task: 60
- Improvement: 15
```

### Export with Filter
```bash
/bl:export --format csv --filter "status=Open AND priority=High" --output high-priority.csv
```

**Output:**
```
📊 Exporting project: MYPRJ
🔍 Applying filter: status=Open AND priority=High
🔄 Fetching issues...
[████████████████████] 12/12 (100%)

✅ Export complete
📁 File: high-priority.csv
📊 Exported: 12 issues (filtered from 165 total)
💾 File size: 6 KB
```

### Export with Comments
```bash
/bl:export --format json --include-comments --output full-export.json
```

**Output:**
```
📊 Exporting project: MYPRJ
💬 Including comments...
🔄 Fetching issues and comments...
[████████████████████] 165/165 (100%)

✅ Export complete
📁 File: full-export.json
📊 Exported: 165 issues, 523 comments
💾 File size: 1.2 MB

⚠️ Large file - may take time to process
```

### Export Milestone
```bash
/bl:export --format csv --milestone "Sprint 25-Q1-01" --output sprint-report.csv
```

**Output:**
```
📊 Exporting milestone: Sprint 25-Q1-01
🔄 Fetching issues...
[████████████████████] 15/15 (100%)

✅ Export complete
📁 File: sprint-report.csv
📊 Exported: 15 issues
💾 File size: 8 KB

📊 Sprint Summary:
  Total: 15 issues
  Completed: 12 (80%)
  In Progress: 2 (13%)
  Open: 1 (7%)
```

### Export to Stdout
```bash
/bl:export --format csv
```

**Output (stdout):**
```
key,title,type,priority,status,assignee,created,updated,milestone
MYPRJ-123,User authentication,Feature,High,Closed,johndoe,2025-01-05,2025-01-09,v1.0.0
MYPRJ-124,Login bug fix,Bug,High,Closed,johndoe,2025-01-06,2025-01-09,v1.0.0
...
```

## Use Cases

### Sprint Reports
```bash
# Export sprint issues for review
/bl:export --format markdown \
  --milestone "Sprint 25-Q1-01" \
  --output sprint-25-q1-01-report.md
```

### Bug Tracking
```bash
# Export all open bugs
/bl:export --format csv \
  --filter "type=Bug AND status=Open" \
  --output open-bugs.csv
```

### Backup
```bash
# Full project backup with comments
/bl:export --format json \
  --include-comments \
  --output backlog-backup-$(date +%Y%m%d).json
```

### Analytics
```bash
# Export for external analysis
/bl:export --format json --output analysis.json

# Process with jq
cat analysis.json | jq '.issues[] | select(.priority == "High")'
```

### Documentation
```bash
# Generate milestone documentation
/bl:export --format markdown \
  --milestone "v1.0.0" \
  --output v1.0.0-release-notes.md
```

## Export Formats

### CSV Format

**Columns:**
- key, title, description, type, priority, status
- assignee, reporter, created, updated, closed
- milestone, category, estimatedHours
- resolution (for closed issues)

**Features:**
- Excel-compatible
- Proper escaping for commas and quotes
- UTF-8 encoding
- Header row included

### JSON Format

**Structure:**
```json
{
  "project": {},
  "exportDate": "ISO8601",
  "issues": [],
  "summary": {}
}
```

**Features:**
- Complete issue data
- Nested objects for relationships
- Optional comments array (with --include-comments)
- Metadata and summary statistics

### Markdown Format

**Sections:**
- Project header
- Issue table
- Summary statistics

**Features:**
- GitHub-flavored markdown
- Readable in text editors
- Easily convertible to HTML/PDF
- Copy-paste friendly tables

## Filter Expressions

Same syntax as `/bl:milestone-assign`:

```bash
# Status filters
--filter "status=Open"
--filter "status=In Progress OR status=Resolved"

# Priority filters
--filter "priority=High"
--filter "priority=High OR priority=Critical"

# Type filters
--filter "type=Bug"
--filter "type=Feature AND priority=High"

# Assignee filters
--filter "assignee=johndoe"
--filter "assignee=NULL"  # Unassigned

# Complex filters
--filter "type=Bug AND status=Open AND priority=High"
```

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**No Issues Found:**
```
⚠️ No issues match filter criteria
   Filter: status=Closed AND milestone=v99.0.0

💡 Check filter expression or remove filter
💡 Use /bl:issue-list to verify issues exist
```

**Write Error:**
```
❌ Error: Unable to write file
   File: /readonly/issues.csv
   Reason: Permission denied

💡 Check file permissions or use different path
```

**Large Export Warning:**
```
⚠️ Large export detected: 5000+ issues
   Estimated time: 2-3 minutes
   Estimated size: 15 MB

Continue? (y/n): y

🔄 Exporting...
[████████████░░░░░░░░] 3500/5000 (70%)
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `get_issue_list` to fetch all issues
- Fetches comments via `get_issue_comments` if requested
- Batch processing for large datasets

**Performance:**
- Streaming output for large exports
- Progress indicator for >100 issues
- Memory-efficient processing
- Chunked API requests

**Data Transformation:**
- CSV: Flatten nested objects, escape special characters
- JSON: Preserve full data structure, pretty-printed
- Markdown: Format tables, wrap long text

**File Handling:**
- UTF-8 encoding for all formats
- Atomic writes to prevent corruption
- Existing file overwrite confirmation
- Automatic `.csv`/`.json`/`.md` extension if missing

## Related Commands

- `/bl:issue-list` - Preview issues before export
- `/bl:sync` - Ensure fresh data before export
- `/bl:status` - Get summary before detailed export
- `/bl:milestone-list` - List milestones for filtering
- `/bl:issue-bulk-create` - Import issues (inverse operation)
