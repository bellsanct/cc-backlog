# /bl:issue-create - Create New Issue

Create a single Backlog issue with interactive or command-line input.

## Usage

```bash
/bl:issue-create [--title <title>] [--description <desc>]
                 [--type <type>] [--priority <priority>]
                 [--assignee <user>] [--milestone <version>]
                 [--category <category>] [--template <template_name>]
                 [--interactive]
```

## Arguments

- `--title` (optional): Issue title
- `--description` (optional): Issue description (Markdown supported)
- `--type` (optional): Issue type (Task, Bug, Feature, etc.)
- `--priority` (optional): Priority (High, Normal, Low)
- `--assignee` (optional): Assignee username or user ID
- `--milestone` (optional): Milestone/version name
- `--category` (optional): Category name
- `--template` (optional): Template name from `.claude/templates/`
- `--interactive` (optional): Force interactive input mode

## Behavior

1. **Check Project**: Verify project is set
2. **Input Mode**: If `--interactive` or insufficient args, enter interactive mode
3. **Template Loading**: If `--template`, load template from `.claude/templates/`
4. **Validation**: Validate required fields (title minimum)
5. **ID Resolution**: Resolve assignee, milestone, category names to IDs
6. **Create Issue**: Call Backlog API POST `/api/v2/issues`
7. **Display**: Show created issue details with URL

## Implementation

### Step 1: Check project context
```python
project = load_project_context()
if not project:
    error("No project set. Use /bl:project-set first.")
    return
```

### Step 2: Determine input mode
```python
# Check if we have minimum required args or interactive flag
interactive = get_flag('--interactive') or not get_arg('--title')

if interactive:
    # Interactive mode
    issue_data = interactive_issue_input()
else:
    # Command-line mode
    issue_data = parse_issue_args()
```

### Step 3: Load template (if specified)
```python
template_name = get_arg('--template')
if template_name:
    template = load_template(f'.claude/templates/issue-{template_name}.md')
    issue_data = apply_template(template, issue_data)
```

### Step 4: Resolve IDs
```python
# Resolve type ID
if issue_data.get('type'):
    type_id = resolve_issue_type(issue_data['type'], project['metadata']['issueTypes'])
    issue_data['typeId'] = type_id

# Resolve priority ID
if issue_data.get('priority'):
    priority_id = resolve_priority(issue_data['priority'], project['metadata']['priorities'])
    issue_data['priorityId'] = priority_id

# Resolve assignee ID
if issue_data.get('assignee'):
    assignee_id = resolve_user(issue_data['assignee'])
    issue_data['assigneeId'] = assignee_id

# Resolve milestone ID
if issue_data.get('milestone'):
    milestone_id = resolve_version(issue_data['milestone'], project['metadata']['versions'])
    issue_data['milestoneId'] = milestone_id

# Resolve category ID
if issue_data.get('category'):
    category_id = resolve_category(issue_data['category'], project['metadata']['categories'])
    issue_data['categoryId'] = category_id
```

### Step 5: Create issue via Backlog API
```javascript
const { BacklogAPIClient } = require('../../../lib/backlog-api');
const { loadEnv } = require('../../../lib/utils');

const config = loadEnv();
const backlog = new BacklogAPIClient({
  spaceKey: config.BACKLOG_SPACE_KEY,
  apiKey: config.BACKLOG_API_KEY
});

// Prepare API parameters
const issueParams = {
  projectId: project.projectId,
  summary: issueData.title,
  issueTypeId: issueData.typeId,
  priorityId: issueData.priorityId,
  description: issueData.description || ''
};

// Add optional fields
if (issueData.assigneeId) {
  issueParams.assigneeId = issueData.assigneeId;
}
if (issueData.milestoneId) {
  issueParams.milestoneId = [issueData.milestoneId];
}
if (issueData.categoryId) {
  issueParams.categoryId = [issueData.categoryId];
}

// Call Backlog API
const createdIssue = await backlog.addIssue(issueParams);
```

### Step 6: Display result
```python
issue_url = f"{project['spaceUrl']}/view/{created_issue['issueKey']}"

print(f"""
✅ Issue created: {created_issue['issueKey']} - {created_issue['summary']}
🔗 {issue_url}
📊 Type: {created_issue['issueType']['name']} | Priority: {created_issue['priority']['name']}
👤 Assignee: {created_issue.get('assignee', {}).get('name', '(none)')}
""")

# Update cache
update_issue_cache(created_issue)
```

## Interactive Mode

When in interactive mode, prompt for each field:

```
📝 Creating new issue...

Title: Implement user authentication
Description (Markdown, press Ctrl+D when done):
> Add JWT-based authentication system
> with token refresh mechanism
>
Issue Type:
  [1] Task
  [2] Bug
  [3] Feature
→ 3

Priority:
  [1] High
  [2] Normal
  [3] Low
→ 1

Assignee (username or leave blank): johndoe
Milestone (version name or leave blank): v1.0
Category (name or leave blank): Backend

Creating issue...
✅ Issue created: MYPRJ-123 - Implement user authentication
```

## Template System

Templates are loaded from `.claude/templates/issue-<name>.md`:

**Example template** (`.claude/templates/issue-feature.md`):
```markdown
---
template: "feature"
issueType: "Feature"
priority: "Normal"
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
```

**Usage**:
```bash
/bl:issue-create --template feature --interactive
```

The template will:
1. Pre-fill issueType and priority from frontmatter
2. Structure description using template body
3. Prompt for template variables (`{description}`, `{user_type}`, etc.)

## Error Handling

**No project set**:
```
❌ Error: No project currently set
💡 Use /bl:project-set to set working project
```

**Invalid issue type**:
```
❌ Error: Issue type 'InvalidType' not found in project
💡 Available types: Task, Bug, Feature
```

**Invalid assignee**:
```
❌ Error: User 'invaliduser' not found in project
💡 Use /bl:project-info --verbose to see project members
```

**API error**:
```
❌ Error: Failed to create issue
💡 Suggestion: Check required fields and permissions
🔗 API response: [error details]
```

## Example Usage

**Command-line mode**:
```bash
/bl:issue-create --title "Fix login bug" --type Bug --priority High
```

**Interactive mode**:
```bash
/bl:issue-create --interactive
```

**With all options**:
```bash
/bl:issue-create --title "Add dashboard" \
                 --description "Create user dashboard with analytics" \
                 --type Feature \
                 --priority High \
                 --assignee johndoe \
                 --milestone v1.0 \
                 --category Frontend
```

**With template**:
```bash
/bl:issue-create --template feature --title "User notifications"
```

## Output Example

```
✅ Issue created: MYPRJ-123 - Implement user authentication
🔗 https://my-space.backlog.com/view/MYPRJ-123
📊 Type: Feature | Priority: High
👤 Assignee: johndoe
📅 Milestone: v1.0
🏷️ Category: Backend
```

## Related Commands

- `/bl:issue-bulk-create` - Create multiple issues from CSV/JSON
- `/bl:issue-list` - List existing issues
- `/bl:issue-start` - Start working on an issue
