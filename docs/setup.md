# cc-backlog Setup Guide

English | [日本語](./setup.ja.md)

Complete setup guide for installing and configuring cc-backlog.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Verification](#verification)

---

## Prerequisites

### Required

1. **Backlog Account**
   - Active Backlog Cloud or Enterprise account
   - API access enabled
   - At least one accessible project

2. **Backlog API Key**
   - Generate from Backlog: Personal Settings → API → Generate
   - Keep this secure and never commit to version control

3. **Claude Code CLI**
   - Anthropic's Claude Code installed
   - Version: Latest recommended
   - Documentation: https://docs.claude.com/en/docs/claude-code

4. **BacklogMCP Server**
   - [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server)
   - Docker or Node.js runtime

---

## Installation

### Step 1: Clone Repository

```bash
# Navigate to your project
cd /path/to/your/project

# Clone cc-backlog
git clone https://github.com/bellsanct/cc-backlog.git .cc-backlog

# Copy .claude directory to your project
cp -r .cc-backlog/.claude .
```

Alternatively, for a new project:

```bash
# Create new project directory
mkdir my-backlog-project
cd my-backlog-project

# Clone directly
git clone https://github.com/bellsanct/cc-backlog.git .
```

### Step 2: Directory Structure

After installation, your project should have:

```
your-project/
├── .claude/
│   ├── commands/bl/          # cc-backlog commands
│   ├── context/              # Configuration files
│   └── templates/            # Issue templates
├── docs/
└── README.md
```

---

## Verification

### Test Installation

```bash
# Start Claude Code
cd your-project

# Test 1: List projects
/bl:project-list

# Expected: Table of accessible Backlog projects

# Test 2: Set project
/bl:project-set YOUR_PROJECT_KEY

# Expected: Project context saved confirmation

# Test 3: View project info
/bl:project-info

# Expected: Project details display

# Test 4: List issues
/bl:issue-list --limit 5

# Expected: Table of recent issues

# Test 5: Get next task
/bl:next

# Expected: Recommended tasks based on priority
```

### Verify Files Created

```bash
# Check context files were created
ls -la .claude/context/

# Should see:
# - backlog-project.json (after /bl:project-set)
# - backlog-config.json
# - workflow-config.json
```

---

## Troubleshooting

### Issue: "BacklogMCP server not available"

**Cause**: BacklogMCP server not running or not accessible

**Solution**:
```bash
# Check if server is running
docker ps | grep backlog-mcp
# or
curl http://localhost:3000/health

# Restart server
docker restart backlog-mcp
# or
npx @nulab/backlog-mcp-server
```

### Issue: "No projects found"

**Cause**: API key lacks project access permissions

**Solution**:
1. Verify API key is correct
2. Check Backlog project permissions
3. Ensure you're a member of at least one project
4. Test API access:
   ```bash
   curl -H "Authorization: Bearer $BACKLOG_API_KEY" \
        https://your-space.backlog.com/api/v2/projects
   ```

### Issue: "Authentication failed"

**Cause**: Invalid or expired API key

**Solution**:
1. Verify `BACKLOG_API_KEY` environment variable:
   ```bash
   echo $BACKLOG_API_KEY
   ```
2. Regenerate API key in Backlog settings
3. Update environment variable
4. Restart BacklogMCP server

### Issue: "Project context file corrupted"

**Cause**: Invalid JSON in context files

**Solution**:
```bash
# Validate JSON
cat .claude/context/backlog-project.json | jq .

# If invalid, reset:
rm .claude/context/backlog-project.json
/bl:project-set YOUR_PROJECT_KEY
```

### Issue: Commands not recognized

**Cause**: `.claude/commands/bl/` not in correct location

**Solution**:
```bash
# Verify command files exist
ls .claude/commands/bl/

# Should see:
# project-set.md, issue-create.md, next.md, etc.

# If missing, re-copy from cc-backlog repository
```

---

## Next Steps

1. **Learn Commands**: Read [Command Reference](../README.md#command-reference)
2. **Explore Workflows**: See [Workflow Guide](./workflows.md)
3. **Review Specification**: Check [SPECIFICATION.md](../SPECIFICATION.md)
4. **Customize**: Adjust priority algorithm and templates

---

## Support

- 📚 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [Discussions](https://github.com/bellsanct/cc-backlog/discussions)
