# /bl:project-set - Set Working Project Context

Set the current working Backlog project for all subsequent commands.

## Usage

```bash
/bl:project-set <project_key_or_name> [--space <space_key>]
```

## Arguments

- `<project_key_or_name>` (required): Project key (e.g., MYPRJ) or project name to search
- `--space <space_key>` (optional): Backlog space key for multi-space environments

## Behavior

1. **Fetch Projects**: Call Backlog API `/api/v2/projects` to retrieve all accessible projects
2. **Match Project**:
   - Exact match on project key (case-insensitive)
   - If no exact match, fuzzy match on project name
   - If multiple matches, present interactive selection
3. **Fetch Metadata**: Call Backlog API `/api/v2/projects/:projectIdOrKey` to get detailed project information
4. **Save Context**: Write to `.claude/context/backlog-project.json`:
   ```json
   {
     "projectId": 12345,
     "projectKey": "MYPRJ",
     "projectName": "My Project",
     "spaceKey": "my-space",
     "spaceUrl": "https://my-space.backlog.com",
     "setAt": "2025-01-10T12:00:00Z",
     "metadata": {
       "issueCount": { "open": 45, "inProgress": 35, "closed": 120 },
       "memberCount": 8,
       "categories": [...],
       "versions": [...],
       "issueTypes": [...],
       "statuses": [...],
       "priorities": [...]
     },
     "lastSync": "2025-01-10T12:00:00Z"
   }
   ```
5. **Display Summary**: Show project details and confirmation

## Implementation

### Step 1: Initialize Backlog API client
```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv } = require('../../../lib/utils');

// Load environment variables from .env
const config = loadEnv();

// Initialize API client
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});
```

### Step 2: Fetch project list
```javascript
// Call Backlog API to get all projects
const projects = await backlog.getProjects();

// Parse arguments
const projectInput = args[0] || prompt("Enter project key or name: ");
const spaceKey = getArg('--space', { optional: true });
```

### Step 3: Match project
```javascript
// Try exact key match first
let matched = projects.filter(p =>
  p.projectKey.toUpperCase() === projectInput.toUpperCase()
);

if (matched.length === 0) {
  // Try fuzzy name match
  matched = projects.filter(p =>
    p.name.toLowerCase().includes(projectInput.toLowerCase())
  );
}

if (matched.length === 0) {
  console.error(`❌ No project found matching '${projectInput}'`);
  displayProjects(projects);
  return;
} else if (matched.length > 1) {
  // Interactive selection
  const selected = await promptSelection("Multiple projects found:", matched);
  matched = [selected];
}

const project = matched[0];
```

### Step 4: Fetch detailed metadata
```javascript
// Get full project details
const projectDetail = await backlog.getProject(project.projectKey);

// Fetch additional metadata
const [issueTypes, statuses, priorities, categories, versions] = await Promise.all([
  backlog.getIssueTypes(project.id),
  backlog.getStatuses(project.id),
  backlog.getPriorities(),
  backlog.getCategories(project.id),
  backlog.getVersions(project.id)
]);

// Count issues by status
const issueCount = await backlog.getIssueCount(project.id);

// Enrich with metadata
const metadata = {
  issueCount: issueCount,
  memberCount: projectDetail.users?.length || 0,
  categories: categories,
  versions: versions,
  issueTypes: issueTypes,
  statuses: statuses,
  priorities: priorities
};
```

### Step 5: Save context
```javascript
// Prepare context object
const context = {
  projectId: projectDetail.id,
  projectKey: projectDetail.projectKey,
  projectName: projectDetail.name,
  spaceKey: spaceKey || config.BACKLOG_SPACE_KEY,
  spaceUrl: `https://${spaceKey || config.BACKLOG_SPACE_KEY}.backlog.com`,
  setAt: new Date().toISOString(),
  metadata: metadata,
  lastSync: new Date().toISOString()
};

// Write to file
const fs = require('fs').promises;
await fs.writeFile(
  '.claude/context/backlog-project.json',
  JSON.stringify(context, null, 2)
);
```

### Step 6: Display output
```javascript
console.log(`
✅ Project set: ${context.projectKey} - ${context.projectName}
📊 Issues: ${metadata.issueCount.open} open, ${metadata.issueCount.closed} closed
👥 Members: ${metadata.memberCount}
📍 Context saved to .claude/context/backlog-project.json
`);
```

## Error Handling

**No projects accessible**:
```
❌ Error: No Backlog projects found
💡 Suggestion: Check your API key permissions and BACKLOG_API_KEY in .env
📚 Documentation: See docs/setup.md for configuration
```

**Project not found**:
```
❌ Error: Project 'INVALID' not found
💡 Available projects:
  - MYPRJ: My Project
  - DEMO: Demo Project
Use /bl:project-list to see all projects
```

**API error**:
```
❌ Error: Failed to fetch project details
💡 Suggestion: Verify BACKLOG_SPACE_KEY and BACKLOG_API_KEY in .env
🔗 API endpoint: https://<your-space>.backlog.com/api/v2
```

## Example Usage

**Basic usage**:
```bash
/bl:project-set MYPRJ
```

**With space specification**:
```bash
/bl:project-set MYPRJ --space my-space
```

**Fuzzy name search**:
```bash
/bl:project-set "My Project"
```

## Output Example

```
✅ Project set: MYPRJ - My Project
📊 Issues: 45 open, 120 closed
👥 Members: 8
🏷️ Categories: Feature, Bug, Task
📅 Versions: v1.0, v1.1, v2.0-beta
📍 Context saved to .claude/context/backlog-project.json
```

## Related Commands

- `/bl:project-list` - List all available projects
- `/bl:project-info` - Show detailed current project information
- `/bl:sync` - Sync project metadata with Backlog

## Notes

- Context is persistent across Claude Code sessions
- Changing projects will not affect currently open issues
- Use `/bl:project-info` to verify current project at any time
