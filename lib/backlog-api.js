/**
 * Backlog API Client
 *
 * Direct API client for Backlog without MCP dependency.
 * Handles authentication, rate limiting, and error responses.
 */

const https = require('https');
const http = require('http');

class BacklogAPIClient {
  /**
   * Initialize the Backlog API client
   * @param {Object} config - Configuration object
   * @param {string} config.spaceKey - Backlog space key (e.g., 'my-space')
   * @param {string} config.apiKey - Backlog API key
   * @param {string} [config.apiEndpoint] - Optional custom API endpoint
   */
  constructor(config) {
    if (!config.spaceKey) {
      throw new Error('spaceKey is required');
    }
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }

    this.spaceKey = config.spaceKey;
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint || `https://${config.spaceKey}.backlog.com/api/v2`;
    this.rateLimitDelay = config.rateLimitDelay || 100; // ms between requests
    this.lastRequestTime = 0;
  }

  /**
   * Make HTTP request to Backlog API
   * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
   * @param {string} path - API path (e.g., '/projects')
   * @param {Object} [data] - Request body data (for POST/PATCH)
   * @param {Object} [queryParams] - Query parameters
   * @returns {Promise<any>} API response data
   */
  async request(method, path, data = null, queryParams = {}) {
    // Rate limiting
    await this._enforceRateLimit();

    // Build URL with query parameters
    const url = new URL(this.apiEndpoint + path);
    url.searchParams.append('apiKey', this.apiKey);

    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'cc-backlog/1.0'
      }
    };

    return new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;

      const req = protocol.request(url, options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            // Handle different status codes
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const jsonData = body ? JSON.parse(body) : null;
              resolve(jsonData);
            } else {
              const errorData = body ? JSON.parse(body) : {};
              const error = new Error(errorData.message || `HTTP ${res.statusCode}`);
              error.statusCode = res.statusCode;
              error.response = errorData;
              reject(error);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Request failed: ${err.message}`));
      });

      // Send request body if present
      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Enforce rate limiting between requests
   * @private
   */
  async _enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  // ========================================
  // Project APIs
  // ========================================

  /**
   * Get list of projects
   * @param {Object} [options]
   * @param {boolean} [options.archived] - Include archived projects
   * @param {boolean} [options.all] - All projects (admin only)
   * @returns {Promise<Array>} List of projects
   */
  async getProjectList(options = {}) {
    return this.request('GET', '/projects', null, options);
  }

  /**
   * Get project details
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Object>} Project details
   */
  async getProject(projectIdOrKey) {
    return this.request('GET', `/projects/${projectIdOrKey}`);
  }

  /**
   * Create new project
   * @param {Object} data - Project data
   * @returns {Promise<Object>} Created project
   */
  async addProject(data) {
    return this.request('POST', '/projects', data);
  }

  /**
   * Update project
   * @param {string|number} projectIdOrKey - Project ID or key
   * @param {Object} data - Updated project data
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(projectIdOrKey, data) {
    return this.request('PATCH', `/projects/${projectIdOrKey}`, data);
  }

  /**
   * Delete project
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProject(projectIdOrKey) {
    return this.request('DELETE', `/projects/${projectIdOrKey}`);
  }

  // ========================================
  // Issue APIs
  // ========================================

  /**
   * Get issue details
   * @param {string|number} issueIdOrKey - Issue ID or key
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(issueIdOrKey) {
    return this.request('GET', `/issues/${issueIdOrKey}`);
  }

  /**
   * Get list of issues with filters
   * @param {Object} [filters] - Query filters
   * @returns {Promise<Array>} List of issues
   */
  async getIssues(filters = {}) {
    return this.request('GET', '/issues', null, filters);
  }

  /**
   * Count issues matching filters
   * @param {Object} [filters] - Query filters
   * @returns {Promise<Object>} Count result
   */
  async countIssues(filters = {}) {
    return this.request('GET', '/issues/count', null, filters);
  }

  /**
   * Create new issue
   * @param {Object} data - Issue data
   * @returns {Promise<Object>} Created issue
   */
  async addIssue(data) {
    return this.request('POST', '/issues', data);
  }

  /**
   * Update issue
   * @param {string|number} issueIdOrKey - Issue ID or key
   * @param {Object} data - Updated issue data
   * @returns {Promise<Object>} Updated issue
   */
  async updateIssue(issueIdOrKey, data) {
    return this.request('PATCH', `/issues/${issueIdOrKey}`, data);
  }

  /**
   * Delete issue
   * @param {string|number} issueIdOrKey - Issue ID or key
   * @returns {Promise<Object>} Deletion result
   */
  async deleteIssue(issueIdOrKey) {
    return this.request('DELETE', `/issues/${issueIdOrKey}`);
  }

  // ========================================
  // Issue Comment APIs
  // ========================================

  /**
   * Get issue comments
   * @param {string|number} issueIdOrKey - Issue ID or key
   * @param {Object} [options] - Query options
   * @returns {Promise<Array>} List of comments
   */
  async getIssueComments(issueIdOrKey, options = {}) {
    return this.request('GET', `/issues/${issueIdOrKey}/comments`, null, options);
  }

  /**
   * Add comment to issue
   * @param {string|number} issueIdOrKey - Issue ID or key
   * @param {Object} data - Comment data
   * @returns {Promise<Object>} Created comment
   */
  async addIssueComment(issueIdOrKey, data) {
    return this.request('POST', `/issues/${issueIdOrKey}/comments`, data);
  }

  // ========================================
  // Priority APIs
  // ========================================

  /**
   * Get list of priorities
   * @returns {Promise<Array>} List of priorities
   */
  async getPriorities() {
    return this.request('GET', '/priorities');
  }

  // ========================================
  // Category APIs
  // ========================================

  /**
   * Get project categories
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Array>} List of categories
   */
  async getCategories(projectIdOrKey) {
    return this.request('GET', `/projects/${projectIdOrKey}/categories`);
  }

  // ========================================
  // Custom Field APIs
  // ========================================

  /**
   * Get project custom fields
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Array>} List of custom fields
   */
  async getCustomFields(projectIdOrKey) {
    return this.request('GET', `/projects/${projectIdOrKey}/customFields`);
  }

  // ========================================
  // Issue Type APIs
  // ========================================

  /**
   * Get project issue types
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Array>} List of issue types
   */
  async getIssueTypes(projectIdOrKey) {
    return this.request('GET', `/projects/${projectIdOrKey}/issueTypes`);
  }

  // ========================================
  // Resolution APIs
  // ========================================

  /**
   * Get list of resolutions
   * @returns {Promise<Array>} List of resolutions
   */
  async getResolutions() {
    return this.request('GET', '/resolutions');
  }

  // ========================================
  // Version/Milestone APIs
  // ========================================

  /**
   * Get project versions/milestones
   * @param {string|number} projectIdOrKey - Project ID or key
   * @returns {Promise<Array>} List of versions
   */
  async getVersionMilestoneList(projectIdOrKey) {
    return this.request('GET', `/projects/${projectIdOrKey}/versions`);
  }

  /**
   * Create version/milestone
   * @param {string|number} projectIdOrKey - Project ID or key
   * @param {Object} data - Version data
   * @returns {Promise<Object>} Created version
   */
  async addVersionMilestone(projectIdOrKey, data) {
    return this.request('POST', `/projects/${projectIdOrKey}/versions`, data);
  }

  /**
   * Update version/milestone
   * @param {string|number} projectIdOrKey - Project ID or key
   * @param {number} versionId - Version ID
   * @param {Object} data - Updated version data
   * @returns {Promise<Object>} Updated version
   */
  async updateVersionMilestone(projectIdOrKey, versionId, data) {
    return this.request('PATCH', `/projects/${projectIdOrKey}/versions/${versionId}`, data);
  }

  /**
   * Delete version/milestone
   * @param {string|number} projectIdOrKey - Project ID or key
   * @param {number} versionId - Version ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteVersion(projectIdOrKey, versionId) {
    return this.request('DELETE', `/projects/${projectIdOrKey}/versions/${versionId}`);
  }

  // ========================================
  // Notification APIs
  // ========================================

  /**
   * Get notifications
   * @param {Object} [options] - Query options
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications(options = {}) {
    return this.request('GET', '/notifications', null, options);
  }

  /**
   * Count notifications
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Count result
   */
  async countNotifications(options = {}) {
    return this.request('GET', '/notifications/count', null, options);
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  async markNotificationAsRead(notificationId) {
    return this.request('POST', `/notifications/${notificationId}/markAsRead`);
  }

  /**
   * Reset unread notification count
   * @returns {Promise<Object>} Reset result
   */
  async resetUnreadNotificationCount() {
    return this.request('POST', '/notifications/markAsRead');
  }

  // ========================================
  // User APIs
  // ========================================

  /**
   * Get current user information
   * @returns {Promise<Object>} User details
   */
  async getMyself() {
    return this.request('GET', '/users/myself');
  }

  /**
   * Get list of users
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    return this.request('GET', '/users');
  }

  // ========================================
  // Watching APIs
  // ========================================

  /**
   * Get watching list items
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Watching list
   */
  async getWatchingListItems(userId) {
    return this.request('GET', `/users/${userId}/watchings`);
  }

  /**
   * Get watching list count
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Count result
   */
  async getWatchingListCount(userId) {
    return this.request('GET', `/users/${userId}/watchings/count`);
  }
}

/**
 * Create Backlog API client from environment variables
 * @returns {BacklogAPIClient} Initialized client
 */
function createClient() {
  const spaceKey = process.env.BACKLOG_SPACE_KEY;
  const apiKey = process.env.BACKLOG_API_KEY;
  const apiEndpoint = process.env.BACKLOG_API_ENDPOINT;

  if (!spaceKey) {
    throw new Error('BACKLOG_SPACE_KEY environment variable is required');
  }

  if (!apiKey) {
    throw new Error('BACKLOG_API_KEY environment variable is required');
  }

  return new BacklogAPIClient({
    spaceKey,
    apiKey,
    apiEndpoint
  });
}

module.exports = {
  BacklogAPIClient,
  createClient
};
