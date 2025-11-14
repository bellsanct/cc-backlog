# Migration Guide: MCP → Direct API

This guide helps existing cc-backlog users migrate from BacklogMCP-based implementation to direct API calls.

## What Changed?

### Before (MCP-based)
- Required BacklogMCP server installation and configuration
- Commands used MCP tool calls via Claude Code
- Complex setup with environment-dependent MCP server

### After (Direct API)
- No MCP server required
- Commands directly call Backlog API via Node.js
- Simple setup with just environment variables

## Benefits

✅ **Simpler Setup**: No MCP server installation required
✅ **Better Reliability**: Direct API calls without MCP layer
✅ **Faster Performance**: No MCP server overhead
✅ **Easier Debugging**: Direct error messages from Backlog API
✅ **Lower Barrier**: Just API keys, no server configuration

## Migration Steps

### 1. Create .env File

Create `.env` in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
BACKLOG_SPACE_KEY=your-space-key
BACKLOG_API_KEY=your-api-key-here
```

**How to get these values:**
- **BACKLOG_SPACE_KEY**: Your space name (from `https://YOUR-SPACE.backlog.com`)
- **BACKLOG_API_KEY**: Generate from Backlog → Personal Settings → API → Register New API Key

### 2. Remove BacklogMCP Configuration

**Remove from Claude Code config** (`.claude.json` or similar):

```diff
- "mcpServers": {
-   "backlog": {
-     "command": "npx",
-     "args": ["-y", "backlog-mcp-server"],
-     "env": {
-       "BACKLOG_SPACE_KEY": "your-space",
-       "BACKLOG_API_KEY": "your-key"
-     }
-   }
- }
```

### 3. Update Command Execution (if customized)

Commands now execute via Node.js CLI runner instead of MCP tools.

**Old behavior** (automatic MCP calls):
- Commands internally called MCP tools
- Handled by Claude Code's MCP integration

**New behavior** (direct API):
- Commands execute Node.js script: `node lib/cli-runner.js <command> [args]`
- All commands work the same from user perspective

### 4. Verify Installation

Test that everything works:

```bash
# List projects
/bl:project-list

# Should display your Backlog projects without MCP
```

## Command Changes

### No Changes to Command Syntax!

All commands work exactly the same:

```bash
# These still work identically
/bl:project-list
/bl:project-set MYPRJ
/bl:issue-create --title "Fix bug" --type Bug
/bl:next
/bl:status
```

### Internal Changes Only

Commands now use:
- `lib/backlog-api.js`: Direct Backlog API client
- `lib/utils.js`: Utility functions
- `lib/cli-runner.js`: Command execution engine

## Troubleshooting

### Error: "BACKLOG_SPACE_KEY environment variable is required"

**Solution**: Create `.env` file with your credentials (see Step 1 above)

### Error: "Authentication failed - check your API key"

**Solution**: Verify your `BACKLOG_API_KEY` in `.env` is correct

### Commands not found

**Solution**: Ensure `.claude/commands/bl/` directory exists with command files

### Permission errors

**Solution**: Make CLI runner executable:
```bash
chmod +x lib/cli-runner.js
```

## Rollback (if needed)

If you need to rollback to MCP-based implementation:

1. Reinstall BacklogMCP server
2. Restore BacklogMCP configuration in Claude Code config
3. Revert to previous cc-backlog version (pre-migration)

```bash
git checkout <previous-commit>
```

## Getting Help

- **Documentation**: See `docs/setup.md`
- **Issues**: https://github.com/bellsanct/cc-backlog/issues
- **API Reference**: `SPECIFICATION.md`

## New Features Enabled by Direct API

With direct API access, future features can include:

- Bulk operations without MCP token limits
- Custom webhooks and integrations
- Advanced filtering and search
- Real-time updates
- Export to various formats
- Custom reporting dashboards

## FAQ

**Q: Can I still use BacklogMCP for other purposes?**
A: Yes! This change only affects cc-backlog. Your BacklogMCP setup for other tools remains unchanged.

**Q: Will my existing project context be preserved?**
A: Yes! All context files (`.claude/context/*.json`) remain compatible.

**Q: Do I need Node.js installed?**
A: Yes, Node.js is required to run the CLI runner. Install from https://nodejs.org

**Q: Can I use this with Backlog Enterprise?**
A: Yes! Set `BACKLOG_API_ENDPOINT` in `.env` to your custom endpoint.

**Q: What about API rate limits?**
A: The client includes built-in rate limiting (100ms between requests by default).

---

🎉 **Migration complete!** You're now running cc-backlog with direct API access.
