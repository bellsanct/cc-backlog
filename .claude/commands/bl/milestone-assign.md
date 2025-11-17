# /bl:milestone-assign - Assign Milestone to Issues

Assign or update milestone/version for one or multiple issues.

## Syntax

```bash
/bl:milestone-assign <milestone_name> <issue_keys...>
/bl:milestone-assign <milestone_name> --filter <filter_expression>
```

## Arguments

- `<milestone_name>` (required): Milestone/version name to assign
- `<issue_keys...>`: One or more issue keys (space-separated)
- `--filter <expression>`: Filter expression to select issues (alternative to explicit keys)

## Behavior

1. **Resolve Milestone**: Find milestone ID by name from project milestones
2. **Validate Issues**: Verify all issue keys exist in current project
3. **Batch Update**: Update milestone for each issue via PATCH `/api/v2/issues/:issueIdOrKey`
4. **Display Summary**: Show success/failure counts and updated issue list

## Examples

### Assign Single Issue
```bash
/bl:milestone-assign "v1.0.0" MYPRJ-123
```

**Output:**
```
✅ Milestone assigned: v1.0.0
📋 Updated issues:
  - MYPRJ-123: Implement user authentication

🔗 View milestone: /bl:status --milestone "v1.0.0"
```

### Assign Multiple Issues
```bash
/bl:milestone-assign "Sprint 25-Q1-01" MYPRJ-123 MYPRJ-124 MYPRJ-125
```

**Output:**
```
✅ Milestone assigned: Sprint 25-Q1-01
📋 Updated 3 issues:
  - MYPRJ-123: Implement user authentication
  - MYPRJ-124: Fix login bug
  - MYPRJ-125: API optimization

📊 Sprint progress: [███░░░░░░░] 30% complete (3/10 issues)
🔗 View milestone: /bl:status --milestone "Sprint 25-Q1-01"
```

### Assign with Issue Range
```bash
/bl:milestone-assign "v1.1.0" MYPRJ-{130..135}
```

**Output:**
```
✅ Milestone assigned: v1.1.0
📋 Updated 6 issues:
  - MYPRJ-130 to MYPRJ-135

📊 Milestone progress: [██░░░░░░░░] 20% complete (6/30 planned)
```

### Assign Using Filter
```bash
/bl:milestone-assign "Sprint 25-Q1-02" --filter "status=Open AND priority=High"
```

**Output:**
```
🔍 Finding issues matching filter...
📊 Found 8 matching issues

✅ Milestone assigned: Sprint 25-Q1-02
📋 Updated 8 issues:
  - MYPRJ-140: Critical security fix
  - MYPRJ-141: Performance regression
  - MYPRJ-142: Data corruption bug
  - MYPRJ-143: API endpoint failure
  - MYPRJ-144: Authentication timeout
  - MYPRJ-145: Memory leak
  - MYPRJ-146: Database connection issue
  - MYPRJ-147: Cache invalidation

📊 Sprint progress: [████░░░░░░] 40% complete (8/20 issues)
```

### Reassign to Different Milestone
```bash
/bl:milestone-assign "v2.0.0" MYPRJ-150 MYPRJ-151
```

**Output:**
```
⚠️ Issues already assigned to milestone:
  - MYPRJ-150: Currently in "v1.1.0"
  - MYPRJ-151: Currently in "v1.1.0"

✅ Milestone reassigned: v1.1.0 → v2.0.0
📋 Updated 2 issues:
  - MYPRJ-150: Advanced reporting
  - MYPRJ-151: Dashboard redesign

📊 v1.1.0 progress: [████████░░] 80% (moved 2 issues out)
📊 v2.0.0 progress: [█░░░░░░░░░] 10% (added 2 issues)
```

## Filter Expressions

Filter syntax for `--filter` option:

**Field Operators:**
- `status=<value>` - Issue status (Open, In Progress, Resolved, Closed)
- `priority=<value>` - Priority level (High, Normal, Low)
- `type=<value>` - Issue type (Task, Bug, Feature)
- `assignee=<user>` - Assignee username
- `category=<name>` - Category name

**Logical Operators:**
- `AND` - All conditions must match
- `OR` - Any condition can match
- `NOT` - Negate condition

