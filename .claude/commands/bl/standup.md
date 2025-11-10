# /bl:standup - Daily Standup Report

Generate daily standup reports showing completed, in-progress, and blocked issues.

## Syntax

```bash
/bl:standup [--assignee me|<user>] [--days <n>] [--milestone <version>]
```

## Arguments

- `--assignee <user>`: User to report on (default: me/current user)
- `--days <n>`: Number of days to look back (default: 1)
- `--milestone <version>`: Filter by milestone/version

## Behavior

1. **Fetch Issues**: Retrieve issues updated in the specified time period
2. **Group by Status**: Categorize as completed, in progress, or blocked
3. **Calculate Metrics**: Count issues and comments per category
4. **Format Report**: Generate structured standup report
5. **Recommend Next**: Show recommended next tasks using priority algorithm

## Examples

### Daily Standup (Default)
```bash
/bl:standup
```

**Output:**
```
📅 Daily Standup Report - 2025-01-10
👤 User: johndoe

✅ Completed Yesterday:
  - MYPRJ-123: Implement user authentication
  - MYPRJ-124: Fix login bug

🔄 In Progress:
  - MYPRJ-125: Fix critical API bug (80% complete)
  - MYPRJ-126: Update documentation (started)

⚠️ Blocked:
  (none)

📋 Plan for Today:
  🎯 MYPRJ-125: Complete API bug fix
  🎯 MYPRJ-127: Start code review process

💬 Total comments: 8
⏰ Generated at: 2025-01-10 09:00:00
```

### Weekly Standup
```bash
/bl:standup --days 7
```

**Output:**
```
📅 Weekly Standup Report - 2025-01-10
👤 User: johndoe
📊 Period: Jan 3-10, 2025 (7 days)

✅ Completed This Week:
  - MYPRJ-120: Database migration (Jan 3)
  - MYPRJ-121: API endpoint refactor (Jan 5)
  - MYPRJ-123: User authentication (Jan 9)
  - MYPRJ-124: Login bug fix (Jan 9)

🔄 Currently In Progress:
  - MYPRJ-125: API bug fix (started Jan 8, 80% complete)
  - MYPRJ-126: Documentation (started Jan 10)

⚠️ Blocked Issues:
  (none)

📊 Weekly Statistics:
  ✅ Completed: 4 issues
  🔄 In Progress: 2 issues
  💬 Comments: 25 total
  📈 Velocity: 0.57 issues/day

📋 Next Week Priorities:
  🎯 MYPRJ-125: Complete API bug fix
  🎯 MYPRJ-127: Code review process
  🎯 MYPRJ-128: Performance optimization
```

### Team Member Standup
```bash
/bl:standup --assignee janedoe
```

**Output:**
```
📅 Daily Standup Report - 2025-01-10
👤 User: janedoe

✅ Completed Yesterday:
  - MYPRJ-130: Frontend layout fix
  - MYPRJ-131: Mobile responsiveness

🔄 In Progress:
  - MYPRJ-132: Design system integration (60% complete)

⚠️ Blocked:
  - MYPRJ-133: Waiting for API endpoint
    🚧 Blocked by: MYPRJ-125 (assigned to johndoe)
    ⏰ Blocked since: 2025-01-09

💬 Total comments: 5
```

### Milestone-Focused Standup
```bash
/bl:standup --milestone v1.0 --days 3
```

**Output:**
```
📅 Standup Report - v1.0 Milestone
👤 User: johndoe
📊 Period: Last 3 days

✅ Completed (v1.0):
  - MYPRJ-123: User authentication
  - MYPRJ-124: Login bug fix

🔄 In Progress (v1.0):
  - MYPRJ-125: API bug fix (critical)
  - MYPRJ-126: Documentation

⚠️ At Risk:
  - 2 critical issues still in progress
  - 5 days until v1.0 release

📊 Milestone Progress:
  [████████████░░░░░░░░] 60% Complete (15/25 issues)
```

## Use Cases

### Morning Routine
```bash
# Check yesterday's progress
/bl:standup

# Plan today's work based on recommendations
/bl:next --count 5
```

### Sprint Review
```bash
# Generate sprint summary
/bl:standup --days 14 --milestone "Sprint 2025-Q1-01"
```

### Team Coordination
```bash
# Check each team member's status
/bl:standup --assignee johndoe
/bl:standup --assignee janedoe
/bl:standup --assignee bobsmith
```

### Unblock Issues
```bash
# Find blocked issues
/bl:standup

# If blockers exist, check details
/bl:blocked
```

## Report Sections

**Completed:**
- Issues moved to Closed or Resolved status
- Includes completion date and resolution
- Sorted by completion time (most recent first)

**In Progress:**
- Issues currently being worked on
- Shows progress percentage from comments
- Includes start date and time in progress

**Blocked:**
- Issues marked as blocked or waiting
- Shows blocker reason and dependencies
- Indicates how long issue has been blocked

**Plan for Today:**
- Recommended next tasks from `/bl:next` algorithm
- Prioritized by urgency and importance
- Limited to top 3-5 most critical items

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**Invalid User:**
```
❌ Error: User "unknown_user" not found in project
💡 Use /bl:project-info to view project members
```

**No Activity:**
```
📅 Daily Standup Report - 2025-01-10
👤 User: johndoe

✅ Completed Yesterday: (none)
🔄 In Progress: (none)
⚠️ Blocked: (none)

💡 No activity in the last 1 day
💡 Use /bl:next to get task recommendations
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `get_issue_list` with date filters
- Fetches issue comments for progress detection
- Queries user activity history

**Progress Detection:**
- Parses comments for progress indicators (%, "complete", "done")
- Tracks status transitions (Open → In Progress → Resolved)
- Calculates time in each status

**Velocity Calculation:**
- Completed issues / days in period
- Used for sprint planning and capacity forecasting
- Includes trend analysis for multi-day reports

**Blocking Detection:**
- Identifies issues with blocked status
- Parses comments for "blocked by", "waiting for"
- Shows dependency chains when available

## Related Commands

- `/bl:next` - Get recommended next tasks
- `/bl:blocked` - Show all blocked issues with details
- `/bl:in-progress` - View all in-progress issues
- `/bl:issue-list` - Custom issue filtering
- `/bl:status` - Project-wide status dashboard
