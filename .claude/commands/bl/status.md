# /bl:status - Project Status Dashboard

Display comprehensive project status dashboard with metrics and insights.

## Usage

```bash
/bl:status [--milestone <version>] [--format dashboard|detailed]
```

## Arguments

- `--milestone` (optional): Filter to specific milestone/version
- `--format` (optional): Output format (dashboard, detailed) - default: dashboard

## Behavior

1. Fetch all issues from project
2. Aggregate by status, type, priority
3. Calculate completion percentage
4. Identify blockers and overdue issues
5. Show recent activity
6. Display formatted dashboard

## Implementation

```python
project = load_project_context()

# Build filter
filters = {
    'projectId[]': [project['projectId']]
}

milestone_filter = get_arg('--milestone')
if milestone_filter:
    milestone_id = resolve_version(milestone_filter, project)
    filters['milestoneId[]'] = [milestone_id]

# Fetch all issues
all_issues = call_mcp('backlog_get_issues', **filters)

# Aggregate statistics
stats = {
    'total': len(all_issues),
    'byStatus': aggregate_by(all_issues, 'status.name'),
    'byType': aggregate_by(all_issues, 'issueType.name'),
    'byPriority': aggregate_by(all_issues, 'priority.name'),
    'blockers': filter_blocked(all_issues),
    'overdue': filter_overdue(all_issues),
    'recentActivity': get_recent_activity(all_issues, days=7)
}

# Calculate completion
closed_count = stats['byStatus'].get('Closed', 0) + stats['byStatus'].get('Resolved', 0)
completion_pct = (closed_count / stats['total'] * 100) if stats['total'] > 0 else 0

# Display dashboard
display_status_dashboard(stats, completion_pct, project, milestone_filter)
```

## Output Format

### Dashboard Format (Default)

```
📊 Project Status: MYPRJ - My Project

Overall Progress:
[████████████░░░░░░░░] 60% Complete (120/200 issues)

By Status:
  ✅ Closed:        120 (60%)
  🔄 In Progress:    35 (17.5%)
  📋 Open:           45 (22.5%)

By Type:
  🎯 Feature:        80 (40%)
  🐛 Bug:            60 (30%)
  📝 Task:           60 (30%)

By Priority:
  🔴 High:           25 (12.5%)
  🟡 Normal:        150 (75%)
  🟢 Low:            25 (12.5%)

Recent Activity (last 7 days):
  ✅ Closed:         15 issues
  🆕 Created:        12 issues
  💬 Comments:       48 comments

⚠️ Attention Required:
  🚨 Blockers:       3 issues
  📅 Overdue:        5 issues

💡 Use /bl:blocked to see blocked issues
💡 Use /bl:next to get recommended tasks
```

### Detailed Format

```
📊 Detailed Project Status: MYPRJ - My Project
───────────────────────────────────────────────

📈 PROGRESS SUMMARY
Total Issues: 200
Completed: 120 (60%)
In Progress: 35 (17.5%)
Open: 45 (22.5%)

Progress Bar:
[████████████░░░░░░░░] 60%

🏷️ BY ISSUE TYPE
┌──────────┬───────┬────────────┬────────┐
│ Type     │ Total │ Completed  │ Rate   │
├──────────┼───────┼────────────┼────────┤
│ Feature  │ 80    │ 50         │ 62.5%  │
│ Bug      │ 60    │ 40         │ 66.7%  │
│ Task     │ 60    │ 30         │ 50.0%  │
└──────────┴───────┴────────────┴────────┘

⭐ BY PRIORITY
┌──────────┬───────┬────────────┐
│ Priority │ Total │ Percentage │
├──────────┼───────┼────────────┤
│ High     │ 25    │ 12.5%      │
│ Normal   │ 150   │ 75.0%      │
│ Low      │ 25    │ 12.5%      │
└──────────┴───────┴────────────┘

📊 BY STATUS
┌──────────────┬───────┬────────────┐
│ Status       │ Count │ Percentage │
├──────────────┼───────┼────────────┤
│ Closed       │ 120   │ 60.0%      │
│ In Progress  │ 35    │ 17.5%      │
│ Open         │ 45    │ 22.5%      │
└──────────────┴───────┴────────────┘

📅 RECENT ACTIVITY (Last 7 Days)
Issues Closed: 15
Issues Created: 12
Comments Added: 48
Net Change: +3 open issues

🚨 ATTENTION REQUIRED
Blocked Issues: 3
  - MYPRJ-130: Waiting for DB access
  - MYPRJ-131: Build pipeline failure
  - MYPRJ-132: Test environment unavailable

Overdue Issues: 5
  - MYPRJ-140: Due 2 days ago
  - MYPRJ-141: Due 1 day ago
  - MYPRJ-142: Due today

🎯 TOP PRIORITIES
Next Recommended: MYPRJ-125 (Score: 95)

📊 VELOCITY METRICS
Issues closed this week: 15
Average per day: 2.1
Estimated completion (at current rate): 25 days

───────────────────────────────────────────────
💡 Quick Actions:
  - /bl:blocked - View blocked issues
  - /bl:next - Get next task
  - /bl:issue-list --status Open - View all open issues
```

## Milestone-Specific Status

```bash
/bl:status --milestone v1.0
```

Output:
```
📊 Milestone Status: v1.0
Due Date: 2025-02-01 (22 days remaining)

Progress:
[████████████████░░░░] 80% Complete (40/50 issues)

By Status:
  ✅ Closed:        40 (80%)
  🔄 In Progress:    8 (16%)
  📋 Open:           2 (4%)

⚠️ Risk Assessment: 🟢 On Track
  - Burn rate: 2.3 issues/day
  - Required rate: 0.4 issues/day
  - Buffer: 18 days

Top Priorities for v1.0:
  1. MYPRJ-145: Final integration testing
  2. MYPRJ-146: Documentation updates
```

## Example Usage

**Full dashboard**:
```bash
/bl:status
```

**Detailed view**:
```bash
/bl:status --format detailed
```

**Milestone-specific**:
```bash
/bl:status --milestone v1.0
```

## Related Commands

- `/bl:blocked` - View blocked issues
- `/bl:in-progress` - View in-progress issues
- `/bl:next` - Get recommended next task
- `/bl:standup` - Daily standup report
