# /bl:blocked - Show Blocked Issues

Display all blocked issues with blocker reasons, dependencies, and duration.

## Syntax

```bash
/bl:blocked [--assignee <user>] [--project <key>] [--all]
```

## Arguments

- `--assignee <user>`: Filter by assignee (default: show all)
- `--project <key>`: Specify project (default: current project)
- `--all`: Include resolved blocked issues (default: active only)

## Behavior

1. **Fetch Blocked Issues**: Query issues with "Blocked" status or custom blocker field
2. **Parse Blocker Info**: Extract blocker reasons from issue fields and comments
3. **Calculate Duration**: Determine how long each issue has been blocked
4. **Identify Dependencies**: Find blocking issues and external dependencies
5. **Format Report**: Display with priority, assignee, and resolution suggestions

## Examples

### Show All Blocked Issues
```bash
/bl:blocked
```

**Output:**
```
⚠️ Blocked Issues (3 found)

1. 🔴 MYPRJ-130 - Database migration script
   👤 Assignee: johndoe
   📊 Priority: High
   🚫 Reason: Waiting for DB access approval
   🔗 Blocked by: MYPRJ-128 (IT ticket pending)
   ⏰ Blocked for: 3 days (since 2025-01-07)
   💡 Action: Follow up with IT team

2. 🟡 MYPRJ-131 - Deploy to staging
   👤 Assignee: janedoe
   📊 Priority: Normal
   🚫 Reason: Build pipeline failure
   🔗 Blocked by: MYPRJ-125 (Critical bug fix needed)
   ⏰ Blocked for: 1 day (since 2025-01-09)
   💡 Action: Wait for MYPRJ-125 completion

3. 🟢 MYPRJ-132 - Update API documentation
   👤 Assignee: bobsmith
   📊 Priority: Low
   🚫 Reason: Waiting for API changes to stabilize
   🔗 External dependency: API v2 release
   ⏰ Blocked for: 5 days (since 2025-01-05)
   💡 Action: Check API team progress

💡 Total blocked issues: 3
⚠️ Critical attention needed: 1 (blocked >2 days)
```

### Filter by Assignee
```bash
/bl:blocked --assignee johndoe
```

**Output:**
```
⚠️ Blocked Issues - johndoe (1 found)

1. 🔴 MYPRJ-130 - Database migration script
   📊 Priority: High
   🚫 Reason: Waiting for DB access approval
   🔗 Blocked by: MYPRJ-128 (IT ticket pending)
   ⏰ Blocked for: 3 days
   💡 Action: Escalate to manager

💡 Suggest: Work on MYPRJ-134 while waiting
```

### No Blocked Issues
```bash
/bl:blocked
```

**Output:**
```
✅ No blocked issues found

🎉 All issues are progressing smoothly!
💡 Use /bl:in-progress to see active work
```

### Include Resolved Blockers
```bash
/bl:blocked --all
```

**Output:**
```
⚠️ Blocked Issues (Active: 2, Resolved: 3)

Active:
1. MYPRJ-130 - Database migration
   🚫 Blocked for: 3 days

2. MYPRJ-131 - Deploy to staging
   🚫 Blocked for: 1 day

Recently Resolved:
✅ MYPRJ-125 - API bug fix
   Was blocked: 2 days
   Resolved: 2025-01-09

✅ MYPRJ-126 - UI component
   Was blocked: 4 days
   Resolved: 2025-01-08

📊 Average resolution time: 3 days
💡 Current blockers on track for resolution
```

## Use Cases

### Daily Standup
```bash
# Check blockers before standup
/bl:blocked

# Review team blockers
/bl:blocked --assignee me
```

### Team Coordination
```bash
# Identify blockers across team
/bl:blocked

# Help unblock team members
for user in johndoe janedoe bobsmith; do
  /bl:blocked --assignee $user
done
```

### Sprint Planning
```bash
# Review blockers before sprint start
/bl:blocked --all

# Identify recurring blockers
/bl:blocked | grep "Blocked for: [3-9]"
```

### Manager Review
```bash
# Check all project blockers
/bl:blocked

# Escalate long-running blockers
/bl:blocked | grep "days" | awk '{if ($5 > 2) print}'
```

## Blocker Information

**Blocker Reasons:**
- Extracted from "Blocked Reason" custom field
- Parsed from issue comments (keywords: "blocked", "waiting", "dependency")
- Categorized as internal (issue dependencies) or external (third-party)

**Blocking Issues:**
- Detected from issue links and dependencies
- Shows current status of blocking issue
- Provides direct link to blocking issue

**Duration Tracking:**
- Calculates time since status changed to "Blocked"
- Highlights issues blocked >2 days as critical
- Trends blocked duration for team metrics

**Resolution Suggestions:**
- Escalation paths for long-running blocks
- Alternative tasks to work on during blockage
- Estimated unblock timeline based on blocking issue progress

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**Invalid Assignee:**
```
❌ Error: User "unknown_user" not found in project
💡 Use /bl:project-info to view project members
```

**API Error:**
```
❌ Error: Unable to fetch blocked issues
💡 Check Backlog API credentials and network connection
```

## Implementation Notes

**Backlog API Integration:**
- Uses GET `/api/v2/issues` with status filter for "Blocked"
- Queries custom fields via GET `/api/v2/issues/:issueIdOrKey`
- Fetches issue comments via GET `/api/v2/issues/:issueIdOrKey/comments`

**Blocker Detection:**
- Primary: Issues with status = "Blocked"
- Secondary: Custom "Blocker Reason" field populated
- Tertiary: Recent comments containing block keywords

**Dependency Analysis:**
- Parses issue links for "blocks" relationship
- Checks parent/child issue dependencies
- Identifies external dependencies from comments

**Duration Calculation:**
- Tracks status history for "Blocked" transitions
- Calculates elapsed time since last block
- Flags issues blocked >48 hours as critical

## Related Commands

- `/bl:standup` - Includes blocked issues in daily report
- `/bl:in-progress` - Show active work (alternative to blocked)
- `/bl:issue-update` - Update issue status to unblock
- `/bl:issue-comment` - Add blocker resolution updates
- `/bl:status` - Project-wide status including blockers
