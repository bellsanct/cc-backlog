# /bl:project-info - Show Current Project Information

Display detailed information about the currently set working project.

## Usage

```bash
/bl:project-info [--verbose] [--refresh]
```

## Arguments

- `--verbose` (optional): Show extended information (categories, versions, members)
- `--refresh` (optional): Fetch fresh data from Backlog API instead of using cache

## Behavior

1. **Load Context**: Read `.claude/context/backlog-project.json`
2. **Check Exists**: Verify project is set
3. **Refresh (optional)**: If `--refresh`, fetch latest data via Backlog API
4. **Display**: Show project information
5. **Verbose Details**: If `--verbose`, show extended metadata

## Implementation

```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv } = require('../../../lib/utils');
const fs = require('fs').promises;

// Load current project context
const contextPath = '.claude/context/backlog-project.json';
let context;
try {
  const data = await fs.readFile(contextPath, 'utf8');
  context = JSON.parse(data);
} catch (error) {
  console.error("❌ Error: No project set. Use /bl:project-set to set working project.");
  return;
}

// Refresh if requested
if (getFlag('--refresh')) {
  const config = loadEnv();
  const backlog = new BacklogAPIClient({
    spaceKey: config.BACKLOG_SPACE_KEY,
    apiKey: config.BACKLOG_API_KEY
  });

  const freshData = await backlog.getProject(context.projectKey);
  // Update context with fresh data
  context = updateContextWithFreshData(context, freshData);
  await fs.writeFile(contextPath, JSON.stringify(context, null, 2));
  console.log("🔄 Refreshed project data from Backlog");
}

// Display information
displayProjectInfo(context, { verbose: getFlag('--verbose') });
```

## Output Format

### Standard Output

```
📁 Current Project: MYPRJ - My Project
🔑 Project Key: MYPRJ
🆔 Project ID: 12345
📊 Issues: 45 open / 35 in progress / 120 closed
👥 Members: 8 active
⏰ Set at: 2025-01-10 12:00:00
🔄 Last synced: 2025-01-10 14:30:00

🔗 Project URL: https://my-space.backlog.com/projects/MYPRJ
```

### Verbose Output

```
📁 Current Project: MYPRJ - My Project
🔑 Project Key: MYPRJ
🆔 Project ID: 12345

📊 Issues:
  ├─ Open:        45
  ├─ In Progress: 35
  └─ Closed:      120
  Total:          200

🏷️ Categories (3):
  - Backend
  - Frontend
  - Infrastructure

📅 Versions/Milestones (2):
  - v1.0 (Due: 2025-02-01)
  - v1.1 (Due: 2025-03-15)

📋 Issue Types (3):
  - Task
  - Bug
  - Feature

📊 Statuses (4):
  - Open
  - In Progress
  - Resolved
  - Closed

⭐ Priorities (3):
  - High
  - Normal
  - Low

👥 Members: 8 active

⏰ Context:
  ├─ Set at:      2025-01-10 12:00:00
  └─ Last synced: 2025-01-10 14:30:00

🔗 Project URL: https://my-space.backlog.com/projects/MYPRJ

💡 Use /bl:sync to refresh project metadata
```

## Error Handling

**No project set**:
```
❌ Error: No project currently set
💡 Suggestion: Use /bl:project-set to set a working project
📋 Available projects: Use /bl:project-list to see options
```

**Context file corrupted**:
```
❌ Error: Project context file is corrupted
💡 Suggestion: Reset project context with /bl:project-set
🗑️ Backup: Context backed up to backlog-project.json.bak
```

## Example Usage

**Basic info**:
```bash
/bl:project-info
```

**Verbose details**:
```bash
/bl:project-info --verbose
```

**Refresh from Backlog**:
```bash
/bl:project-info --refresh
```

**Verbose with refresh**:
```bash
/bl:project-info --verbose --refresh
```

## Related Commands

- `/bl:project-set` - Change working project
- `/bl:project-list` - List all projects
- `/bl:sync` - Full sync with Backlog
