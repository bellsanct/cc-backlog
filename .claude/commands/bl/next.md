# /bl:next - Get Recommended Next Task

Intelligently recommend the next task to work on based on priority algorithm.

## Usage

```bash
/bl:next [--assignee me|<user>] [--type <type>] [--count <n>]
```

## Arguments

- `--assignee` (optional): Filter by assignee (default: `me`)
- `--type` (optional): Filter by issue type (Task, Bug, Feature, etc.)
- `--count` (optional): Number of recommendations (default: 3)

## Behavior

1. Fetch open issues for assignee
2. Calculate priority score for each issue using algorithm
3. Sort by score descending
4. Return top N recommendations

## Priority Algorithm

Default scoring formula:

```
score = priority_weight × 10 +
        due_date_urgency × 5 +
        blocked_dependencies × 3 -
        estimated_hours × 0.1 +
        age_in_days × 0.5
```

Where:
- `priority_weight`: 0-3 (High=3, Normal=2, Low=1)
- `due_date_urgency`: 0-10 (overdue=10, today=8, this week=5, later=1)
- `blocked_dependencies`: Count of issues blocked by this one
- `estimated_hours`: Estimated work hours (negative weight favors smaller tasks)
- `age_in_days`: Days since creation (prevents task starvation)

Configuration is loaded from `.claude/context/workflow-config.json`.

## Implementation

```python
project = load_project_context()

# Parse arguments
assignee_arg = get_arg('--assignee', default='me')
type_filter = get_arg('--type')
count = get_arg('--count', default=3, type=int)

# Resolve assignee
if assignee_arg == 'me':
    current_user = call_mcp('backlog_get_myself')
    assignee_id = current_user['id']
else:
    assignee_id = resolve_user(assignee_arg)

# Build filter
filters = {
    'projectId[]': [project['projectId']],
    'assigneeId[]': [assignee_id],
    'statusId[]': get_open_status_ids(project)
}

if type_filter:
    type_id = resolve_issue_type(type_filter, project)
    filters['issueTypeId[]'] = [type_id]

# Fetch issues
issues = call_mcp('backlog_get_issues', **filters)

# Load workflow config
config = load_workflow_config()

# Calculate scores
scored_issues = []
for issue in issues:
    score = calculate_priority_score(issue, config)
    scored_issues.append((score, issue))

# Sort by score descending
scored_issues.sort(key=lambda x: x[0], reverse=True)

# Take top N
recommendations = scored_issues[:count]

# Display
print(f"🎯 Recommended next tasks (by priority):\n")
for i, (score, issue) in enumerate(recommendations, 1):
    display_recommendation(i, score, issue, project)

print("\nUse /bl:issue-start <key> to begin work")
```

## Scoring Functions

### Priority Weight
```python
def get_priority_weight(priority_name):
    mapping = {'High': 3, 'Normal': 2, 'Low': 1}
    return mapping.get(priority_name, 1)
```

### Due Date Urgency
```python
def get_due_date_urgency(due_date):
    if not due_date:
        return 1

    days_until_due = (due_date - today()).days

    if days_until_due < 0:  # Overdue
        return 10
    elif days_until_due == 0:  # Today
        return 8
    elif days_until_due <= 2:  # Within 2 days
        return 7
    elif days_until_due <= 7:  # This week
        return 5
    elif days_until_due <= 14:  # Next 2 weeks
        return 3
    else:
        return 1
```

### Blocked Dependencies
```python
def count_blocked_dependencies(issue):
    # Count how many other issues are blocked by this one
    # This requires checking issue relationships
    # For MVP, return 0
    return 0
```

### Age Factor
```python
def get_age_factor(created_date):
    days_old = (today() - created_date).days
    return days_old * 0.5
```

### Total Score
```python
def calculate_priority_score(issue, config):
    weights = config['priorityAlgorithm']['weights']

    priority_weight = get_priority_weight(issue['priority']['name'])
    due_date_urgency = get_due_date_urgency(issue.get('dueDate'))
    blocked_deps = count_blocked_dependencies(issue)
    estimated_hours = issue.get('estimatedHours', 8)
    age_factor = get_age_factor(issue['created'])

    score = (priority_weight * weights['priority'] +
             due_date_urgency * weights['dueDate'] +
             blocked_deps * weights['blockedDependencies'] -
             estimated_hours * weights['estimatedHours'] +
             age_factor)

    # Apply custom rules
    for rule in config['priorityAlgorithm'].get('customRules', []):
        if evaluate_rule(rule['condition'], issue):
            score += rule['scoreModifier']

    return round(score, 1)
```

## Custom Rules

Rules can be defined in `.claude/context/workflow-config.json`:

```json
{
  "priorityAlgorithm": {
    "customRules": [
      {
        "name": "Critical bugs first",
        "condition": "issueType == 'Bug' && priority == 'High'",
        "scoreModifier": 50
      },
      {
        "name": "Milestone near deadline",
        "condition": "milestone.dueDate < 7 days",
        "scoreModifier": 20
      }
    ]
  }
}
```

## Output Example

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
   💡 Quick win (2 hours estimated)

Use /bl:issue-start <key> to begin work
```

## Example Usage

**My next tasks**:
```bash
/bl:next
```

**Next 5 tasks**:
```bash
/bl:next --count 5
```

**Next bug to fix**:
```bash
/bl:next --type Bug --count 1
```

**Another user's next tasks**:
```bash
/bl:next --assignee johndoe
```

## Related Commands

- `/bl:issue-start` - Start working on recommended issue
- `/bl:issue-list` - List all issues with filters
- `/bl:status` - Project status dashboard
