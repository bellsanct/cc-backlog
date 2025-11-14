/**
 * Utility functions for cc-backlog CLI commands
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('./backlog-api');

/**
 * Load environment variables from .env file
 */
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  }
}

/**
 * Initialize Backlog API client with environment configuration
 * @returns {Object} Backlog API client instance
 */
function initializeClient() {
  loadEnv();

  try {
    return createClient();
  } catch (error) {
    console.error('❌ Error: Failed to initialize Backlog API client');
    console.error(`💡 ${error.message}`);
    console.error('📚 Setup guide: See docs/setup.md');
    process.exit(1);
  }
}

/**
 * Load configuration from context file
 * @param {string} filename - Config filename
 * @returns {Object|null} Configuration object or null if not found
 */
function loadConfig(filename) {
  const configPath = path.join(process.cwd(), '.claude', 'context', filename);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`⚠️  Warning: Failed to load ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Save configuration to context file
 * @param {string} filename - Config filename
 * @param {Object} data - Configuration data
 */
function saveConfig(filename, data) {
  const contextDir = path.join(process.cwd(), '.claude', 'context');
  const configPath = path.join(contextDir, filename);

  // Ensure context directory exists
  if (!fs.existsSync(contextDir)) {
    fs.mkdirSync(contextDir, { recursive: true });
  }

  try {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`❌ Error: Failed to save ${filename}: ${error.message}`);
  }
}

/**
 * Load project context (current working project)
 * @returns {Object|null} Project context or null
 */
function loadProjectContext() {
  return loadConfig('backlog-project.json');
}

/**
 * Save project context
 * @param {Object} projectData - Project data to save
 */
function saveProjectContext(projectData) {
  saveConfig('backlog-project.json', projectData);
}

/**
 * Load workflow configuration
 * @returns {Object} Workflow config (returns default if not found)
 */
function loadWorkflowConfig() {
  const config = loadConfig('workflow-config.json');

  // Return default config if not found
  if (!config) {
    return {
      priorityAlgorithm: {
        weights: {
          priority: 10,
          dueDate: 5,
          blockedDependencies: 3,
          estimatedHours: -0.1,
          ageInDays: 0.5
        },
        customRules: []
      },
      statusTransitions: {
        Open: ['In Progress', 'Closed'],
        'In Progress': ['Resolved', 'Open', 'Closed'],
        Resolved: ['Closed', 'In Progress'],
        Closed: ['Open']
      },
      automation: {
        autoCommentOnStart: true,
        autoCommentOnClose: true,
        autoAssignOnStart: true,
        notifyAssigneeOnUpdate: true
      }
    };
  }

  return config;
}

/**
 * Handle API errors with user-friendly messages
 * @param {Error} error - Error object from API
 * @param {string} operation - Operation being performed
 */
function handleAPIError(error, operation) {
  console.error(`\n❌ Error: ${operation} failed`);

  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        console.error('💡 Invalid request parameters');
        break;
      case 401:
        console.error('💡 Authentication failed - check your API key');
        break;
      case 403:
        console.error('💡 Permission denied - check project access');
        break;
      case 404:
        console.error('💡 Resource not found');
        break;
      case 429:
        console.error('💡 Rate limit exceeded - please wait and try again');
        break;
      case 500:
      case 502:
      case 503:
        console.error('💡 Backlog API server error - please try again later');
        break;
      default:
        console.error(`💡 HTTP ${error.statusCode} error`);
    }
  }

  if (error.response && error.response.errors) {
    console.error('Details:', error.response.errors);
  } else {
    console.error('Details:', error.message);
  }
}

/**
 * Format issue for display
 * @param {Object} issue - Issue object from API
 * @param {Object} project - Project context
 * @returns {string} Formatted issue string
 */
function formatIssue(issue, project) {
  const key = issue.issueKey;
  const summary = issue.summary;
  const type = issue.issueType.name;
  const priority = issue.priority.name;
  const status = issue.status.name;
  const assignee = issue.assignee ? issue.assignee.name : '(none)';

  const url = project ? `${project.spaceUrl}/view/${key}` : '';

  return `${key} - ${summary}
  Type: ${type} | Priority: ${priority} | Status: ${status}
  Assignee: ${assignee}
  ${url ? `URL: ${url}` : ''}`;
}

/**
 * Parse command arguments
 * @param {Array} args - Command line arguments
 * @returns {Object} Parsed arguments object
 */
function parseArgs(args) {
  const parsed = {
    flags: {},
    positional: []
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      // Check if next arg is a value or another flag
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed.flags[key] = args[i + 1];
        i++; // Skip next arg
      } else {
        parsed.flags[key] = true; // Boolean flag
      }
    } else {
      parsed.positional.push(arg);
    }
  }

  return parsed;
}

/**
 * Resolve user by name or ID
 * @param {Object} client - Backlog API client
 * @param {string|number} userIdentifier - User name or ID
 * @returns {Promise<number>} User ID
 */
async function resolveUser(client, userIdentifier) {
  // If it's already a number, return it
  if (typeof userIdentifier === 'number' || /^\d+$/.test(userIdentifier)) {
    return parseInt(userIdentifier, 10);
  }

  // If it's 'me', get current user
  if (userIdentifier === 'me') {
    const currentUser = await client.getMyself();
    return currentUser.id;
  }

  // Otherwise, search by name
  const users = await client.getUsers();
  const user = users.find(u => u.name === userIdentifier || u.userId === userIdentifier);

  if (!user) {
    throw new Error(`User '${userIdentifier}' not found`);
  }

  return user.id;
}

/**
 * Resolve issue type name to ID
 * @param {string} typeName - Issue type name
 * @param {Array} issueTypes - Available issue types
 * @returns {number} Issue type ID
 */
function resolveIssueType(typeName, issueTypes) {
  const type = issueTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());

  if (!type) {
    throw new Error(`Issue type '${typeName}' not found`);
  }

  return type.id;
}

/**
 * Resolve priority name to ID
 * @param {string} priorityName - Priority name
 * @param {Array} priorities - Available priorities
 * @returns {number} Priority ID
 */
function resolvePriority(priorityName, priorities) {
  const priority = priorities.find(p => p.name.toLowerCase() === priorityName.toLowerCase());

  if (!priority) {
    throw new Error(`Priority '${priorityName}' not found`);
  }

  return priority.id;
}

/**
 * Resolve version/milestone name to ID
 * @param {string} versionName - Version name
 * @param {Array} versions - Available versions
 * @returns {number} Version ID
 */
function resolveVersion(versionName, versions) {
  const version = versions.find(v => v.name === versionName);

  if (!version) {
    throw new Error(`Version/Milestone '${versionName}' not found`);
  }

  return version.id;
}

/**
 * Resolve category name to ID
 * @param {string} categoryName - Category name
 * @param {Array} categories - Available categories
 * @returns {number} Category ID
 */
function resolveCategory(categoryName, categories) {
  const category = categories.find(c => c.name === categoryName);

  if (!category) {
    throw new Error(`Category '${categoryName}' not found`);
  }

  return category.id;
}

/**
 * Display table with headers and rows
 * @param {Array} headers - Table headers
 * @param {Array} rows - Table rows (array of arrays)
 */
function displayTable(headers, rows) {
  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const headerWidth = h.length;
    const maxRowWidth = Math.max(...rows.map(r => String(r[i] || '').length));
    return Math.max(headerWidth, maxRowWidth);
  });

  // Top border
  console.log('┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐');

  // Headers
  console.log('│ ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ') + ' │');

  // Header separator
  console.log('├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤');

  // Rows
  for (const row of rows) {
    console.log('│ ' + row.map((cell, i) => String(cell || '').padEnd(colWidths[i])).join(' │ ') + ' │');
  }

  // Bottom border
  console.log('└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘');
}

module.exports = {
  loadEnv,
  initializeClient,
  loadConfig,
  saveConfig,
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
};
