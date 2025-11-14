#!/usr/bin/env node
/**
 * CLI Command Runner
 *
 * Executes cc-backlog commands directly without MCP dependency.
 * This script is used by Claude Code slash commands.
 */

const {
  initializeClient,
  loadProjectContext,
  saveProjectContext,
  loadWorkflowConfig,
  handleAPIError,
  formatIssue,
  parseArgs,
  resolveUser,
  resolveIssueType,
  resolvePriority,
  resolveVersion,
  resolveCategory,
  displayTable
} = require('./utils');

/**
 * Execute a cc-backlog command
 * @param {string} command - Command name (e.g., 'project-list', 'issue-create')
 * @param {Array} args - Command arguments
 */
async function execute(command, args = []) {
  const client = initializeClient();
  const parsedArgs = parseArgs(args);

  try {
    switch (command) {
      case 'project-list':
        await projectList(client, parsedArgs);
        break;
      case 'project-set':
        await projectSet(client, parsedArgs);
        break;
      case 'project-info':
        await projectInfo(client, parsedArgs);
        break;
      case 'issue-list':
        await issueList(client, parsedArgs);
        break;
      case 'issue-create':
        await issueCreate(client, parsedArgs);
        break;
      case 'issue-start':
        await issueStart(client, parsedArgs);
        break;
      case 'issue-update':
        await issueUpdate(client, parsedArgs);
        break;
      case 'issue-comment':
        await issueComment(client, parsedArgs);
        break;
      case 'issue-close':
        await issueClose(client, parsedArgs);
        break;
      case 'next':
        await next(client, parsedArgs);
        break;
      case 'status':
        await status(client, parsedArgs);
        break;
      case 'standup':
        await standup(client, parsedArgs);
        break;
      case 'blocked':
        await blocked(client, parsedArgs);
        break;
      case 'in-progress':
        await inProgress(client, parsedArgs);
        break;
      case 'milestone-list':
        await milestoneList(client, parsedArgs);
        break;
      case 'milestone-create':
        await milestoneCreate(client, parsedArgs);
        break;
      case 'milestone-assign':
        await milestoneAssign(client, parsedArgs);
        break;
      case 'sync':
        await sync(client, parsedArgs);
        break;
      case 'export':
        await exportData(client, parsedArgs);
        break;
      default:
        console.error(`❌ Error: Unknown command '${command}'`);
        console.error('💡 Use /bl:help to see available commands');
        process.exit(1);
    }
  } catch (error) {
    handleAPIError(error, command);
    process.exit(1);
  }
}

// ========================================
// Project Commands
// ========================================

async function projectList(client, args) {
  const activeOnly = args.flags['active-only'] || false;
  const format = args.flags.format || 'table';

  const projects = await client.getProjectList({ archived: !activeOnly });

  if (format === 'json') {
    console.log(JSON.stringify(projects, null, 2));
    return;
  }

  console.log('\nAvailable Projects:');
  const headers = ['Key', 'Name', 'Status'];
  const rows = projects.map(p => [
    p.projectKey,
    p.name,
    p.archived ? 'Archived' : 'Active'
  ]);

  displayTable(headers, rows);
  console.log('\n💡 Use /bl:project-set <key> to set working project\n');
}

async function projectSet(client, args) {
  const projectKey = args.positional[0];

  if (!projectKey) {
    console.error('❌ Error: Project key is required');
    console.error('Usage: /bl:project-set <project-key>');
    process.exit(1);
  }

  // Fetch project details
  const project = await client.getProject(projectKey);

  // Fetch project metadata
  const [issueTypes, priorities, categories, versions] = await Promise.all([
    client.getIssueTypes(projectKey),
    client.getPriorities(),
    client.getCategories(projectKey),
    client.getVersionMilestoneList(projectKey)
  ]);

  // Save project context
  const projectContext = {
    projectId: project.id,
    projectKey: project.projectKey,
    projectName: project.name,
    spaceUrl: `https://${process.env.BACKLOG_SPACE_KEY}.backlog.com`,
    metadata: {
      issueTypes,
      priorities,
      categories,
      versions
    },
    setAt: new Date().toISOString()
  };

  saveProjectContext(projectContext);

  console.log(`\n✅ Project set: ${project.projectKey} - ${project.name}`);
  console.log(`🔗 ${projectContext.spaceUrl}/projects/${project.projectKey}\n`);
}

async function projectInfo(client, args) {
  const project = loadProjectContext();

  if (!project) {
    console.error('❌ Error: No project currently set');
    console.error('💡 Use /bl:project-set to set working project');
    process.exit(1);
  }

  console.log(`\n📋 Current Project: ${project.projectKey} - ${project.projectName}`);
  console.log(`🔗 ${project.spaceUrl}/projects/${project.projectKey}`);
  console.log(`\n📊 Issue Types: ${project.metadata.issueTypes.map(t => t.name).join(', ')}`);
  console.log(`📈 Priorities: ${project.metadata.priorities.map(p => p.name).join(', ')}`);
  console.log(`🏷️  Categories: ${project.metadata.categories.map(c => c.name).join(', ')}`);
  console.log(`📅 Versions: ${project.metadata.versions.map(v => v.name).join(', ')}\n`);
}

