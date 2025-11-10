# /bl:milestone-list - List Project Milestones

Display all milestones (versions) in the current project with status and progress information.

## Syntax

```bash
/bl:milestone-list [--status active|archived|all] [--format table|json|simple]
```

## Arguments

- `--status <filter>`: Filter by milestone status (default: active)
  - `active` - Show only active milestones
  - `archived` - Show only archived milestones
  - `all` - Show all milestones
- `--format <type>`: Output format (default: table)
  - `table` - Formatted table view
  - `json` - JSON output for scripting
  - `simple` - Simple list for quick reference

## Behavior

1. **Fetch Milestones**: Call BacklogMCP `get_versions` for current project
2. **Filter by Status**: Apply status filter if specified
3. **Calculate Progress**: Fetch issue counts per milestone
4. **Format Output**: Display in requested format
5. **Sort**: Order by due date (upcoming first), then by name

## Examples

### List Active Milestones (Default)
```bash
/bl:milestone-list
```

**Output:**
```
📊 Active Milestones (5 found)

┌──────────────────┬─────────────┬──────────────┬──────────┬──────────┐
│ Name             │ Start Date  │ Due Date     │ Issues   │ Progress │
├──────────────────┼─────────────┼──────────────┼──────────┼──────────┤
│ Sprint 25-Q1-01  │ Jan 15 2025 │ Jan 29 2025  │ 15 total │ ████░ 80%│
│ Sprint 25-Q1-02  │ Jan 29 2025 │ Feb 12 2025  │ 12 total │ ░░░░░  0%│
│ v1.0.0           │ Jan 10 2025 │ Mar 01 2025  │ 45 total │ ███░░ 60%│
│ v1.1.0           │ Mar 01 2025 │ Jun 01 2025  │ 8 total  │ ░░░░░  5%│
│ v2.0.0           │ Jun 01 2025 │ Dec 01 2025  │ 3 total  │ ░░░░░  0%│
└──────────────────┴─────────────┴──────────────┴──────────┴──────────┘

⏰ Upcoming deadline: Sprint 25-Q1-01 (10 days remaining)
💡 Use /bl:status --milestone <name> for detailed progress
```

### List All Milestones
```bash
/bl:milestone-list --status all
```

**Output:**
```
📊 All Milestones (8 found)

Active (5):
  ✅ Sprint 25-Q1-01 - Due: Jan 29 (80% complete)
  📋 Sprint 25-Q1-02 - Due: Feb 12 (0% complete)
  📋 v1.0.0 - Due: Mar 01 (60% complete)
  📋 v1.1.0 - Due: Jun 01 (5% complete)
  📋 v2.0.0 - Due: Dec 01 (0% complete)

Archived (3):
  📦 v0.9.0 - Released: Dec 15 2024
  📦 v0.8.0 - Released: Nov 01 2024
  📦 Beta Release - Released: Oct 15 2024
```

### List Archived Milestones Only
```bash
/bl:milestone-list --status archived
```

**Output:**
```
📦 Archived Milestones (3 found)

┌────────────────┬───────────────────┬────────┐
│ Name           │ Release Date      │ Issues │
├────────────────┼───────────────────┼────────┤
│ v0.9.0         │ Dec 15 2024       │ 50     │
│ v0.8.0         │ Nov 01 2024       │ 35     │
│ Beta Release   │ Oct 15 2024       │ 20     │
└────────────────┴───────────────────┴────────┘

💡 Use --status all to see active and archived milestones
```

### Simple Format
```bash
/bl:milestone-list --format simple
```

**Output:**
```
Sprint 25-Q1-01
Sprint 25-Q1-02
v1.0.0
v1.1.0
v2.0.0
```

### JSON Format (for Scripting)
```bash
/bl:milestone-list --format json
```

**Output:**
```json
{
  "milestones": [
    {
      "id": 12345,
      "name": "Sprint 25-Q1-01",
      "description": "First sprint of Q1 2025",
      "startDate": "2025-01-15",
      "dueDate": "2025-01-29",
      "archived": false,
      "issueCount": 15,
      "completedIssues": 12,
      "progressPercent": 80
    },
    {
      "id": 12346,
      "name": "Sprint 25-Q1-02",
      "startDate": "2025-01-29",
      "dueDate": "2025-02-12",
      "archived": false,
      "issueCount": 12,
      "completedIssues": 0,
      "progressPercent": 0
    }
  ]
}
```

## Use Cases

### Sprint Planning
```bash
# Check available milestones
/bl:milestone-list

# Create new sprint if needed
/bl:milestone-create "Sprint 25-Q1-03" --start-date 2025-02-12 --due-date 2025-02-26
```

### Release Management
```bash
# Review all releases
/bl:milestone-list --status all

# Check upcoming releases
/bl:milestone-list | grep "days remaining"
```

### Scripting Integration
```bash
# Get milestone names for automation
milestones=$(/bl:milestone-list --format simple)

# Get milestone data as JSON
/bl:milestone-list --format json | jq '.milestones[] | select(.progressPercent > 50)'
```

### Historical Review
```bash
# Review past releases
/bl:milestone-list --status archived

# Compare past vs current velocity
/bl:milestone-list --status all --format json | jq '.milestones[] | {name, issues: .issueCount}'
```

## Output Details

**Progress Calculation:**
- `completedIssues / totalIssues * 100`
- Completed = issues with status "Closed" or "Resolved"
- Total = all issues assigned to milestone

**Visual Progress Bar:**
- `████░ 80%` - 4 filled blocks, 1 empty block
- Each block represents 20% progress
- Color coding: Green (>80%), Yellow (50-80%), Red (<50%)

**Status Indicators:**
- ✅ - Milestone with >80% completion
- 📋 - Active milestone
- 📦 - Archived milestone
- ⚠️ - Milestone overdue with incomplete issues

**Date Formatting:**
- Relative: "10 days remaining", "5 days overdue"
- Absolute: "Jan 29 2025"
- Includes countdown for upcoming milestones

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**No Milestones Found:**
```
📊 No milestones found

💡 Create your first milestone:
   /bl:milestone-create "v1.0.0" --due-date 2025-03-01
```

**API Error:**
```
❌ Error: Unable to fetch milestones
   Reason: Connection timeout
💡 Check BacklogMCP connection and try again
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `get_versions` tool to fetch all milestones
- Fetches issue counts per milestone via `get_issue_list`
- Calculates progress based on issue status distribution

**Progress Calculation:**
- Real-time calculation based on current issue status
- Cached for 5 minutes to improve performance
- Recalculated on milestone assignment changes

**Sorting Logic:**
- Active milestones: Sort by due date (ascending), then name
- Archived milestones: Sort by release date (descending)
- Milestones without dates: Sort alphabetically by name

**Performance:**
- Batch API calls for issue count queries
- Cache milestone list for 5 minutes
- Lazy load progress details in table format only

## Related Commands

- `/bl:milestone-create` - Create new milestone
- `/bl:milestone-assign` - Assign issues to milestone
- `/bl:status` - View detailed milestone progress dashboard
- `/bl:issue-list` - Filter issues by milestone
- `/bl:issue-create` - Create issue with milestone assignment
