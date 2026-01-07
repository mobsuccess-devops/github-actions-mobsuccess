const {
  GENAI_BOT_PATTERNS,
  AUTOMATION_BOT_PATTERNS,
  COMMIT_PATTERNS,
  PR_BODY_PATTERNS,
  COMMENT_PATTERNS,
  AI_LABELS,
  GENAI_LABEL,
  GENAI_LABEL_COLOR,
  GENAI_LABEL_DESCRIPTION,
  AI_BRANCH_PREFIXES,
} = require("./genaiPatterns");

function matchesAnyPattern(text, patterns) {
  if (!text) return null;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return pattern;
    }
  }
  return null;
}

function isAutomationBot(author) {
  return matchesAnyPattern(author, AUTOMATION_BOT_PATTERNS);
}

function isGenAIBot(author) {
  // Exclude automation bots (dependabot, renovate, etc.) from GenAI detection
  if (isAutomationBot(author)) {
    return null;
  }
  return matchesAnyPattern(author, GENAI_BOT_PATTERNS);
}

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

function hasGenAILabel(labels) {
  if (!labels || !Array.isArray(labels)) return false;
  return labels.some(
    (label) => (label.name || label).toLowerCase() === GENAI_LABEL
  );
}

function hasAIBranchPrefix(branchName) {
  return matchesAnyPattern(branchName, AI_BRANCH_PREFIXES);
}

function hasRapidCommits(commits) {
  if (!commits || commits.length < 3) {
    return { detected: false, details: null };
  }

  const timestamps = commits
    .map((c) => ({
      sha: c.sha,
      time: new Date(
        c.commit?.author?.date || c.commit?.committer?.date
      ).getTime(),
    }))
    .filter((t) => !isNaN(t.time))
    .sort((a, b) => a.time - b.time);

  if (timestamps.length < 3) {
    return { detected: false, details: null };
  }

  let rapidPairs = 0;
  const rapidCommits = [];

  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i].time - timestamps[i - 1].time;
    if (diff < 30000 && diff >= 0) {
      rapidPairs++;
      if (!rapidCommits.includes(timestamps[i - 1].sha.slice(0, 7))) {
        rapidCommits.push(timestamps[i - 1].sha.slice(0, 7));
      }
      rapidCommits.push(timestamps[i].sha.slice(0, 7));
    }
  }

  if (rapidPairs >= 2) {
    const uniqueRapidCommits = [...new Set(rapidCommits)];
    return {
      detected: true,
      details: `${
        uniqueRapidCommits.length
      } commits within 30 seconds: ${uniqueRapidCommits.join(", ")}`,
    };
  }

  return { detected: false, details: null };
}

async function detectGenAI(octokit, { owner, repo, pullNumber, pullRequest }) {
  if (hasGenAILabel(pullRequest.labels)) {
    console.log("PR already has genai-assisted label, skipping detection");
    return { detected: false, reason: null, alreadyLabeled: true };
  }

  const prAuthor = pullRequest.user?.login || pullRequest.user?.name;
  const botMatch = isGenAIBot(prAuthor);
  if (botMatch) {
    return {
      detected: true,
      reason: `PR author "${prAuthor}" matches GenAI bot pattern: ${botMatch}`,
    };
  }

  const branchName = pullRequest.head?.ref || "";
  const branchMatch = hasAIBranchPrefix(branchName);
  if (branchMatch) {
    return {
      detected: true,
      reason: `Branch "${branchName}" has AI-related prefix: ${branchMatch}`,
    };
  }

  const bodyMatch = matchesAnyPattern(pullRequest.body, PR_BODY_PATTERNS);
  if (bodyMatch) {
    return {
      detected: true,
      reason: `PR body matches GenAI pattern: ${bodyMatch}`,
    };
  }

  const aiLabel = hasAILabel(pullRequest.labels);
  if (aiLabel) {
    return {
      detected: true,
      reason: `PR has AI-related label: "${aiLabel}"`,
    };
  }

  let commits = [];
  try {
    commits = await octokit.paginate(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      { owner, repo, pull_number: pullNumber }
    );

    for (const commit of commits) {
      const message = commit.commit?.message || "";
      const messageMatch = matchesAnyPattern(message, COMMIT_PATTERNS);
      if (messageMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(
            0,
            7
          )}" message matches GenAI pattern: ${messageMatch}`,
        };
      }

      const commitAuthor =
        commit.author?.login || commit.commit?.author?.name || "";
      const commitAuthorMatch = isGenAIBot(commitAuthor);
      if (commitAuthorMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(
            0,
            7
          )}" author "${commitAuthor}" matches GenAI bot pattern: ${commitAuthorMatch}`,
        };
      }

      const committer =
        commit.committer?.login || commit.commit?.committer?.name || "";
      const committerMatch = isGenAIBot(committer);
      if (committerMatch) {
        return {
          detected: true,
          reason: `Commit "${commit.sha.slice(
            0,
            7
          )}" committer "${committer}" matches GenAI bot pattern: ${committerMatch}`,
        };
      }
    }

    const rapidResult = hasRapidCommits(commits);
    if (rapidResult.detected) {
      return {
        detected: true,
        reason: `Rapid commit timing detected (AI agent behavior): ${rapidResult.details}`,
      };
    }
  } catch (error) {
    console.log(`Warning: Could not fetch commits: ${error.message}`);
  }

  try {
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner, repo, issue_number: pullNumber }
    );

    for (const comment of comments) {
      const commentAuthor = comment.user?.login || "";
      const authorMatch = isGenAIBot(commentAuthor);
      if (authorMatch) {
        return {
          detected: true,
          reason: `Comment author "${commentAuthor}" matches GenAI bot pattern: ${authorMatch}`,
        };
      }

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

  return { detected: false, reason: null };
}

module.exports = {
  detectGenAI,
  matchesAnyPattern,
  isAutomationBot,
  isGenAIBot,
  hasAILabel,
  hasGenAILabel,
  hasAIBranchPrefix,
  hasRapidCommits,
  GENAI_LABEL,
  GENAI_LABEL_COLOR,
  GENAI_LABEL_DESCRIPTION,
};
