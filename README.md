# cc-backlog

English | [日本語](./README.ja.md)

> Claude Code commands for Backlog project management

Bring powerful project management workflows to [Backlog](https://backlog.com/) directly within your Claude Code sessions. cc-backlog enables PM-style task management through simple `/bl:` commands.

## Features

- 🎯 **Project Context Management** - Switch between Backlog projects seamlessly
- 📝 **Issue Lifecycle** - Create, start, update, and close issues with simple commands
- 🤖 **Intelligent Task Recommendations** - Get next task suggestions based on priority algorithm
- 📊 **Progress Dashboards** - Visual project status with completion metrics
- 💾 **Cross-Session Persistence** - Maintain context across Claude Code sessions
- 🚀 **Bulk Operations** - Create multiple issues from CSV/JSON files

## Quick Start

### Prerequisites

1. **Backlog Account** with API access
2. **BacklogMCP Server** - [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server)
3. **Claude Code CLI** - [Anthropic's Claude Code](https://docs.claude.com/en/docs/claude-code)

### Installation

Clone this repository into your project:

```bash
cd your-project
git clone https://github.com/bellsanct/cc-backlog .claude-backlog
cp -r .claude-backlog/.claude .
```

For detailed setup instructions, see the [Setup Guide](./docs/setup.md).

### Your First Commands

```bash
# List available projects
/bl:project-list

# Set working project
/bl:project-set MYPRJ

# Create an issue
/bl:issue-create --title "Implement feature X" --type Feature --priority High

# Get recommended next task
/bl:next

# Start working on an issue
/bl:issue-start MYPRJ-123 --assignee-me

# Check project status
/bl:status

# Close completed issue
/bl:issue-close MYPRJ-123 --resolution Fixed
```

## Command Reference

### Project Context

| Command            | Description          | Example                          |
| ------------------ | -------------------- | -------------------------------- |
| `/bl:project-set`  | Set working project  | `/bl:project-set MYPRJ`          |
| `/bl:project-list` | List all projects    | `/bl:project-list --active-only` |
| `/bl:project-info` | Show project details | `/bl:project-info --verbose`     |

### Issue Management

| Command                 | Description               | Example                                             |
| ----------------------- | ------------------------- | --------------------------------------------------- |
| `/bl:issue-create`      | Create new issue          | `/bl:issue-create --title "Fix bug" --type Bug`     |
| `/bl:issue-bulk-create` | Bulk create from CSV/JSON | `/bl:issue-bulk-create issues.csv`                  |
| `/bl:issue-start`       | Start working on issue    | `/bl:issue-start MYPRJ-123 --assignee-me`           |
| `/bl:issue-update`      | Update issue properties   | `/bl:issue-update MYPRJ-123 --status "In Progress"` |
| `/bl:issue-comment`     | Add comment to issue      | `/bl:issue-comment MYPRJ-123 "Progress: 75%"`       |
| `/bl:issue-close`       | Close completed issue     | `/bl:issue-close MYPRJ-123 --resolution Fixed`      |
| `/bl:issue-list`        | List issues with filters  | `/bl:issue-list --status Open --assignee me`        |

### Workflow

| Command           | Description               | Example                       |
| ----------------- | ------------------------- | ----------------------------- |
| `/bl:next`        | Get recommended next task | `/bl:next --count 5`          |
| `/bl:status`      | Project status dashboard  | `/bl:status --milestone v1.0` |
| `/bl:standup`     | Daily standup report      | `/bl:standup --days 1`        |
| `/bl:blocked`     | Show blocked issues       | `/bl:blocked --assignee me`   |
| `/bl:in-progress` | Show in-progress issues   | `/bl:in-progress`             |

### Milestones

| Command                | Description                | Example                                 |
| ---------------------- | -------------------------- | --------------------------------------- |
| `/bl:milestone-create` | Create milestone           | `/bl:milestone-create "v1.0.0"`         |
| `/bl:milestone-list`   | List milestones            | `/bl:milestone-list`                    |
| `/bl:milestone-assign` | Assign milestone to issues | `/bl:milestone-assign "v1.0" MYPRJ-123` |

### Sync

| Command      | Description              | Example                                       |
| ------------ | ------------------------ | --------------------------------------------- |
| `/bl:sync`   | Synchronize with Backlog | `/bl:sync --full`                             |
| `/bl:export` | Export project data      | `/bl:export --format csv --output issues.csv` |

## Typical Workflows

### Feature Development

```bash
# 1. Set project
/bl:project-set MYPRJ

# 2. Create issues for features
/bl:issue-create --title "Implement JWT middleware" --type Feature --priority High
/bl:issue-create --title "Add login endpoint" --type Feature --priority High

# 3. Get next task
/bl:next

# 4. Start work
/bl:issue-start MYPRJ-123 --assignee-me

# 5. Update progress
/bl:issue-comment MYPRJ-123 "Implemented JWT middleware"

# 6. Close when done
/bl:issue-close MYPRJ-123 --resolution Fixed

# 7. Check status
/bl:status
```

### Bug Triage

```bash
# 1. Import bugs from CSV
/bl:issue-bulk-create bugs.csv --type Bug

# 2. Get high-priority bug
/bl:next --type Bug --count 1

# 3. Start fixing
/bl:issue-start MYPRJ-456 --assignee-me

# 4. Mark as blocked if needed
/bl:issue-update MYPRJ-456 --status Blocked --comment "Needs API access"

# 5. Check all blockers
/bl:blocked
```

### Daily Standup

```bash
# Morning: Check what to work on
/bl:next --count 5

# Start first task
/bl:issue-start MYPRJ-123 --assignee-me

# During work: Add updates
/bl:issue-comment MYPRJ-123 "Progress: 75% complete"

# End task
/bl:issue-close MYPRJ-123 --resolution Fixed

# End of day: Generate standup
/bl:standup --days 1

# Check overall status
/bl:status
```

## Documentation

- [Complete Specification](./SPECIFICATION.md) - Detailed command reference and data structures
- [Setup Guide](./docs/setup.md) - Installation and configuration
- [Workflow Guide](./docs/workflows.md) - Common PM workflows

## Project Structure

```
cc-backlog/
├── .claude/
│   ├── commands/bl/          # Command implementations
│   │   ├── project-set.md
│   │   ├── issue-create.md
│   │   ├── next.md
│   │   └── ...
│   ├── context/              # Configuration and runtime context
│   │   ├── backlog-config.json
│   │   ├── workflow-config.json
│   │   └── ...
│   └── templates/            # Issue templates
├── docs/                     # Documentation
├── SPECIFICATION.md          # Complete specification
└── README.md                 # This file
```

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- Built on [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server)
- Powered by [Claude Code](https://docs.claude.com/en/docs/claude-code)

## Support

- 📚 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [Discussions](https://github.com/bellsanct/cc-backlog/discussions)

---

Made with ❤️ for better project management in Claude Code