**Examples:**
```bash
# High priority bugs
--filter "type=Bug AND priority=High"

# Open issues without milestone
--filter "status=Open AND milestone=NULL"

# Features assigned to specific user
--filter "type=Feature AND assignee=johndoe"

# High or critical priority
--filter "priority=High OR priority=Critical"
```

## Use Cases

### Sprint Planning
```bash
# Assign sprint backlog to sprint milestone
/bl:milestone-assign "Sprint 25-Q1-01" MYPRJ-100 MYPRJ-101 MYPRJ-102

# Bulk assign all planned sprint items
/bl:milestone-assign "Sprint 25-Q1-01" --filter "status=Open AND priority=High"
```

### Release Planning
```bash
# Assign features to release
/bl:milestone-assign "v1.0.0" --filter "type=Feature AND category=Core"

# Assign critical bugs to hotfix release
/bl:milestone-assign "v0.9.1-hotfix" --filter "type=Bug AND priority=High"
```

### Milestone Reorganization
```bash
# Move incomplete issues to next sprint
/bl:milestone-assign "Sprint 25-Q1-02" MYPRJ-150 MYPRJ-151 MYPRJ-152

# Reassign delayed features to future release
/bl:milestone-assign "v1.1.0" --filter "type=Feature AND milestone=v1.0.0 AND status=Open"
```

### Cleanup Operations
```bash
# Remove milestone from completed issues
/bl:milestone-assign "" MYPRJ-200 MYPRJ-201  # Empty string removes milestone

# Bulk remove milestone using filter
/bl:milestone-assign "" --filter "status=Closed AND milestone=v0.9.0"
```

## Batch Operations

For large issue sets, the command uses batch processing:

```bash
# Assign 50 issues in batches of 10
/bl:milestone-assign "v1.0.0" MYPRJ-{100..149}
```

**Output:**
```
🔄 Batch processing: 50 issues
[████████████████████] 50/50 (100%)

✅ Milestone assigned: v1.0.0
📋 Successfully updated: 48 issues
⚠️ Failed: 2 issues
  - MYPRJ-135: Issue not found
  - MYPRJ-140: Insufficient permissions

📊 Overall: 96% success rate
```

## Error Handling

**Milestone Not Found:**
```
❌ Error: Milestone "v1.5.0" not found
💡 Available milestones:
  - Sprint 25-Q1-01
  - Sprint 25-Q1-02
  - v1.0.0
  - v1.1.0
  - v2.0.0

Use /bl:milestone-list to see all milestones
```

**Issue Not Found:**
```
❌ Error: Issue MYPRJ-999 not found
💡 Use /bl:issue-list to view available issues
```

**Invalid Filter:**
```
❌ Error: Invalid filter expression
   Filter: "status=Open AND"
   Problem: Incomplete expression after AND operator

💡 Valid syntax: --filter "field=value AND field=value"
```

**Partial Success:**
```
⚠️ Partial success: 8/10 issues updated

✅ Successfully updated:
  - MYPRJ-123, MYPRJ-124, MYPRJ-125, MYPRJ-126
  - MYPRJ-127, MYPRJ-128, MYPRJ-129, MYPRJ-130

❌ Failed:
  - MYPRJ-131: Archived issue (read-only)
  - MYPRJ-132: Insufficient permissions

💡 Fix errors and retry failed issues
```

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

## Implementation Notes

**Backlog API Integration:**
- Uses GET `/api/v2/projects/:projectIdOrKey/versions` to resolve milestone name to ID
- Uses PATCH `/api/v2/issues/:issueIdOrKey` to assign milestone to each issue
- Batch processing for multiple issue updates

**Milestone Resolution:**
- Exact name match first
- Partial name match if exact match fails (case-insensitive)
- Interactive selection if multiple partial matches

**Performance:**
- Batch size: 10 issues per API call
- Parallel processing where API allows
- Progress indicator for large batch operations

**Validation:**
- Check milestone exists before starting updates
- Validate issue keys before API calls
- Continue batch on individual failures (non-blocking)

**State Management:**
- Update local cache after successful assignment
- Invalidate milestone progress cache
- Trigger progress recalculation

## Related Commands

- `/bl:milestone-create` - Create new milestone
- `/bl:milestone-list` - View all project milestones
- `/bl:issue-create` - Create issue with milestone assignment
- `/bl:issue-list` - Filter issues by milestone
- `/bl:status` - View milestone progress dashboard
- `/bl:issue-update` - Update other issue properties