// ========================================
// Issue Commands
// ========================================

async function issueList(client, args) {
  const project = loadProjectContext();
  if (!project) {
    console.error('❌ Error: No project set. Use /bl:project-set first.');
    process.exit(1);
  }

  const filters = {
    'projectId[]': [project.projectId]
  };

  // Add optional filters
  if (args.flags.status) {
    // This would need status ID resolution, simplified for MVP
    console.log('⚠️  Status filtering not yet implemented');
  }

  if (args.flags.assignee) {
    const assigneeId = await resolveUser(client, args.flags.assignee);
    filters['assigneeId[]'] = [assigneeId];
  }

  const issues = await client.getIssues(filters);

  console.log(`\n📋 Issues (${issues.length} found):\n`);

  for (const issue of issues.slice(0, 20)) {  // Limit to first 20
    console.log(formatIssue(issue, project));
    console.log('');
  }

  if (issues.length > 20) {
    console.log(`... and ${issues.length - 20} more\n`);
  }
}

async function issueCreate(client, args) {
  const project = loadProjectContext();
  if (!project) {
    console.error('❌ Error: No project set. Use /bl:project-set first.');
    process.exit(1);
  }

  const title = args.flags.title;
  if (!title) {
    console.error('❌ Error: --title is required');
    console.error('Usage: /bl:issue-create --title "Issue title" [--type Type] [--priority Priority]');
    process.exit(1);
  }

  const issueData = {
    projectId: project.projectId,
    summary: title,
    issueTypeId: project.metadata.issueTypes[0].id,  // Default to first type
    priorityId: project.metadata.priorities.find(p => p.name === 'Normal')?.id || project.metadata.priorities[0].id
  };

  // Optional fields
  if (args.flags.description) {
    issueData.description = args.flags.description;
  }

  if (args.flags.type) {
    issueData.issueTypeId = resolveIssueType(args.flags.type, project.metadata.issueTypes);
  }

  if (args.flags.priority) {
    issueData.priorityId = resolvePriority(args.flags.priority, project.metadata.priorities);
  }

  if (args.flags.assignee) {
    issueData.assigneeId = await resolveUser(client, args.flags.assignee);
  }

  const createdIssue = await client.addIssue(issueData);

  console.log(`\n✅ Issue created: ${createdIssue.issueKey} - ${createdIssue.summary}`);
  console.log(`🔗 ${project.spaceUrl}/view/${createdIssue.issueKey}`);
  console.log(`📊 Type: ${createdIssue.issueType.name} | Priority: ${createdIssue.priority.name}\n`);
}

async function issueStart(client, args) {
  const issueKey = args.positional[0];

  if (!issueKey) {
    console.error('❌ Error: Issue key is required');
    console.error('Usage: /bl:issue-start <issue-key> [--assignee-me]');
    process.exit(1);
  }

  const updateData = {};

  if (args.flags['assignee-me']) {
    const currentUser = await client.getMyself();
    updateData.assigneeId = currentUser.id;
  }

  // Update status to "In Progress" if available
  // This would require status resolution, simplified for MVP
  await client.updateIssue(issueKey, updateData);

  const issue = await client.getIssue(issueKey);
  const project = loadProjectContext();

  console.log(`\n✅ Started working on: ${issue.issueKey} - ${issue.summary}`);
  console.log(formatIssue(issue, project));
  console.log('');
}

async function issueUpdate(client, args) {
  const issueKey = args.positional[0];

  if (!issueKey) {
    console.error('❌ Error: Issue key is required');
    console.error('Usage: /bl:issue-update <issue-key> [--status Status] [--priority Priority]');
    process.exit(1);
  }

  const updateData = {};

  if (args.flags.priority) {
    const priorities = await client.getPriorities();
    updateData.priorityId = resolvePriority(args.flags.priority, priorities);
  }

  await client.updateIssue(issueKey, updateData);

  const issue = await client.getIssue(issueKey);
  console.log(`\n✅ Issue updated: ${issue.issueKey} - ${issue.summary}\n`);
}

async function issueComment(client, args) {
  const issueKey = args.positional[0];
  const comment = args.positional.slice(1).join(' ');

  if (!issueKey || !comment) {
    console.error('❌ Error: Issue key and comment are required');
    console.error('Usage: /bl:issue-comment <issue-key> "Comment text"');
    process.exit(1);
  }

  await client.addIssueComment(issueKey, { content: comment });

  console.log(`\n✅ Comment added to ${issueKey}\n`);
}

