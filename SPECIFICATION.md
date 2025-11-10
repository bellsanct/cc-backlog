# cc-backlog - Complete Specification

**Version:** 1.0.0
**Date:** 2025-01-10
**Status:** Draft

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Command Reference](#3-command-reference)
4. [Data Structures](#4-data-structures)
5. [BacklogMCP Integration](#5-backlogmcp-integration)
6. [Workflow Examples](#6-workflow-examples)
7. [Implementation Roadmap](#7-implementation-roadmap)
8. [Design Decisions](#8-design-decisions)

---

## 1. Project Overview

### 1.1 Purpose

**cc-backlog** is a Claude Code extension that brings project management capabilities to Backlog through a command-line interface. It enables PM workflows directly within Claude Code sessions.

### 1.2 Core Concepts

- **Project as Database**: Each Backlog project serves as an independent task database
- **Issue-Only Management**: No Git worktrees required, all state managed through Backlog issues
- **Command Prefix**: All commands use `/bl:` prefix for consistency
- **BacklogMCP Integration**: Built on [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server)

### 1.3 Key Features

- Project context management with persistent state
- Issue lifecycle management (create, start, update, close)
- Intelligent task prioritization (`/bl:next`)
- Progress dashboards and reporting
- Bulk operations with batch processing
- Template-based issue creation
- Cross-session persistence

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Claude Code CLI                       │
│                   User Interface                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              cc-backlog Commands                        │
│               (.claude/commands/bl/)                    │
└────────────────────┬────────────────────────────────────┘
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
┌──────────────┐          ┌──────────────────┐
│Context Layer │          │  BacklogMCP      │
│ (JSON Store) │◄────────►│  Integration     │
└──────────────┘          └─────────┬────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   Backlog API    │
                          │ (REST Endpoint)  │
                          └──────────────────┘
```

### 2.2 Directory Structure

```
cc-backlog/
├── .claude/
│   ├── commands/bl/              # Command implementations
│   │   ├── project-set.md
│   │   ├── project-list.md
│   │   ├── project-info.md
│   │   ├── issue-create.md
│   │   ├── issue-bulk-create.md
│   │   ├── issue-start.md
│   │   ├── issue-update.md
│   │   ├── issue-comment.md
│   │   ├── issue-close.md
│   │   ├── issue-list.md
│   │   ├── next.md
│   │   ├── status.md
│   │   ├── standup.md
│   │   ├── blocked.md
│   │   ├── in-progress.md
│   │   ├── milestone-create.md
│   │   ├── milestone-list.md
│   │   ├── milestone-assign.md
│   │   ├── sync.md
│   │   └── export.md
│   ├── context/                  # Persistent context files
│   │   ├── backlog-project.json
│   │   ├── backlog-config.json
│   │   ├── current-issue.json
│   │   ├── issue-cache.json
│   │   ├── workflow-config.json
│   │   └── session-history.json
│   └── templates/                # Issue templates
│       ├── issue-feature.md
│       ├── issue-bug.md
│       ├── issue-task.md
│       └── template-registry.json
├── docs/
│   ├── setup.md                  # Setup guide
│   ├── commands.md               # Command reference
│   ├── workflows.md              # Workflow examples
│   └── troubleshooting.md        # Common issues
├── examples/
│   └── sample-workflows/         # Example workflows
├── SPECIFICATION.md              # This file
└── README.md                     # Project overview
```

### 2.3 Component Responsibilities

#### 2.3.1 Command Layer

- Parse user input and arguments
- Validate command syntax
- Coordinate context reads/writes
- Call BacklogMCP tools
- Format and display output

#### 2.3.2 Context Layer

- Persist project state across sessions
- Maintain issue cache for performance
- Track current work context
- Store user preferences

#### 2.3.3 BacklogMCP Integration Layer

- Abstract Backlog API calls
- Handle authentication
- Manage rate limiting
- Process API responses
- Error handling and retry logic

---

## 3. Command Reference

### 3.1 Command Categories

Commands are organized into 5 functional categories:

1. **Project Context**: `project-set`, `project-list`, `project-info`
2. **Issue Management**: `issue-create`, `issue-start`, `issue-update`, `issue-close`, etc.
3. **Workflow**: `next`, `status`, `standup`, `blocked`, `in-progress`
4. **Milestones**: `milestone-create`, `milestone-list`, `milestone-assign`
5. **Sync**: `sync`, `export`

### 3.2 Project Context Commands

#### 3.2.1 `/bl:project-set`

**Purpose**: Set the working project context

**Syntax**:

```bash
/bl:project-set <project_key_or_name> [--space <space_key>]
```

**Arguments**:

- `<project_key_or_name>` (required): Project key (e.g., MYPRJ) or project name
- `--space <space_key>` (optional): Backlog space key for multi-space setups

**Behavior**:

1. Call BacklogMCP `get_project_list` to fetch available projects
2. Match argument to project (key exact match → name partial match)
3. If multiple matches, prompt user for selection
4. Fetch project metadata via BacklogMCP `get_project`
5. Save to `.claude/context/backlog-project.json`
6. Display project summary

**Output Example**:

```
✅ Project set: MYPRJ - My Project
📊 Issues: 45 open, 120 closed
👥 Members: 8
📍 Context saved to .claude/context/backlog-project.json
```

**Error Handling**:

- No match found → Display similar project names
- Multiple matches → Interactive selection prompt
- API error → Display configuration help

---

#### 3.2.2 `/bl:project-list`

**Purpose**: List available Backlog projects

**Syntax**:

```bash
/bl:project-list [--active-only] [--format table|json]
```

**Arguments**:

- `--active-only`: Filter to non-archived projects only
- `--format`: Output format (default: table)

**Behavior**:

1. Call BacklogMCP `get_project_list`
2. Filter if `--active-only` specified
3. Format as table or JSON
4. Display with usage hint

**Output Example**:

```
Available Projects:
┌──────────┬─────────────────┬─────────┬────────┐
│ Key      │ Name            │ Issues  │ Status │
├──────────┼─────────────────┼─────────┼────────┤
│ MYPRJ    │ My Project      │ 165     │ Active │
│ DEMO     │ Demo Project    │ 23      │ Active │
│ ARCHIVE  │ Old Project     │ 450     │ Closed │
└──────────┴─────────────────┴─────────┴────────┘

💡 Use /bl:project-set <key> to set working project
```

---

#### 3.2.3 `/bl:project-info`

**Purpose**: Display current project details

**Syntax**:

```bash
/bl:project-info [--verbose]
```

**Behavior**:

1. Read `.claude/context/backlog-project.json`
2. Call BacklogMCP `get_project` for fresh data
3. Display project metadata
4. If `--verbose`, include categories, versions, members

**Output Example**:

```
📁 Current Project: MYPRJ - My Project
🔑 Project Key: MYPRJ
🆔 Project ID: 12345
📊 Issues: 45 open / 120 closed
🏷️ Categories: Feature (20), Bug (15), Task (10)
📅 Versions: v1.0, v1.1, v2.0-beta
👥 Members: 8 active
⏰ Set at: 2025-01-10 12:00:00
```

---

### 3.3 Issue Management Commands

#### 3.3.1 `/bl:issue-create`

**Purpose**: Create a single issue

**Syntax**:

```bash
/bl:issue-create [--title <title>] [--description <desc>]
                 [--type <type>] [--priority <priority>]
                 [--assignee <user>] [--milestone <version>]
                 [--category <category>] [--template <template_name>]
                 [--interactive]
```

**Arguments**:

- `--title`: Issue title
- `--description`: Issue description (Markdown supported)
- `--type`: Issue type (Task, Bug, Feature, etc.)
- `--priority`: Priority (High, Normal, Low)
- `--assignee`: Assignee username or ID
- `--milestone`: Milestone/version name
- `--category`: Category name
- `--template`: Template name from `.claude/templates/`
- `--interactive`: Interactive input mode

**Behavior**:

1. Parse arguments or enter interactive mode
2. Apply template if specified
3. Validate required fields
4. Call BacklogMCP `add_issue`
5. Display created issue details

**Template Usage**:

```bash
/bl:issue-create --template feature --interactive
```

Templates are loaded from `.claude/templates/issue-<name>.md`

**Output Example**:

```
✅ Issue created: MYPRJ-123 - Implement user authentication
🔗 https://my-space.backlog.com/view/MYPRJ-123
📊 Type: Feature | Priority: High
👤 Assignee: johndoe
```

---

#### 3.3.2 `/bl:issue-bulk-create`

**Purpose**: Create multiple issues from CSV/JSON

**Syntax**:

```bash
/bl:issue-bulk-create <file_path> [--type <default_type>]
                      [--dry-run] [--batch-size <n>]
```

**Arguments**:

- `<file_path>`: Path to CSV or JSON file
- `--type`: Default issue type if not specified in file
- `--dry-run`: Preview only, don't create
- `--batch-size`: Number of issues to create per batch (default: 10)

**CSV Format**:

```csv
title,description,type,priority,assignee,category,milestone
"User login","Implement JWT auth",Feature,High,johndoe,Backend,v1.0
"Fix layout","Mobile view broken",Bug,High,janedoe,Frontend,
```

**JSON Format**:

```json
{
  "issues": [
    {
      "title": "User login",
      "description": "Implement JWT auth",
      "type": "Feature",
      "priority": "High",
      "assignee": "johndoe",
      "category": "Backend",
      "milestone": "v1.0"
    }
  ]
}
```

**Behavior**:

1. Parse file (CSV or JSON)
2. Validate all entries
3. If `--dry-run`, display preview and exit
4. Create issues in batches via BacklogMCP `add_issue`
5. Display progress bar
6. Report success/failure summary

**Output Example**:

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

---

#### 3.3.3 `/bl:issue-start`

**Purpose**: Start work on an issue

**Syntax**:

```bash
/bl:issue-start <issue_key> [--comment <comment>] [--assignee-me]
```

**Arguments**:

- `<issue_key>`: Issue key (e.g., MYPRJ-123)
- `--comment`: Comment to add when starting
- `--assignee-me`: Assign to current user

**Behavior**:

1. Fetch issue via BacklogMCP `get_issue`
2. Validate status transition (must be Open or similar)
3. Update status to "In Progress" via BacklogMCP `update_issue`
4. Assign to current user if `--assignee-me`
5. Add comment if `--comment` specified
6. Save to `.claude/context/current-issue.json`

**Output Example**:

```
🚀 Started: MYPRJ-123 - Implement user authentication
📊 Status: Open → In Progress
👤 Assignee: johndoe (you)
💬 Comment added: "Starting implementation"
⏰ Started at: 2025-01-10 14:30:00

📍 Current issue saved to .claude/context/current-issue.json
```

---

#### 3.3.4 `/bl:issue-update`

**Purpose**: Update issue properties

**Syntax**:

```bash
/bl:issue-update <issue_key> [--title <title>] [--description <desc>]
                 [--status <status>] [--priority <priority>]
                 [--assignee <user>] [--milestone <version>]
                 [--add-comment <comment>]
```

**Behavior**:

1. Collect specified update fields
2. Call BacklogMCP `update_issue`
3. Add comment if `--add-comment` specified
4. Display updated fields

**Output Example**:

```
✅ Updated: MYPRJ-123
📊 Changes:
  - Status: Open → In Progress
  - Priority: Normal → High
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

---

#### 3.3.5 `/bl:issue-comment`

**Purpose**: Add comment to issue

**Syntax**:

```bash
/bl:issue-comment <issue_key> <comment> [--notify <users>]
```

**Arguments**:

- `<issue_key>`: Issue key
- `<comment>`: Comment text (Markdown supported)
- `--notify`: Comma-separated list of users to mention

**Behavior**:

1. Format comment with mentions if `--notify` specified
2. Call BacklogMCP `add_comment`
3. Display confirmation

**Output Example**:

```
💬 Comment added to MYPRJ-123
📢 Notified: johndoe, janedoe
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

---

#### 3.3.6 `/bl:issue-close`

**Purpose**: Close an issue

**Syntax**:

```bash
/bl:issue-close <issue_key> [--resolution <resolution>]
                [--comment <comment>]
```

**Arguments**:

- `<issue_key>`: Issue key
- `--resolution`: Resolution reason (Fixed, Won't Fix, Duplicate, etc.)
- `--comment`: Closing comment

**Behavior**:

1. Update status to "Closed" via BacklogMCP `update_issue`
2. Set resolution if specified
3. Add comment if specified
4. Remove from `.claude/context/current-issue.json`

**Output Example**:

```
✅ Closed: MYPRJ-123 - Implement user authentication
📊 Status: In Progress → Closed
🔧 Resolution: Fixed
💬 Comment: "Implemented and tested successfully"
⏰ Closed at: 2025-01-10 16:45:00
```

---

#### 3.3.7 `/bl:issue-list`

**Purpose**: List issues with filters

**Syntax**:

```bash
/bl:issue-list [--status <status>] [--type <type>]
               [--assignee <user>] [--milestone <version>]
               [--priority <priority>] [--category <category>]
               [--sort <field>] [--limit <n>]
               [--format table|json|compact]
```

**Arguments**:

- `--status`: Status filter (Open, In Progress, Closed)
- `--type`: Issue type filter
- `--assignee`: Assignee filter (`me` for current user)
- `--milestone`: Milestone filter
- `--priority`: Priority filter
- `--category`: Category filter
- `--sort`: Sort field (priority, created, updated, dueDate)
- `--limit`: Max results (default: 20)
- `--format`: Output format

**Behavior**:

1. Build filter query from arguments
2. Call BacklogMCP `get_issues` with filters
3. Sort results
4. Format and display

**Output Example**:

```
📋 Issues (5 found, sorted by priority)
┌────────────┬──────────────────────────┬──────────┬──────────┬──────────┐
│ Key        │ Title                    │ Type     │ Priority │ Updated  │
├────────────┼──────────────────────────┼──────────┼──────────┼──────────┤
│ MYPRJ-123  │ Implement user auth      │ Feature  │ High     │ 2h ago   │
│ MYPRJ-125  │ Fix API endpoint         │ Bug      │ High     │ 1d ago   │
│ MYPRJ-130  │ Update documentation     │ Task     │ Normal   │ 3d ago   │
└────────────┴──────────────────────────┴──────────┴──────────┴──────────┘

💡 Use /bl:issue-start <key> to start working on an issue
```

---

### 3.4 Workflow Commands

#### 3.4.1 `/bl:next`

**Purpose**: Get recommended next task

**Syntax**:

```bash
/bl:next [--assignee me|<user>] [--type <type>] [--count <n>]
```

**Arguments**:

- `--assignee`: Filter by assignee (default: me)
- `--type`: Filter by issue type
- `--count`: Number of recommendations (default: 3)

**Priority Algorithm**:

```
score = priority_weight × 10 +
        due_date_urgency × 5 +
        blocked_dependencies × 3 -
        estimated_hours × 0.1 +
        age_in_days × 0.5
```

Weights are configurable in `.claude/context/workflow-config.json`

**Behavior**:

1. Fetch open issues for assignee via BacklogMCP `get_issues`
2. Calculate priority score for each issue
3. Sort by score descending
4. Return top N recommendations

**Output Example**:

```
🎯 Recommended next tasks (by priority):

1. 🔴 MYPRJ-125 - Fix critical API bug
   Type: Bug | Priority: High | Due: Tomorrow
   Score: 95/100
   💡 Blocking 3 other issues

2. 🟡 MYPRJ-123 - Implement user authentication
   Type: Feature | Priority: High | Due: This week
   Score: 85/100
   💡 Milestone: v1.0

3. 🟢 MYPRJ-130 - Update API documentation
   Type: Task | Priority: Normal | Due: Next week
   Score: 70/100

Use /bl:issue-start <key> to begin work
```

---

#### 3.4.2 `/bl:status`

**Purpose**: Display project status dashboard

**Syntax**:

```bash
/bl:status [--milestone <version>] [--format dashboard|detailed]
```

**Behavior**:

1. Fetch all issues via BacklogMCP `get_issues`
2. Aggregate by status, type, priority
3. Calculate completion percentage
4. Display dashboard

**Output Example**:

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

⚠️ Blockers: 3 issues
📅 Overdue: 5 issues
```

---

#### 3.4.3 `/bl:standup`

**Purpose**: Generate daily standup report

**Syntax**:

```bash
/bl:standup [--assignee me|<user>] [--days <n>]
```

**Arguments**:

- `--assignee`: User to report on (default: me)
- `--days`: Days to look back (default: 1)

**Behavior**:

1. Fetch issues updated in time period
2. Group by status (completed, in progress, blocked)
3. Format as standup report

**Output Example**:

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

---

#### 3.4.4 `/bl:blocked`

**Purpose**: Show blocked issues

**Syntax**:

```bash
/bl:blocked [--assignee <user>]
```

**Behavior**:

1. Fetch issues with "Blocked" status or custom blocker field
2. Display with blocker reasons and duration

**Output Example**:

```
⚠️ Blocked Issues (3 found):

1. MYPRJ-130 - Database migration script
   👤 Assignee: johndoe
   🚫 Reason: Waiting for DB access approval
   🔗 Blocked by: MYPRJ-128 (IT ticket pending)
   ⏰ Blocked for: 3 days

2. MYPRJ-131 - Deploy to staging
   👤 Assignee: janedoe
   🚫 Reason: Build pipeline failure
   🔗 Blocked by: MYPRJ-125 (Critical bug fix needed)
   ⏰ Blocked for: 1 day
```

---

#### 3.4.5 `/bl:in-progress`

**Purpose**: Show in-progress issues

**Syntax**:

```bash
/bl:in-progress [--assignee <user>]
```

**Behavior**:

1. Fetch issues with "In Progress" status
2. Display with assignee and last update time

---

### 3.6 Milestone Commands

#### 3.6.1 `/bl:milestone-create`

**Purpose**: Create new milestone/version

**Syntax**:

```bash
/bl:milestone-create <name> [--description <desc>]
                     [--start-date <date>] [--due-date <date>]
```

**Behavior**:

1. Call BacklogMCP `add_version`
2. Display created milestone details

---

#### 3.6.2 `/bl:milestone-list`

**Purpose**: List project milestones

**Syntax**:

```bash
/bl:milestone-list [--status active|archived|all]
```

**Behavior**:

1. Call BacklogMCP `get_versions`
2. Filter and display

---

#### 3.6.3 `/bl:milestone-assign`

**Purpose**: Assign milestone to issues

**Syntax**:

```bash
/bl:milestone-assign <milestone_name> <issue_keys...>
```

**Behavior**:

1. Resolve milestone ID
2. Update each issue via BacklogMCP `update_issue`

---

### 3.7 Sync Commands

#### 3.7.1 `/bl:sync`

**Purpose**: Synchronize local context with Backlog

**Syntax**:

```bash
/bl:sync [--full] [--cache-only]
```

**Arguments**:

- `--full`: Full sync (all issues, projects, metadata)
- `--cache-only`: Only update cache, don't fetch fresh data

**Behavior**:

1. Fetch project metadata
2. Update issue cache
3. Update `.claude/context/backlog-project.json`

---

#### 3.7.2 `/bl:export`

**Purpose**: Export project data

**Syntax**:

```bash
/bl:export [--format csv|json|markdown] [--output <file>]
```

**Behavior**:

1. Fetch all issues via BacklogMCP
2. Format as specified
3. Write to file or stdout

---

## 4. Data Structures

### 4.1 Context Files

All context files are stored in `.claude/context/` directory and use JSON format with JSON Schema validation.

#### 4.1.1 backlog-project.json

**Purpose**: Current working project context

**Schema**:

```json
{
  "projectId": 12345,
  "projectKey": "MYPRJ",
  "projectName": "My Project",
  "spaceKey": "my-space",
  "spaceUrl": "https://my-space.backlog.com",
  "setAt": "2025-01-10T12:00:00Z",
  "metadata": {
    "issueCount": {
      "open": 45,
      "inProgress": 35,
      "closed": 120
    },
    "memberCount": 8,
    "categories": [
      { "id": 1, "name": "Backend" },
      { "id": 2, "name": "Frontend" }
    ],
    "versions": [{ "id": 10, "name": "v1.0", "releaseDate": "2025-02-01" }],
    "issueTypes": [{ "id": 1, "name": "Task", "color": "#7ea800" }],
    "statuses": [
      { "id": 1, "name": "Open" },
      { "id": 2, "name": "In Progress" }
    ],
    "priorities": [{ "id": 2, "name": "High" }]
  },
  "lastSync": "2025-01-10T14:30:00Z"
}
```

**Update Triggers**:

- `/bl:project-set`
- `/bl:sync`
- Automatic refresh on commands requiring fresh data

---

#### 4.1.2 backlog-config.json

**Purpose**: Backlog connection settings and preferences

**Schema**:

```json
{
  "spaceKey": "my-space",
  "apiEndpoint": "https://my-space.backlog.com/api/v2",
  "apiKeyEnvVar": "BACKLOG_API_KEY",
  "defaultProject": "MYPRJ",
  "preferences": {
    "defaultIssueType": "Task",
    "defaultPriority": "Normal",
    "autoAssignSelf": true,
    "notifyOnCreate": true,
    "cacheTimeout": 300,
    "batchSize": 10
  },
  "mcpServer": {
    "enabled": true,
    "toolPrefix": "",
    "maxTokens": 50000
  }
}
```

**Initial Setup**: Created during first run or via setup command

---

#### 4.1.3 current-issue.json

**Purpose**: Track currently active issue

**Schema**:

```json
{
  "issueKey": "MYPRJ-123",
  "issueId": 98765,
  "title": "Implement user authentication",
  "issueType": "Feature",
  "status": "In Progress",
  "priority": "High",
  "assignee": {
    "id": 456,
    "userId": "johndoe",
    "name": "John Doe"
  },
  "startedAt": "2025-01-10T14:30:00Z",
  "milestone": { "id": 10, "name": "v1.0" },
  "category": { "id": 1, "name": "Backend" },
  "url": "https://my-space.backlog.com/view/MYPRJ-123",
  "estimatedHours": 8,
  "actualHours": 4.5,
  "notes": "Implemented JWT middleware, need refresh token logic"
}
```

**Lifecycle**:

- Created by `/bl:issue-start`
- Updated by work-in-progress commands
- Removed by `/bl:issue-close`

---

#### 4.1.4 issue-cache.json

**Purpose**: Cache frequently accessed issue data

**Schema**:

```json
{
  "cacheVersion": "1.0.0",
  "projectKey": "MYPRJ",
  "lastUpdated": "2025-01-10T15:00:00Z",
  "ttl": 300,
  "issues": {
    "MYPRJ-123": {
      "issueKey": "MYPRJ-123",
      "issueId": 98765,
      "title": "Implement user authentication",
      "issueType": { "id": 3, "name": "Feature" },
      "status": { "id": 2, "name": "In Progress" },
      "priority": { "id": 2, "name": "High" },
      "assignee": { "id": 456, "userId": "johndoe", "name": "John Doe" },
      "created": "2025-01-08T10:00:00Z",
      "updated": "2025-01-10T14:30:00Z",
      "dueDate": "2025-01-15",
      "cachedAt": "2025-01-10T15:00:00Z"
    }
  },
  "statistics": {
    "totalIssues": 200,
    "byStatus": { "Open": 45, "In Progress": 35, "Closed": 120 },
    "byType": { "Task": 80, "Bug": 60, "Feature": 60 },
    "byPriority": { "High": 25, "Normal": 150, "Low": 25 }
  }
}
```

**Cache Strategy**:

- TTL-based expiration (default: 5 minutes)
- Invalidated on issue updates
- Partial updates supported

---

#### 4.1.5 workflow-config.json

**Purpose**: Workflow automation and priority algorithm configuration

**Schema**:

```json
{
  "priorityAlgorithm": {
    "weights": {
      "priority": 10,
      "dueDate": 5,
      "blockedDependencies": 3,
      "estimatedHours": -0.1,
      "ageInDays": 0.5
    },
    "customRules": [
      {
        "name": "Critical bugs first",
        "condition": "issueType == 'Bug' && priority == 'High'",
        "scoreModifier": 50
      }
    ]
  },
  "statusTransitions": {
    "Open": ["In Progress", "Closed"],
    "In Progress": ["Resolved", "Open", "Closed"],
    "Resolved": ["Closed", "In Progress"],
    "Closed": ["Open"]
  },
  "automation": {
    "autoCommentOnStart": true,
    "autoCommentOnClose": true,
    "autoAssignOnStart": true,
    "notifyAssigneeOnUpdate": true
  }
}
```

---

#### 4.1.6 session-history.json

**Purpose**: Track command execution history

**Schema**:

```json
{
  "sessions": [
    {
      "sessionId": "uuid-here",
      "startedAt": "2025-01-10T09:00:00Z",
      "endedAt": "2025-01-10T17:00:00Z",
      "projectKey": "MYPRJ",
      "commands": [
        {
          "command": "/bl:issue-start",
          "args": ["MYPRJ-123"],
          "timestamp": "2025-01-10T09:15:00Z",
          "success": true
        }
      ],
      "issuesWorked": ["MYPRJ-123", "MYPRJ-124"],
      "statistics": {
        "commandsExecuted": 25,
        "issuesCreated": 3,
        "issuesUpdated": 5,
        "issuesClosed": 2,
        "commentsAdded": 8
      }
    }
  ]
}
```

---

### 4.3 Template Format

**File Location**: `.claude/templates/issue-<type>.md`

**Structure**:

```markdown
---
template: "feature"
issueType: "Feature"
priority: "Normal"
category: ""
milestone: ""
---

## Feature Description

{description}

## User Story

As a {user_type}, I want to {goal} so that {benefit}.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes

{technical_notes}

## Dependencies

{dependencies}

## Estimated Effort

{estimated_hours} hours
```

Variables in `{curly_braces}` are replaced during issue creation.

---

## 5. BacklogMCP Integration

### 5.1 MCP Server Setup

**Installation**:

```bash
# Via Docker
docker run -d \
  -e BACKLOG_DOMAIN=my-space.backlog.com \
  -e BACKLOG_API_KEY=your_api_key \
  nulab/backlog-mcp-server

# Via npx
npx @nulab/backlog-mcp-server

# Manual
git clone https://github.com/nulab/backlog-mcp-server
cd backlog-mcp-server
npm install
npm start
```

**Configuration**:
Set environment variables or add to `.claude/context/backlog-config.json`:

```json
{
  "mcpServer": {
    "enabled": true,
    "endpoint": "http://localhost:3000",
    "toolPrefix": "backlog_"
  }
}
```

---

### 5.2 Tool Mapping

Commands map to BacklogMCP tools as follows:

| Command Category | BacklogMCP Tools Used                                    |
| ---------------- | -------------------------------------------------------- |
| Project Context  | `get_project_list`, `get_project`                        |
| Issue Management | `get_issues`, `add_issue`, `update_issue`, `add_comment` |
| Milestones       | `get_versions`, `add_version`                            |
| Users            | `get_users`, `get_myself`                                |

---

### 5.3 Error Handling

**API Error Codes**:

- `401`: Authentication failed → Check API key
- `403`: Permission denied → Check project permissions
- `404`: Resource not found → Verify project/issue key
- `429`: Rate limit exceeded → Retry with backoff

**Retry Strategy**:

- Exponential backoff for rate limits
- Max 3 retries per request
- Circuit breaker for persistent failures

---

### 5.4 Performance Optimization

**Caching**:

- Project metadata: 5 minutes TTL
- Issue data: 5 minutes TTL
- User list: 1 hour TTL

**Batch Operations**:

- Issue creation: Batch of 10
- Issue updates: Batch of 5
- Parallel API calls where possible

---

## 6. Workflow Examples

### 6.1 Feature Development Workflow

```bash
# 1. Set project context
/bl:project-set MYPRJ



# 4. Get next task
/bl:next

# 5. Start work on recommended task
/bl:issue-start MYPRJ-123 --assignee-me

# 6. Add progress comment
/bl:issue-comment MYPRJ-123 "Implemented JWT middleware"

# 7. Close issue when done
/bl:issue-close MYPRJ-123 --resolution Fixed --comment "Tested and deployed"

# 8. Check status
/bl:status
```

---

### 6.2 Bug Triage Workflow

```bash
# 1. Import bugs from CSV
/bl:issue-bulk-create bugs.csv --type Bug

# 2. Get high priority bug
/bl:next --type Bug --count 1

# 3. Start work
/bl:issue-start MYPRJ-456 --assignee-me

# 4. Update if blocked
/bl:issue-update MYPRJ-456 --status Blocked --comment "Needs API access"

# 5. Check all blockers
/bl:blocked
```

---

### 6.3 Sprint Planning Workflow

```bash
# 1. Create sprint milestone
/bl:milestone-create "Sprint 2025-Q1" --due-date 2025-03-31

# 2. Create sprint backlog
/bl:issue-bulk-create sprint-backlog.csv --milestone "Sprint 2025-Q1"

# 3. Review sprint status
/bl:status --milestone "Sprint 2025-Q1"

# 4. Daily standup
/bl:standup --days 1

# 5. Track progress
/bl:status --format detailed
```

---

### 6.4 Daily Workflow

```bash
# Morning: Check what to work on
/bl:next --count 5

# Start first task
/bl:issue-start MYPRJ-123 --assignee-me

# Work and update
/bl:issue-comment MYPRJ-123 "Progress update: 50% complete"

# Finish task
/bl:issue-close MYPRJ-123 --resolution Fixed

# End of day: Standup report
/bl:standup --days 1

# Check overall status
/bl:status
```

---

## 7. Implementation Roadmap

### 7.1 Phase 1: Core Infrastructure (MVP)

**Goal**: Basic project management functionality

**Deliverables**:

- Project context management
  - `/bl:project-set`
  - `/bl:project-list`
  - `/bl:project-info`
- Basic issue operations
  - `/bl:issue-create`
  - `/bl:issue-start`
  - `/bl:issue-update`
  - `/bl:issue-close`
  - `/bl:issue-list`
- Essential workflow
  - `/bl:next`
  - `/bl:status`

**Data Structures**:

- `backlog-project.json`
- `backlog-config.json`
- `current-issue.json`
- `issue-cache.json`

**Timeline**: 1-2 weeks

---

### 7.2 Phase 2: Advanced Features

**Deliverables**:

- Bulk operations
  - `/bl:issue-bulk-create`
- Workflow enhancements
  - `/bl:standup`
  - `/bl:blocked`
  - `/bl:in-progress`

**Data Structures**:

- `workflow-config.json`

**Timeline**: 1-2 weeks

---

### 7.3 Phase 3: Milestones & Reporting

**Goal**: Sprint planning and advanced reporting

**Deliverables**:

- Milestone management
  - `/bl:milestone-create`
  - `/bl:milestone-list`
  - `/bl:milestone-assign`
- Enhanced reporting
  - `/bl:status --milestone`
  - `/bl:export`
- Template system
  - Issue templates

**Data Structures**:

- `session-history.json`
- Template registry

**Timeline**: 1 week

---

### 7.4 Phase 4: Optimization & Polish

**Goal**: Performance, UX, documentation

**Deliverables**:

- Performance optimization
  - Caching improvements
  - Batch operation optimization
- Documentation
  - Setup guide
  - Command reference
  - Workflow examples
- Testing
  - Unit tests
  - Integration tests
  - Example scenarios

**Timeline**: 1 week

---

### 7.5 Total Timeline

**Estimated**: 4-6 weeks for complete implementation

---

## 8. Design Decisions

### 8.1 Why Issue-Only (No Git Worktrees)?

**Decision**: Use Backlog issues for state management, no Git worktrees

**Rationale**:

- Simpler mental model for non-Git users
- Backlog is the single source of truth
- Easier cross-platform support
- Reduces Git complexity
- Works with any VCS (not just Git)

**Trade-off**: Parallelization is managed through Backlog issue status rather than filesystem isolation

---

### 8.2 Why Dual Storage (Local + Backlog)?

**Rationale**:

- Local: Fast access, version control, offline work
- Backlog: Team visibility, web access, centralized truth
- Sync: Best of both worlds

**Alternative Considered**: Backlog-only storage rejected due to offline work requirements

---

### 8.3 Why JSON for Context?

**Decision**: Use JSON files in `.claude/context/`

**Rationale**:

- Human-readable for debugging
- Easy to parse and update
- Schema validation support
- Compatible with Claude Code's file operations
- No database dependency

**Alternative Considered**: SQLite rejected for simplicity

---

### 8.4 Priority Algorithm Design

**Decision**: Weighted scoring algorithm with custom rules

**Formula**:

```
score = priority × 10 +
        due_date_urgency × 5 +
        blocked_dependencies × 3 -
        estimated_hours × 0.1 +
        age_in_days × 0.5
```

**Rationale**:

- Balances urgency, importance, and effort
- Prevents task starvation (age factor)
- Extensible via custom rules
- Transparent and debuggable

**Alternative Considered**: AI-based prediction rejected for transparency

---

### 8.5 Cache Strategy

**Decision**: TTL-based cache with selective invalidation

**Rationale**:

- Reduces API calls (cost and latency)
- Fresh data when needed
- Configurable TTL per data type
- Simple to implement and understand

**Alternative Considered**: Event-based invalidation rejected for complexity

---

### 8.6 Template System

**Decision**: Markdown templates with variable substitution

**Rationale**:

- Familiar format for developers
- Easy to create and customize
- Supports rich formatting
- Works with Backlog's Markdown support

**Alternative Considered**: YAML-based templates rejected for readability

---

### 8.7 Error Handling Philosophy

**Decision**: Fail fast with helpful error messages

**Rationale**:

- User can quickly identify and fix issues
- Prevents cascading failures
- Clear guidance for resolution
- Logs for debugging

**Error Message Format**:

```
❌ Error: <what went wrong>
💡 Suggestion: <how to fix>
📚 Documentation: <link to help>
```

---

### 8.8 Extensibility Points

**Designed for Extension**:

- Custom priority rules in `workflow-config.json`
- Custom templates in `.claude/templates/`
- Custom issue types/statuses (Backlog config)
- Hook points for automation

**Future Extensions**:

- Plugin system for custom commands
- Webhook integration for real-time sync
- AI-powered task recommendations
- Multi-project orchestration

---

## Appendix A: Command Quick Reference

| Command            | Purpose                | Example                                        |
| ------------------ | ---------------------- | ---------------------------------------------- |
| `/bl:project-set`  | Set working project    | `/bl:project-set MYPRJ`                        |
| `/bl:issue-create` | Create single issue    | `/bl:issue-create --title "Fix bug"`           |
| `/bl:issue-start`  | Start working on issue | `/bl:issue-start MYPRJ-123`                    |
| `/bl:issue-close`  | Close issue            | `/bl:issue-close MYPRJ-123 --resolution Fixed` |
| `/bl:next`         | Get recommended task   | `/bl:next --count 3`                           |
| `/bl:status`       | View project status    | `/bl:status`                                   |
| `/bl:standup`      | Daily standup report   | `/bl:standup`                                  |

---

## Appendix B: JSON Schema Definitions

See section 4 for complete JSON schemas for all data structures.

---

## Appendix C: BacklogMCP Tool Reference

See section 5.2 for BacklogMCP tool mapping.

---

## Appendix D: FAQ

**Q: Can I use cc-backlog without BacklogMCP?**
A: No, BacklogMCP is a required dependency for Backlog API integration.

**Q: Does this work with Backlog Cloud and Backlog Enterprise?**
A: Yes, both are supported via the Backlog API.

**Q: Can I customize the priority algorithm?**
A: Yes, edit `.claude/context/workflow-config.json` to adjust weights and add custom rules.

**Q: How do I handle multiple projects?**
A: Use `/bl:project-set` to switch between projects. Each project maintains separate context.

**Q: Is offline work supported?**

---

**End of Specification**
