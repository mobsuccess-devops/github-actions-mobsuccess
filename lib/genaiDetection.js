/**
 * GenAI Detection Logic
 *
 * Detects AI assistance in PRs by checking:
 * - Existing labels
 * - PR author (bot detection)
 * - PR body/description
 * - Commit messages and co-authors
 * - PR comments
 */

const {
  BOT_PATTERNS,
  COMMIT_PATTERNS,
  PR_BODY_PATTERNS,
  COMMENT_PATTERNS,
  AI_LABELS,
  GENAI_LABEL,
} = require("./genaiPatterns");

/**
 * Check if a string matches any pattern in an array
 * @param {string} text - Text to check
 * @param {RegExp[]} patterns - Array of regex patterns
 * @returns {RegExp|null} - The matching pattern or null
 */
function matchesAnyPattern(text, patterns) {
  if (!text) return null;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Check if author is a bot
 * @param {string} author - Author login or name
 * @returns {RegExp|null} - The matching pattern or null
 */
function isBot(author) {
  return matchesAnyPattern(author, BOT_PATTERNS);
}

/**
 * Check if any existing label indicates AI assistance
 * @param {Array<{name: string}>} labels - Array of label objects
 * @returns {string|null} - The matching label or null
 */
function hasAILabel(labels) {
  if (!labels || !Array.isArray(labels)) return null;
  for (const label of labels) {
    const labelName = (label.name || label).toLowerCase();
    if (AI_LABELS.includes(labelName)) {
      return labelName;
    }
  }
  return null;
}

/**
 * Check if the genai-assisted label already exists
 * @param {Array<{name: string}>} labels - Array of label objects
 * @returns {boolean}
 */
function hasGenAILabel(labels) {
  if (!labels || !Array.isArray(labels)) return false;
  return labels.some(
    (label) => (label.name || label).toLowerCase() === GENAI_LABEL
  );
}

/**
 * Detect GenAI assistance in a PR
 * @param {Object} octokit - GitHub API client
 * @param {Object} params - Detection parameters
 * @param {string} params.owner - Repository owner
 * @param {string} params.repo - Repository name
 * @param {number} params.pullNumber - PR number
 * @param {Object} params.pullRequest - PR object from GitHub context
 * @returns {Promise<{detected: boolean, reason: string|null}>}
 */
async function detectGenAI(octokit, { owner, repo, pullNumber, pullRequest }) {
  // 1. Check if already labeled with genai-assisted
  if (hasGenAILabel(pullRequest.labels)) {
    console.log("PR already has genai-assisted label, skipping detection");
    return { detected: false, reason: null, alreadyLabeled: true };
  }

  // 2. Check PR author (bot detection)
  const prAuthor = pullRequest.user?.login || pullRequest.user?.name;
  const botMatch = isBot(prAuthor);
  if (botMatch) {
    return {
      detected: true,
      reason: `PR author "${prAuthor}" matches bot pattern: ${botMatch}`,
    };
  }

  // 3. Check PR body/description
  const bodyMatch = matchesAnyPattern(pullRequest.body, PR_BODY_PATTERNS);
  if (bodyMatch) {
    return {
      detected: true,
      reason: `PR body matches GenAI pattern: ${bodyMatch}`,
    };
  }

  // 4. Check existing labels for AI-related labels
  const aiLabel = hasAILabel(pullRequest.labels);
  if (aiLabel) {
    return {
      detected: true,
      reason: `PR has AI-related label: "${aiLabel}"`,
    };
  }

  // 5. Fetch and check commits
  try {
    const commits = await octokit.paginate(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      { owner, repo, pull_number: pullNumber }
    );

    for (const commit of commits) {
      // Check commit message
      const message = commit.commit?.message || "";
      const messageMatch = matchesAnyPattern(message, COMMIT_PATTERNS);
      if (messageMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(0, 7)}" message matches GenAI pattern: ${messageMatch}`,
        };
      }

      // Check commit author
      const commitAuthor =
        commit.author?.login || commit.commit?.author?.name || "";
      const commitAuthorMatch = isBot(commitAuthor);
      if (commitAuthorMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(0, 7)}" author "${commitAuthor}" matches bot pattern: ${commitAuthorMatch}`,
        };
      }

      // Check committer
      const committer =
        commit.committer?.login || commit.commit?.committer?.name || "";
      const committerMatch = isBot(committer);
      if (committerMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(0, 7)}" committer "${committer}" matches bot pattern: ${committerMatch}`,
        };
      }
    }
  } catch (error) {
    console.log(`Warning: Could not fetch commits: ${error.message}`);
  }

  // 6. Fetch and check PR comments
  try {
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner, repo, issue_number: pullNumber }
    );

    for (const comment of comments) {
      // Check comment author
      const commentAuthor = comment.user?.login || "";
      const authorMatch = isBot(commentAuthor);
      if (authorMatch) {
        return {
          detected: true,
          reason: `Comment author "${commentAuthor}" matches bot pattern: ${authorMatch}`,
        };
      }

      // Check comment body
      const commentMatch = matchesAnyPattern(comment.body, COMMENT_PATTERNS);
      if (commentMatch) {
        return {
          detected: true,
          reason: `Comment by "${commentAuthor}" matches GenAI pattern: ${commentMatch}`,
        };
      }
    }
  } catch (error) {
    console.log(`Warning: Could not fetch comments: ${error.message}`);
  }

  // No GenAI detected
  return { detected: false, reason: null };
}

module.exports = {
  detectGenAI,
  matchesAnyPattern,
  isBot,
  hasAILabel,
  hasGenAILabel,
  GENAI_LABEL,
};
