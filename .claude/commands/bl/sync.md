# /bl:sync - Synchronize with Backlog

Synchronize local context and cache with current Backlog project state.

## Syntax

```bash
/bl:sync [--full] [--cache-only] [--force]
```

## Arguments

- `--full`: Perform full synchronization (all issues, projects, metadata)
- `--cache-only`: Update local cache without fetching fresh data from Backlog
- `--force`: Force sync even if cache is recent

## Behavior

1. **Check Cache Age**: Determine if sync is needed based on last update time
2. **Fetch Project Data**: Get current project metadata via GET `/api/v2/projects/:projectIdOrKey`
3. **Update Issue Cache**: Refresh issue data via GET `/api/v2/issues`
4. **Update Context Files**: Write updated data to `.claude/context/` files
5. **Report Changes**: Display sync summary with change counts

## Examples

### Basic Sync (Smart Update)
```bash
/bl:sync
```

**Output:**
```
🔄 Syncing with Backlog...
📊 Project: MYPRJ - My Project

Fetching updates...
✅ Project metadata: up to date
✅ Issues: 3 new, 5 updated, 2 closed
✅ Milestones: 1 new
✅ Members: no changes

💾 Saved to:
  - .claude/context/backlog-project.json
  - .claude/context/issue-cache.json

⏰ Last sync: 2025-01-10 14:30:00
💡 Cache valid for: 5 minutes
```

### Full Sync
```bash
/bl:sync --full
```

**Output:**
```
🔄 Full sync in progress...
📊 Project: MYPRJ - My Project

Fetching all data...
[████████████████████] 100%

✅ Projects: 3 total (1 active project set)
✅ Issues: 165 total
   - Open: 45
   - In Progress: 12
   - Resolved: 23
   - Closed: 85
✅ Milestones: 8 (5 active, 3 archived)
✅ Categories: 6
✅ Issue Types: 4
✅ Members: 8

💾 Saved to:
  - .claude/context/backlog-config.json
  - .claude/context/backlog-project.json
  - .claude/context/issue-cache.json
  - .claude/context/workflow-config.json (preserved)

⏰ Sync completed: 2025-01-10 14:35:22
📊 Data size: 2.3 MB
💡 Next sync recommended: after 5 minutes
```

### Cache-Only Update
```bash
/bl:sync --cache-only
```

**Output:**
```
💾 Updating local cache only (no API calls)...

✅ Issue cache rebuilt from local data
✅ Priority scores recalculated
✅ Status transitions validated

⏰ Cache updated: 2025-01-10 14:40:00
💡 Run /bl:sync without --cache-only to fetch fresh data
```

### Force Sync
```bash
/bl:sync --force
```

**Output:**
```
⚠️ Force sync requested (overriding cache timer)

🔄 Syncing with Backlog...
📊 Project: MYPRJ - My Project

Fetching updates...
✅ All data refreshed

💾 Cache updated: 2025-01-10 14:45:00
💡 Previous cache was only 2 minutes old
```

## Use Cases

### Start of Day Sync
```bash
# Sync before starting work
/bl:sync

# Check today's tasks
/bl:next --count 5
/bl:standup
```

### Before Important Operations
```bash
# Sync before sprint planning
/bl:sync --full

# Review project state
/bl:status
/bl:milestone-list
```

### After External Changes
```bash
# Sync after team members made updates via web UI
/bl:sync

# Check for new blockers
/bl:blocked
```

### Offline Work Preparation
```bash
# Full sync before going offline
/bl:sync --full

# Work offline using cached data
# Commands will use cached data until next sync
```

### Cache Maintenance
```bash
# Rebuild cache without API calls
/bl:sync --cache-only

# Verify cache integrity
/bl:sync --force
```

## Sync Details

**Smart Sync (Default):**
- Checks cache age (default: 5 minutes)
- Only syncs if cache is stale
- Incremental updates for efficiency
- Quick operation (<5 seconds)

**Full Sync (`--full`):**
- Fetches all project data
- Rebuilds complete cache
- Updates all context files
- Slower operation (10-30 seconds depending on project size)

**Cache-Only (`--cache-only`):**
- No API calls to Backlog
- Rebuilds cache from existing data
- Recalculates derived values (priority scores, etc.)
- Instant operation (<1 second)

## Cached Data

**Project Metadata:**
- Project key, name, ID
- Member list
- Categories
- Issue types
- Custom fields

**Issue Data:**
- Issue keys and IDs
- Titles and descriptions
- Status, priority, assignee
- Milestones
- Comments (summary)
- Last update timestamps

**Milestones:**
- Milestone names and IDs
- Due dates
- Issue counts
- Progress percentages

**Calculated Data:**
- Priority scores for `/bl:next`
- Status transition history
- Progress indicators
- Activity metrics

## Cache Expiration

**Default Cache TTL:** 5 minutes

**Cache Invalidation Triggers:**
- Manual sync request
- Issue creation/update/close
- Milestone assignment
- Project context change
- Cache age exceeds TTL

**Configuration:**
Edit `.claude/context/backlog-config.json`:
```json
{
  "preferences": {
    "cacheTimeout": 300  // seconds (5 minutes)
  }
}
```

## Error Handling

**No Project Set:**
```
❌ Error: No project context set
💡 Run /bl:project-set <project_key> first
```

**API Connection Error:**
```
❌ Error: Unable to connect to Backlog
   Reason: Connection timeout

⚠️ Using stale cache (last sync: 2 hours ago)
💡 Check Backlog API credentials and network connection
```

**Partial Sync Failure:**
```
⚠️ Partial sync completed

✅ Project metadata: updated
❌ Issues: API rate limit exceeded
✅ Milestones: updated

💾 Saved partial data
⏰ Retry in: 60 seconds
```

**Cache Corruption:**
```
⚠️ Warning: Cache file corrupted
   File: .claude/context/issue-cache.json

🔄 Rebuilding cache from Backlog...
✅ Cache rebuilt successfully
```

## Implementation Notes

**Backlog API Integration:**
- Uses GET `/api/v2/projects/:projectIdOrKey` for project metadata
- Uses GET `/api/v2/issues` for issue data
- Uses GET `/api/v2/projects/:projectIdOrKey/versions` for milestone data
- Batch API calls for efficiency

**Performance Optimization:**
- Incremental sync: Only fetch changes since last sync
- Parallel API calls where possible
- Compressed cache storage
- Lazy loading for large datasets

**Conflict Resolution:**
- Local changes take precedence during sync
- Current issue tracking preserved
- User preferences never overwritten
- Merge strategy for conflicting updates

**File Operations:**
- Atomic writes to prevent corruption
- Backup before overwrite
- Validation after write
- Automatic recovery from backup on failure

## Related Commands

- `/bl:project-set` - Set project context (triggers sync)
- `/bl:export` - Export project data to file
- `/bl:status` - View project status (uses cached data)
- `/bl:issue-list` - List issues (uses cached data)
- `/bl:next` - Get recommendations (uses cached priority scores)