async function issueClose(client, args) {
  const issueKey = args.positional[0];

  if (!issueKey) {
    console.error('❌ Error: Issue key is required');
    console.error('Usage: /bl:issue-close <issue-key> [--resolution Fixed]');
    process.exit(1);
  }

  const updateData = {};

  if (args.flags.resolution) {
    const resolutions = await client.getResolutions();
    const resolution = resolutions.find(r => r.name === args.flags.resolution);
    if (resolution) {
      updateData.resolutionId = resolution.id;
    }
  }

  await client.updateIssue(issueKey, updateData);

  console.log(`\n✅ Issue closed: ${issueKey}\n`);
}

// ========================================
// Workflow Commands
// ========================================

async function next(client, args) {
  const project = loadProjectContext();
  if (!project) {
    console.error('❌ Error: No project set. Use /bl:project-set first.');
    process.exit(1);
  }

  const count = parseInt(args.flags.count || '3', 10);
  const assignee = args.flags.assignee || 'me';

  const assigneeId = await resolveUser(client, assignee);

  const filters = {
    'projectId[]': [project.projectId],
    'assigneeId[]': [assigneeId]
  };

  const issues = await client.getIssues(filters);
  const config = loadWorkflowConfig();

  // Calculate priority scores
  const scoredIssues = issues.map(issue => ({
    issue,
    score: calculatePriorityScore(issue, config)
  }));

  // Sort by score descending
  scoredIssues.sort((a, b) => b.score - a.score);

  // Take top N
  const recommendations = scoredIssues.slice(0, count);

  console.log(`\n🎯 Recommended next tasks (by priority):\n`);

  for (let i = 0; i < recommendations.length; i++) {
    const { issue, score } = recommendations[i];
    const icon = issue.priority.name === 'High' ? '🔴' : issue.priority.name === 'Normal' ? '🟡' : '🟢';

    console.log(`${i + 1}. ${icon} ${issue.issueKey} - ${issue.summary}`);
    console.log(`   Type: ${issue.issueType.name} | Priority: ${issue.priority.name}`);
    console.log(`   Score: ${score.toFixed(1)}/100\n`);
  }

  console.log('Use /bl:issue-start <key> to begin work\n');
}

function calculatePriorityScore(issue, config) {
  const weights = config.priorityAlgorithm.weights;

  // Priority weight
  const priorityMap = { High: 3, Normal: 2, Low: 1 };
  const priorityWeight = priorityMap[issue.priority.name] || 1;

  // Simple score calculation
  const score = priorityWeight * weights.priority;

  return Math.min(100, score);
}

async function status(client, args) {
  const project = loadProjectContext();
  if (!project) {
    console.error('❌ Error: No project set. Use /bl:project-set first.');
    process.exit(1);
  }

  const issues = await client.getIssues({ 'projectId[]': [project.projectId] });
  const issueCount = await client.countIssues({ 'projectId[]': [project.projectId] });

  console.log(`\n📊 Project Status: ${project.projectName}\n`);
  console.log(`Total Issues: ${issueCount.count}`);
  console.log(`Fetched: ${issues.length}\n`);
}

async function standup(client, args) {
  console.log('\n📋 Daily Standup Report\n');
  console.log('This feature is under development.\n');
}

async function blocked(client, args) {
  console.log('\n🚧 Blocked Issues\n');
  console.log('This feature is under development.\n');
}

async function inProgress(client, args) {
  console.log('\n🔄 In Progress Issues\n');
  console.log('This feature is under development.\n');
}

// ========================================
// Milestone Commands
// ========================================

async function milestoneList(client, args) {
  const project = loadProjectContext();
  if (!project) {
    console.error('❌ Error: No project set. Use /bl:project-set first.');
    process.exit(1);
  }

  const versions = await client.getVersionMilestoneList(project.projectKey);

  console.log('\n📅 Milestones:\n');
  const headers = ['Name', 'Status'];
  const rows = versions.map(v => [v.name, v.archived ? 'Archived' : 'Active']);

  displayTable(headers, rows);
  console.log('');
}

async function milestoneCreate(client, args) {
  console.log('\n📅 Create Milestone\n');
  console.log('This feature is under development.\n');
}

async function milestoneAssign(client, args) {
  console.log('\n📅 Assign Milestone\n');
  console.log('This feature is under development.\n');
}

// ========================================
// Data Commands
// ========================================

async function sync(client, args) {
  console.log('\n🔄 Sync with Backlog\n');
  console.log('This feature is under development.\n');
}

async function exportData(client, args) {
  console.log('\n📤 Export Data\n');
  console.log('This feature is under development.\n');
}

// ========================================
// Main
// ========================================

if (require.main === module) {
  const [, , command, ...args] = process.argv;

  if (!command) {
    console.error('Usage: cli-runner.js <command> [args...]');
    process.exit(1);
  }

  execute(command, args).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { execute };
