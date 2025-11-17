# /bl:in-progress - Show In-Progress Issues

Display all issues currently being worked on with assignee, progress, and activity information.

## Syntax

```bash
/bl:in-progress [--assignee <user>] [--project <key>] [--sort activity|priority|age]
```

## Arguments

- `--assignee <user>`: Filter by assignee (default: show all)
- `--project <key>`: Specify project (default: current project)
- `--sort <method>`: Sort method (activity = recent updates, priority = priority level, age = longest running)

## Behavior

1. **Fetch Active Issues**: Query all issues with "In Progress" status
2. **Calculate Progress**: Parse comments and updates for progress indicators
3. **Track Activity**: Show last update time and recent comments
4. **Format Display**: Group by assignee with progress metrics
5. **Highlight Stale**: Flag issues without recent updates (>3 days)

## Examples

### Show All In-Progress Issues
```bash
/bl:in-progress
```

**Output:**
```
🔄 In-Progress Issues (5 found)

👤 johndoe (2 issues):
  1. MYPRJ-125 - Fix critical API bug
     📊 Priority: High
     🎯 Progress: 80% complete
     💬 Last update: 2 hours ago
     ⏰ In progress: 2 days

  2. MYPRJ-126 - Update documentation
     📊 Priority: Normal
     🎯 Progress: started
     💬 Last update: 5 hours ago
     ⏰ In progress: 1 day

👤 janedoe (2 issues):
  3. MYPRJ-132 - Design system integration
     📊 Priority: High
     🎯 Progress: 60% complete
     💬 Last update: 30 minutes ago
     ⏰ In progress: 3 days

  4. MYPRJ-133 - Mobile UI fixes
     📊 Priority: Normal
     🎯 Progress: 40% complete
     💬 Last update: 1 day ago
     ⏰ In progress: 2 days

👤 Unassigned (1 issue):
  5. MYPRJ-134 - Performance optimization
     📊 Priority: Low
     🎯 Progress: 25% complete
     💬 Last update: 4 days ago ⚠️
     ⏰ In progress: 5 days ⚠️
     💡 Consider reassigning or updating

📊 Summary:
  Total: 5 issues in progress
  High priority: 2
  Stale (>3 days no update): 1
  Average progress: 57%
```

### Filter by Assignee
```bash
/bl:in-progress --assignee johndoe
```

**Output:**
```
🔄 In-Progress Issues - johndoe (2 issues)

1. MYPRJ-125 - Fix critical API bug
   📊 Priority: High | 🎯 80% complete
   💬 "Almost done, finalizing tests"
   ⏰ Updated: 2 hours ago | In progress: 2 days

2. MYPRJ-126 - Update documentation
   📊 Priority: Normal | 🎯 Started
   💬 "Documenting API endpoints"
   ⏰ Updated: 5 hours ago | In progress: 1 day

💡 Next recommended: /bl:next --assignee johndoe
```

### Sort by Priority
```bash
/bl:in-progress --sort priority
```

**Output:**
```
🔄 In-Progress Issues (sorted by priority)

🔴 High Priority (2 issues):
  1. MYPRJ-125 - Fix critical API bug (johndoe, 80%)
  2. MYPRJ-132 - Design system integration (janedoe, 60%)

🟡 Normal Priority (2 issues):
  3. MYPRJ-126 - Update documentation (johndoe, started)
  4. MYPRJ-133 - Mobile UI fixes (janedoe, 40%)

🟢 Low Priority (1 issue):
  5. MYPRJ-134 - Performance optimization (unassigned, 25%)
```

### Sort by Activity (Recent Updates First)
```bash
/bl:in-progress --sort activity
```

