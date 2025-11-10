# /bl:milestone-create - Create Milestone/Version

Create new milestones (versions) in Backlog for release planning and sprint organization.

## Syntax

```bash
/bl:milestone-create <name> [--description <desc>]
                     [--start-date <date>] [--due-date <date>]
                     [--release-date <date>] [--archived]
```

## Arguments

- `<name>` (required): Milestone/version name (e.g., "v1.0.0", "Sprint 2025-Q1-01")
- `--description <desc>`: Milestone description
- `--start-date <date>`: Start date (YYYY-MM-DD format)
- `--due-date <date>`: Due/target date (YYYY-MM-DD format)
- `--release-date <date>`: Actual release date (YYYY-MM-DD format)
- `--archived`: Create as archived milestone (default: active)

## Behavior

1. **Validate Input**: Check milestone name uniqueness and date formats
2. **Create Milestone**: Call BacklogMCP `add_version` with milestone data
3. **Display Details**: Show created milestone information with ID
4. **Update Context**: Cache milestone for quick reference in issue creation

## Examples

### Basic Milestone Creation
```bash
/bl:milestone-create "v1.0.0"
```

**Output:**
```
✅ Milestone created: v1.0.0
🆔 Milestone ID: 12345
📅 Status: Active
🔗 https://my-space.backlog.com/projects/MYPRJ/versions/12345

💡 Use /bl:milestone-assign to add issues to this milestone
```

### Sprint Milestone with Dates
```bash
/bl:milestone-create "Sprint 2025-Q1-01" \
  --description "First sprint of Q1 2025" \
  --start-date 2025-01-15 \
  --due-date 2025-01-29
```

**Output:**
```
✅ Milestone created: Sprint 2025-Q1-01
🆔 Milestone ID: 12346
📝 Description: First sprint of Q1 2025
📅 Duration: Jan 15 - Jan 29, 2025 (14 days)
📊 Status: Active

💡 Next steps:
  1. /bl:milestone-assign "Sprint 2025-Q1-01" <issue_keys>
  2. /bl:status --milestone "Sprint 2025-Q1-01"
```

### Release Version with Full Details
```bash
/bl:milestone-create "v2.0.0-beta" \
  --description "Beta release for major v2 features" \
  --start-date 2025-02-01 \
  --due-date 2025-02-28 \
  --release-date 2025-03-01
```

**Output:**
```
✅ Milestone created: v2.0.0-beta
🆔 Milestone ID: 12347
📝 Description: Beta release for major v2 features
📅 Development: Feb 1-28, 2025
🚀 Release: Mar 1, 2025
📊 Status: Active

💡 Timeline:
  ⏰ 22 days until due date
  🚀 29 days until release
```

### Archived Milestone (Historical)
```bash
/bl:milestone-create "v0.9.0-legacy" \
  --description "Legacy version (pre-rewrite)" \
  --archived
```

**Output:**
```
✅ Milestone created: v0.9.0-legacy
🆔 Milestone ID: 12348
📝 Description: Legacy version (pre-rewrite)
📊 Status: Archived

💡 This milestone is archived and won't appear in active milestone lists
```

## Use Cases

### Sprint Planning
```bash
# Create 2-week sprint milestones
/bl:milestone-create "Sprint 2025-Q1-01" --start-date 2025-01-15 --due-date 2025-01-29
/bl:milestone-create "Sprint 2025-Q1-02" --start-date 2025-01-29 --due-date 2025-02-12
/bl:milestone-create "Sprint 2025-Q1-03" --start-date 2025-02-12 --due-date 2025-02-26

# Assign sprint backlog
/bl:milestone-assign "Sprint 2025-Q1-01" MYPRJ-100 MYPRJ-101 MYPRJ-102
```

### Release Management
```bash
# Create release milestones
/bl:milestone-create "v1.0.0" --due-date 2025-03-01 --description "First production release"
/bl:milestone-create "v1.1.0" --due-date 2025-06-01 --description "Feature enhancements"
/bl:milestone-create "v2.0.0" --due-date 2025-12-01 --description "Major architecture update"
```

### Feature Tracking
```bash
# Create feature milestone
/bl:milestone-create "User Authentication Feature" \
  --description "Complete user authentication system" \
  --start-date 2025-01-10 \
  --due-date 2025-02-10

# Assign related issues
/bl:issue-list --type Feature --category Auth | xargs /bl:milestone-assign "User Authentication Feature"
```

### Historical Organization
```bash
# Archive old milestones
/bl:milestone-create "v0.8.0" --archived --description "Initial prototype"
/bl:milestone-create "v0.9.0" --archived --description "Pre-release version"
```

## Date Format

Dates must be in **ISO 8601** format: `YYYY-MM-DD`

**Valid Examples:**
- `2025-01-15` (January 15, 2025)
- `2025-12-31` (December 31, 2025)

**Invalid Examples:**
- `01/15/2025` (US format not supported)
- `15-01-2025` (day-first format not supported)
- `2025-1-5` (missing leading zeros)

## Error Handling

**Duplicate Milestone Name:**
```
❌ Error: Milestone "v1.0.0" already exists
💡 Existing milestone ID: 12345
💡 Use /bl:milestone-list to view all milestones
```

**Invalid Date Format:**
```
❌ Error: Invalid date format "01/15/2025"
💡 Use ISO 8601 format: YYYY-MM-DD (e.g., 2025-01-15)
```

**Invalid Date Range:**
```
❌ Error: Start date (2025-02-01) is after due date (2025-01-15)
💡 Ensure start-date <= due-date
```

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**API Error:**
```
❌ Error: Failed to create milestone
   Reason: Insufficient permissions
💡 Check Backlog project permissions
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `add_version` tool to create milestones
- Requires project ID from `backlog-project.json`
- Returns milestone ID for subsequent operations

**Naming Conventions:**
- Semantic versioning: `v1.0.0`, `v2.1.3-beta`
- Sprint naming: `Sprint YYYY-QN-NN`
- Feature naming: `Feature: <description>`
- Release naming: `Release YYYY-MM`

**Date Validation:**
- Start date must be before or equal to due date
- Due date must be before or equal to release date
- Past dates are allowed for historical tracking
- Future dates are recommended for active milestones

**Status Management:**
- New milestones default to "active" status
- Use `--archived` for historical milestones
- Active milestones appear in quick-select lists
- Archived milestones require explicit filtering

## Related Commands

- `/bl:milestone-list` - View all project milestones
- `/bl:milestone-assign` - Assign issues to milestone
- `/bl:issue-create` - Create issue with milestone assignment
- `/bl:status` - View milestone progress dashboard
- `/bl:issue-list` - Filter issues by milestone
