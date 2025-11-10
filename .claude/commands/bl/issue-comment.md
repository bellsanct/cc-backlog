# /bl:issue-comment - Add Issue Comment

Add comments to Backlog issues with optional user notifications.

## Syntax

```bash
/bl:issue-comment <issue_key> <comment> [--notify <users>]
```

## Arguments

- `<issue_key>` (required): Issue key (e.g., MYPRJ-123)
- `<comment>` (required): Comment text (Markdown formatting supported)
- `--notify <users>`: Comma-separated list of usernames to mention in comment

## Behavior

1. **Validate Issue**: Verify issue exists in current project
2. **Format Comment**: Apply Markdown formatting and add user mentions if specified
3. **Add Comment**: Call BacklogMCP `add_comment` to post comment
4. **Notify Users**: Mention users with @username syntax if `--notify` provided
5. **Display Confirmation**: Show comment confirmation with issue link

## Examples

### Basic Comment
```bash
/bl:issue-comment MYPRJ-123 "Completed JWT middleware implementation"
```

**Output:**
```
💬 Comment added to MYPRJ-123
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

### Comment with User Notifications
```bash
/bl:issue-comment MYPRJ-123 "Please review the authentication changes" --notify johndoe,janedoe
```

**Output:**
```
💬 Comment added to MYPRJ-123
📢 Notified: @johndoe, @janedoe
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

### Multi-line Comment with Markdown
```bash
/bl:issue-comment MYPRJ-123 "## Progress Update

**Completed:**
- JWT token generation
- Token validation middleware
- Refresh token logic

**Next Steps:**
- Integration tests
- Documentation update"
```

**Output:**
```
💬 Comment added to MYPRJ-123 (multi-line)
📝 3 completed items, 2 next steps
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

### Progress Update
```bash
/bl:issue-comment MYPRJ-123 "Progress: 75% complete. Testing authentication flow."
```

## Use Cases

### Development Updates
```bash
# Update progress during work
/bl:issue-comment MYPRJ-123 "Implemented token generation, working on validation"

# Report completion
/bl:issue-comment MYPRJ-123 "Implementation complete, ready for review" --notify reviewer
```

### Collaboration
```bash
# Ask for input
/bl:issue-comment MYPRJ-123 "Need clarification on edge case handling" --notify product-manager

# Share findings
/bl:issue-comment MYPRJ-123 "Found root cause: cookie not set on Safari. Applying fix."
```

### Status Updates
```bash
# Daily standup update
/bl:issue-comment MYPRJ-123 "Working on this today, expect completion by EOD"

# Blocker notification
/bl:issue-comment MYPRJ-123 "Blocked: waiting for API team to enable CORS" --notify team-lead
```

## Markdown Support

Comments support full Markdown formatting:

```markdown
# Headers
**Bold text**
*Italic text*
`code snippets`
[Links](https://example.com)
- Bullet lists
1. Numbered lists
> Blockquotes
```

## Error Handling

**Issue Not Found:**
```
❌ Error: Issue MYPRJ-999 not found
💡 Use /bl:issue-list to view available issues
```

**Invalid User:**
```
⚠️ Warning: User "unknown_user" not found
💬 Comment added without notification
🔗 https://my-space.backlog.com/view/MYPRJ-123
```

**Empty Comment:**
```
❌ Error: Comment text cannot be empty
💡 Usage: /bl:issue-comment MYPRJ-123 "Your comment here"
```

## Implementation Notes

**BacklogMCP Integration:**
- Uses `add_comment` tool to post comments
- Automatically formats @mentions for user notifications
- Preserves Markdown formatting in Backlog

**Notification System:**
- `--notify` converts usernames to Backlog @mentions
- Invalid usernames are warned but don't block comment posting
- Users receive in-app notifications for mentions

**Comment Formatting:**
- Preserves line breaks and Markdown syntax
- Automatically links issue keys (e.g., MYPRJ-123)
- Supports code blocks with syntax highlighting

## Related Commands

- `/bl:issue-update` - Update issue properties and add optional comment
- `/bl:issue-start` - Start work on issue with initial comment
- `/bl:issue-close` - Close issue with final comment
- `/bl:issue-list` - List issues to find issue keys