**Output:**
```
🔄 In-Progress Issues (sorted by recent activity)

1. MYPRJ-132 - Design system integration
   👤 janedoe | 🎯 60% | ⏰ 30 minutes ago

2. MYPRJ-125 - Fix critical API bug
   👤 johndoe | 🎯 80% | ⏰ 2 hours ago

3. MYPRJ-126 - Update documentation
   👤 johndoe | 🎯 started | ⏰ 5 hours ago

4. MYPRJ-133 - Mobile UI fixes
   👤 janedoe | 🎯 40% | ⏰ 1 day ago

5. ⚠️ MYPRJ-134 - Performance optimization
   👤 unassigned | 🎯 25% | ⏰ 4 days ago (STALE)
```

### Sort by Age (Longest Running First)
```bash
/bl:in-progress --sort age
```

**Output:**
```
🔄 In-Progress Issues (sorted by age)

1. ⚠️ MYPRJ-134 - Performance optimization
   👤 unassigned | 🎯 25% | ⏰ In progress: 5 days
   💡 Stale issue - consider intervention

2. MYPRJ-132 - Design system integration
   👤 janedoe | 🎯 60% | ⏰ In progress: 3 days

3. MYPRJ-125 - Fix critical API bug
   👤 johndoe | 🎯 80% | ⏰ In progress: 2 days

4. MYPRJ-133 - Mobile UI fixes
   👤 janedoe | 🎯 40% | ⏰ In progress: 2 days

5. MYPRJ-126 - Update documentation
   👤 johndoe | 🎯 started | ⏰ In progress: 1 day
```

## Use Cases

### Daily Standup
```bash
# Check your active work
/bl:in-progress --assignee me

# Review team's active work
/bl:in-progress
```

### Team Coordination
```bash
# See what each team member is working on
/bl:in-progress --sort activity

# Identify stale issues needing attention
/bl:in-progress --sort age
```

### Manager Review
```bash
# Check team workload distribution
/bl:in-progress

# Focus on high-priority items
/bl:in-progress --sort priority
```

### Sprint Progress
```bash
# Review sprint in-progress work
/bl:in-progress --milestone "Sprint 2025-Q1"

# Check if issues are progressing
/bl:in-progress --sort activity
```

## Progress Detection

Progress indicators are extracted from:
- **Comments**: Patterns like "80%", "80% complete", "80% done"
- **Custom Fields**: Progress percentage field if configured
- **Status Transitions**: Time in each status
- **Activity**: Recent comments and updates

**Progress Labels:**
- `started` - Recently moved to in-progress, no percentage yet
- `N% complete` - Explicit percentage from comments
- `nearly done` - 90%+ progress
- `stale` - No updates in >3 days

## Stale Issue Detection

Issues are flagged as stale when:
- No updates in >3 days
- No comments in >5 days
- Status unchanged for >7 days

**Stale Indicators:**
- ⚠️ warning icon
- Yellow/red highlighting
- Suggested actions (reassign, update, close)

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**No In-Progress Issues:**
```
✅ No in-progress issues found

💡 Use /bl:next to get task recommendations
💡 Use /bl:issue-list --status Open to see available work
```

**Invalid Assignee:**
```
❌ Error: User "unknown_user" not found in project
💡 Use /bl:project-info to view project members
```

## Implementation Notes

**Backlog API Integration:**
- Uses GET `/api/v2/issues` with status filter for "In Progress"
- Fetches comments via GET `/api/v2/issues/:issueIdOrKey/comments`
- Queries issue history for activity tracking

**Progress Parsing:**
- Regex patterns: `(\d+)%`, `(\d+) percent`, `(\d+)% complete`
- Comment keywords: "progress", "complete", "done", "finished"
- Default to "started" if no percentage found

**Activity Calculation:**
- Last updated timestamp from Backlog API
- Comment recency check
- Status change history

**Sorting Algorithms:**
- Activity: Sort by last updated time (DESC)
- Priority: High → Normal → Low, then by update time
- Age: Sort by in-progress duration (DESC)

## Related Commands

- `/bl:standup` - Daily report including in-progress work
- `/bl:blocked` - Show blocked issues (opposite of active progress)
- `/bl:next` - Get next task recommendations
- `/bl:issue-update` - Update issue status or progress
- `/bl:issue-comment` - Add progress update comments
- `/bl:status` - Project-wide status dashboard
