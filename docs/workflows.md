# cc-backlog Workflow Guide

English | [日本語](./workflows.ja.md)

Common project management workflows using cc-backlog commands.

## Table of Contents

1. [Feature Development](#feature-development)
2. [Bug Triage and Fixing](#bug-triage-and-fixing)
3. [Sprint Planning](#sprint-planning)
4. [Daily Standup](#daily-standup)
5. [Release Management](#release-management)

---

## Feature Development

End-to-end workflow for developing a new feature with task breakdown.

### Workflow Overview

```
Issue Creation → Task Selection → Implementation → Closure → Status Check
```

### Step-by-Step

#### 1. Set Project Context

```bash
# List available projects
/bl:project-list

# Set working project
/bl:project-set MYPRJ

# Verify project is set
/bl:project-info
```

**Output**:
```
✅ Project set: MYPRJ - My Project
📊 Issues: 45 open, 120 closed
👥 Members: 8
```

#### 2. Create Feature Issues

```bash
# Create issues for user authentication feature
/bl:issue-create --title "Implement JWT middleware" --type Feature --priority High --milestone v1.0
/bl:issue-create --title "Add login endpoint" --type Feature --priority High --milestone v1.0
/bl:issue-create --title "Add token refresh endpoint" --type Feature --priority Normal --milestone v1.0
```

**Output**:
```
✅ Issue created: MYPRJ-123 - Implement JWT middleware
🔗 https://my-space.backlog.com/view/MYPRJ-123
📊 Type: Feature | Priority: High

✅ Issue created: MYPRJ-124 - Add login endpoint
🔗 https://my-space.backlog.com/view/MYPRJ-124
📊 Type: Feature | Priority: High
...
```

#### 3. Get Next Recommended Task

```bash
# Get top 3 recommended tasks
/bl:next --count 3
```

**Output**:
```
🎯 Recommended next tasks:

1. 🔴 MYPRJ-123 - Implement JWT middleware
   Type: Feature | Priority: High | Due: This week
   Score: 85/100
   💡 Milestone: v1.0

2. 🟡 MYPRJ-124 - Add login endpoint
   Type: Feature | Priority: Normal | Due: This week
   Score: 70/100
```

#### 4. Start Working on Task

```bash
# Start first recommended task
/bl:issue-start MYPRJ-123 --assignee-me --comment "Starting JWT implementation"
```

**Output**:
```
🚀 Started: MYPRJ-123 - Implement JWT middleware
📊 Status: Open → In Progress
👤 Assignee: johndoe (you)
💬 Comment added: "Starting JWT implementation"
⏰ Started at: 2025-01-10 14:30:00
```

#### 5. Add Progress Updates

```bash
# Update with progress comment
/bl:issue-comment MYPRJ-123 "Implemented token generation, working on validation"
```

#### 6. Close Completed Task

```bash
# Close when done
/bl:issue-close MYPRJ-123 --resolution Fixed --comment "JWT middleware complete with tests"
```

**Output**:
```
✅ Closed: MYPRJ-123 - Implement JWT middleware
📊 Status: In Progress → Closed
🔧 Resolution: Fixed
💬 Comment: "JWT middleware complete with tests"
```

#### 7. Check Overall Progress

```bash
# View project status
/bl:status --milestone v1.0
```

**Output**:
```
📊 Milestone Status: v1.0
Due Date: 2025-02-01 (22 days remaining)

Progress:
[██████░░░░░░░░░░░░░░] 30% Complete (3/10 issues)

By Status:
  ✅ Closed:        3 (30%)
  🔄 In Progress:    2 (20%)
  📋 Open:           5 (50%)
```

---

## Bug Triage and Fixing

Workflow for managing and fixing bugs efficiently.

### Step-by-Step

#### 1. Import Bugs from CSV

Create `bugs.csv`:
```csv
title,description,priority,category,assignee
"Login fails on mobile","Users cannot login from mobile browser",High,Frontend,johndoe
"API timeout","/api/users endpoint times out after 30s",High,Backend,janedoe
"Broken layout","Dashboard layout broken on IE11",Normal,Frontend,
```

```bash
# Import bugs
/bl:issue-bulk-create bugs.csv --type Bug
```

**Output**:
```
📂 Loading: bugs.csv
📊 Found 3 issues to create

Creating issues...
[███████████] 3/3 (100%)

✅ Successfully created: 3 issues
📋 Created issue keys: MYPRJ-200 to MYPRJ-202
```

#### 2. Get High-Priority Bug

```bash
# Get next critical bug
/bl:next --type Bug --priority High --count 1
```

#### 3. Start Investigation

```bash
# Start working on bug
/bl:issue-start MYPRJ-200 --assignee-me --comment "Investigating mobile login issue"
```

#### 4. Update with Findings

```bash
# Add investigation notes
/bl:issue-comment MYPRJ-200 "Root cause: Cookie not set on mobile Safari. Testing fix."
```

#### 5. Mark as Blocked (if needed)

```bash
# If blocked by external dependency
/bl:issue-update MYPRJ-200 --status Blocked --add-comment "Waiting for API team to enable CORS"

# Check all blocked issues
/bl:blocked
```

#### 6. Unblock and Continue

```bash
# Resume when unblocked
/bl:issue-update MYPRJ-200 --status "In Progress" --add-comment "CORS enabled, continuing fix"
```

#### 7. Close Fixed Bug

```bash
# Close when verified
/bl:issue-close MYPRJ-200 --resolution Fixed --comment "Fixed cookie handling for mobile Safari. Tested on iOS 15+16."
```

---

## Sprint Planning

Plan and track sprint work with milestones.

### Step-by-Step

#### 1. Create Sprint Milestone

```bash
# Create 2-week sprint
/bl:milestone-create "Sprint 2025-Q1-01" \
  --description "Sprint 1 of Q1 2025" \
  --start-date 2025-01-15 \
  --due-date 2025-01-29
```

#### 2. Create Sprint Backlog

Create `sprint-backlog.csv`:
```csv
title,description,type,priority,assignee,estimatedHours
"User dashboard","Create analytics dashboard",Feature,High,johndoe,16
"API rate limiting","Implement rate limiting",Task,Normal,janedoe,8
"Fix mobile nav","Navigation broken on mobile",Bug,High,bobsmith,4
```

```bash
# Import sprint tasks
/bl:issue-bulk-create sprint-backlog.csv --milestone "Sprint 2025-Q1-01"
```

#### 3. Assign Sprint Issues to Milestone

```bash
# Assign existing issues to sprint
/bl:milestone-assign "Sprint 2025-Q1-01" MYPRJ-150 MYPRJ-151 MYPRJ-152
```

#### 4. Daily Progress Tracking

```bash
# Morning: Get today's focus
/bl:next --milestone "Sprint 2025-Q1-01" --assignee me --count 3

# During day: Update issues
/bl:issue-start MYPRJ-150 --assignee-me
/bl:issue-comment MYPRJ-150 "50% complete - dashboard layout done"

# End of day: Close completed
/bl:issue-close MYPRJ-150 --resolution Fixed
```

#### 5. Sprint Status

```bash
# Check sprint progress
/bl:status --milestone "Sprint 2025-Q1-01"
```

**Output**:
```
📊 Milestone Status: Sprint 2025-Q1-01
Due Date: 2025-01-29 (5 days remaining)

Progress:
[████████████████░░░░] 80% Complete (24/30 issues)

⚠️ Risk Assessment: 🟡 At Risk
  - Burn rate: 3.2 issues/day
  - Required rate: 1.2 issues/day
  - Buffer: 2 days

Top Priorities:
  1. MYPRJ-160: Critical integration test
  2. MYPRJ-161: Performance optimization
```

---

## Daily Standup

Generate daily standup reports showing completed, in-progress, and blocked issues.

### Morning Routine

```bash
# 1. Check yesterday's progress
/bl:standup --days 1

# 2. Get today's recommended tasks
/bl:next --assignee me --count 5

# 3. Check blockers
/bl:blocked --assignee me

# 4. Check overall status
/bl:status
```

**Example Standup Output**:
```
📅 Daily Standup Report - 2025-01-10
👤 User: johndoe

✅ Completed Yesterday:
  - MYPRJ-123: Implement JWT middleware
  - MYPRJ-124: Add login endpoint

🔄 In Progress:
  - MYPRJ-125: Token refresh logic (75% complete)
  - MYPRJ-126: User role management (just started)

⚠️ Blocked:
  (none)

📋 Plan for Today:
  🎯 MYPRJ-125: Complete token refresh
  🎯 MYPRJ-127: Start integration tests

💬 Total comments: 8
```

### During Work

```bash
# Start first task
/bl:issue-start MYPRJ-125 --assignee-me

# Add progress updates
/bl:issue-comment MYPRJ-125 "Completed token refresh logic, writing tests"

# Switch tasks if needed
/bl:issue-update MYPRJ-125 --add-comment "Pausing for code review"
/bl:issue-start MYPRJ-127 --assignee-me
```

### End-of-Day

```bash
# Close completed issues
/bl:issue-close MYPRJ-125 --resolution Fixed --comment "Token refresh complete with tests"

# Update in-progress
/bl:issue-comment MYPRJ-127 "Integration tests 60% complete, continuing tomorrow"

# Generate summary
/bl:standup --days 1
```

---

## Release Management

Manage releases with milestones and version tracking.

### Pre-Release

```bash
# 1. Create release milestone
/bl:milestone-create "v1.0.0" \
  --description "First major release" \
  --due-date 2025-02-01

# 2. Check milestone progress
/bl:status --milestone v1.0.0

# 3. Identify blockers
/bl:issue-list --milestone v1.0.0 --status Open --priority High

# 4. Close remaining issues
/bl:next --milestone v1.0.0 --count 10
```

### Release Day

```bash
# 1. Verify all issues closed
/bl:status --milestone v1.0.0

# 2. Create release notes issue
/bl:issue-create \
  --title "Release v1.0.0 Notes" \
  --type Task \
  --milestone v1.0.0 \
  --description "$(cat release-notes.md)"

# 3. Update release issue
/bl:issue-comment RELEASE-ISSUE "Release deployed to production"
```

### Post-Release

```bash
# 1. Create next milestone
/bl:milestone-create "v1.1.0" --due-date 2025-06-01

# 2. Move unfinished issues
/bl:milestone-assign "v1.1.0" MYPRJ-180 MYPRJ-181

# 3. Start planning next iteration
/bl:status --milestone v1.1.0
```

---

## Best Practices

### 1. Start Every Session

```bash
/bl:project-info    # Verify project context
/bl:next            # Get recommended tasks
/bl:status          # Check overall progress
```

### 2. Keep Issues Updated

```bash
# When starting work
/bl:issue-start <key> --assignee-me

# During work
/bl:issue-comment <key> "Progress update"

# When done
/bl:issue-close <key> --resolution Fixed
```

### 3. Use Milestones

```bash
# Group related work
/bl:milestone-create "Feature X"
/bl:milestone-assign "Feature X" <issue_keys...>

# Track progress
/bl:status --milestone "Feature X"
```

### 4. Regular Status Checks

```bash
# Daily
/bl:standup --days 1
/bl:next

# Weekly
/bl:status
/bl:blocked
```

---

## Next Steps

- Review [Command Reference](../README.md#command-reference) for all available commands
- Check [Setup Guide](./setup.md) for configuration options
- Read [SPECIFICATION.md](../SPECIFICATION.md) for technical details

---

## Support

- 📚 [Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [Discussions](https://github.com/bellsanct/cc-backlog/discussions)
