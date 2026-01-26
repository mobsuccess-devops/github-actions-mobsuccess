const {
  matchesAnyPattern,
  isAutomationBot,
  isGenAIBot,
  hasAILabel,
  hasGenAILabel,
  hasAIBranchPrefix,
  detectGenAI,
} = require("./genaiDetection");

const {
  COMMIT_PATTERNS,
  PR_BODY_PATTERNS,
  COMMENT_PATTERNS,
} = require("./genaiPatterns");

describe("genaiDetection", () => {
  describe("isGenAIBot", () => {
    test.each([
      "copilot[bot]",
      "claude[bot]",
      "anthropic[bot]",
      "openai[bot]",
      "chatgpt[bot]",
      "cursor[bot]",
      "codeium[bot]",
      "tabnine[bot]",
      "cody[bot]",
      "devin[bot]",
      "aider[bot]",
    ])("should detect GenAI bot: %s", (author) => {
      expect(isGenAIBot(author)).not.toBeNull();
    });

    test.each([
      // Automation bots - should NOT trigger genai-assisted
      "github-actions[bot]",
      "dependabot[bot]",
      "renovate[bot]",
      "semantic-release-bot",
      "snyk-bot",
      "netlify[bot]",
      "vercel[bot]",
      "mergify[bot]",
      // Regular users
      "johndoe",
      "alice",
      "dev-team",
      "robotics-fan",
      "bottleneck",
      "about",
      "my-custom-bot",
      "bot-runner",
    ])("should NOT detect as GenAI bot: %s", (author) => {
      expect(isGenAIBot(author)).toBeNull();
    });
  });

  describe("isAutomationBot", () => {
    test.each([
      "github-actions[bot]",
      "dependabot[bot]",
      "renovate[bot]",
      "semantic-release-bot",
      "snyk-bot",
      "netlify[bot]",
      "vercel[bot]",
      "mergify[bot]",
    ])("should detect automation bot: %s", (author) => {
      expect(isAutomationBot(author)).not.toBeNull();
    });

    test.each(["copilot[bot]", "johndoe", "alice"])(
      "should NOT detect as automation bot: %s",
      (author) => {
        expect(isAutomationBot(author)).toBeNull();
      }
    );
  });

  describe("hasAILabel", () => {
    test.each([
      [{ name: "ai-assisted" }],
      [{ name: "genai" }],
      [{ name: "claude" }],
      [{ name: "copilot" }],
      [{ name: "chatgpt" }],
      [{ name: "AI-ASSISTED" }], // case insensitive
    ])("should detect AI label: %s", (label) => {
      expect(hasAILabel([label])).not.toBeNull();
    });

    test.each([
      [{ name: "bug" }],
      [{ name: "enhancement" }],
      [{ name: "feature" }],
      [{ name: "documentation" }],
    ])("should NOT detect as AI label: %s", (label) => {
      expect(hasAILabel([label])).toBeNull();
    });
  });

  describe("hasGenAILabel", () => {
    test("should return true when genai-assisted label exists", () => {
      expect(hasGenAILabel([{ name: "genai-assisted" }])).toBe(true);
      expect(hasGenAILabel([{ name: "GENAI-ASSISTED" }])).toBe(true);
    });

    test("should return false when genai-assisted label does not exist", () => {
      expect(hasGenAILabel([{ name: "bug" }])).toBe(false);
      expect(hasGenAILabel([{ name: "ai-assisted" }])).toBe(false);
      expect(hasGenAILabel([])).toBe(false);
      expect(hasGenAILabel(null)).toBe(false);
    });
  });

  describe("COMMIT_PATTERNS", () => {
    test.each([
      "feat: add login\n\n🤖 Generated with [Claude Code](https://claude.ai/code)",
      "fix: bug fix\n\nCo-Authored-By: Claude <noreply@anthropic.com>",
      "chore: update deps\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>",
      // Flexible co-authored-by formats
      "fix: bug\n\nco-authored-by: Claude <noreply@anthropic.com>",
      "fix: bug\n\ncoauthoredby: Claude",
      "fix: bug\n\nco authored by: Claude",
      "fix: bug\n\nCo-Authored-By: Copilot",
      "fix: bug\n\ncoauthoredby: ChatGPT",
      "fix: bug\n\nco-authored-by: noreply@anthropic.com",
      "[AI] feat: new feature",
      "[Copilot] fix: typo",
      "[Claude] refactor: cleanup",
      "[ChatGPT] docs: update readme",
      "[Aider] fix: bug",
      "Generated with Claude Code",
      "feat: something 🤖",
      "aider: fix typo in main.js",
    ])("should match commit message: %s", (message) => {
      expect(matchesAnyPattern(message, COMMIT_PATTERNS)).not.toBeNull();
    });

    test.each([
      "feat: add login feature",
      "fix: resolve bug in authentication",
      "chore: update dependencies",
      "docs: improve documentation",
      "refactor: cleanup code",
      "Co-Authored-By: John Doe <john@example.com>",
    ])("should NOT match commit message: %s", (message) => {
      expect(matchesAnyPattern(message, COMMIT_PATTERNS)).toBeNull();
    });
  });

  describe("PR_BODY_PATTERNS", () => {
    test.each([
      "This PR was generated with Claude",
      "Code written by ChatGPT",
      "AI-assisted implementation",
      "AI-generated code",
      "Created using Copilot",
      "Implemented with help from Claude",
      "Pair programming with Cursor",
      "Claude helped write this",
      "Copilot assisted with this feature",
      "Generated with [Claude Code](https://claude.ai/code)",
      "Using Aider for this fix",
      "LLM-assisted refactoring",
    ])("should match PR body: %s", (body) => {
      expect(matchesAnyPattern(body, PR_BODY_PATTERNS)).not.toBeNull();
    });

    test.each([
      "This PR adds a new feature",
      "Fixed the login bug",
      "Updated documentation",
      "Refactored the auth module",
      "Added tests for the API",
    ])("should NOT match PR body: %s", (body) => {
      expect(matchesAnyPattern(body, PR_BODY_PATTERNS)).toBeNull();
    });
  });

  describe("COMMENT_PATTERNS", () => {
    test.each([
      "I used Claude to help with this",
      "ChatGPT suggested this approach",
      "Copilot generated this code",
      "This PR was generated by AI",
      "Automated by GitHub Actions",
      "Pair programming with Claude",
      "AI wrote this function",
    ])("should match comment: %s", (comment) => {
      expect(matchesAnyPattern(comment, COMMENT_PATTERNS)).not.toBeNull();
    });

    test.each([
      "Looks good to me!",
      "Please fix the typo on line 42",
      "Can you add more tests?",
      "Nice work on this feature",
    ])("should NOT match comment: %s", (comment) => {
      expect(matchesAnyPattern(comment, COMMENT_PATTERNS)).toBeNull();
    });
  });

  describe("hasAIBranchPrefix", () => {
    test.each([
      "cursor/add-feature",
      "claude/fix-bug",
      "ai/new-component",
      "copilot/refactor",
      "aider/update-deps",
      "cody/docs",
      "chatgpt/experiment",
      "genai/test",
      "windsurf/style",
      "devin/automation",
      "CURSOR/uppercase", // case insensitive
    ])("should detect AI branch prefix: %s", (branch) => {
      expect(hasAIBranchPrefix(branch)).not.toBeNull();
    });

    test.each([
      "feat/add-feature",
      "fix/bug-fix",
      "chore/update-deps",
      "docs/readme",
      "refactor/cleanup",
      "test/add-tests",
      "hotfix/urgent",
      "feature/cursor-support", // cursor not at start
      "my-cursor-branch",
    ])("should NOT detect AI branch prefix: %s", (branch) => {
      expect(hasAIBranchPrefix(branch)).toBeNull();
    });
  });

  describe("detectGenAI", () => {
    const mockOctokit = {
      paginate: jest.fn(),
    };

    const basePullRequest = {
      user: { login: "johndoe" },
      head: { ref: "feat/my-feature" },
      body: "This is a normal PR",
      labels: [],
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockOctokit.paginate.mockResolvedValue([]);
    });

    test("should skip detection if already labeled with genai-assisted", async () => {
      const pullRequest = {
        ...basePullRequest,
        labels: [{ name: "genai-assisted" }],
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(false);
      expect(result.alreadyLabeled).toBe(true);
    });

    test("should detect GenAI bot author", async () => {
      const pullRequest = {
        ...basePullRequest,
        user: { login: "copilot[bot]" },
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("GenAI bot pattern");
    });

    test("should NOT detect automation bot author (dependabot)", async () => {
      const pullRequest = {
        ...basePullRequest,
        user: { login: "dependabot[bot]" },
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(false);
    });

    test("should detect AI branch prefix", async () => {
      const pullRequest = {
        ...basePullRequest,
        head: { ref: "claude/fix-bug" },
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("AI-related prefix");
    });

    test("should detect GenAI pattern in PR body", async () => {
      const pullRequest = {
        ...basePullRequest,
        body: "This PR was generated with Claude",
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("PR body matches GenAI pattern");
    });

    test("should detect existing AI label", async () => {
      const pullRequest = {
        ...basePullRequest,
        labels: [{ name: "copilot" }],
      };

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("AI-related label");
    });

    test("should detect GenAI pattern in commit message", async () => {
      mockOctokit.paginate.mockImplementation((endpoint) => {
        if (endpoint.includes("commits")) {
          return Promise.resolve([
            {
              sha: "abc1234567890",
              commit: {
                message:
                  "feat: add feature\n\n🤖 Generated with [Claude Code](https://claude.ai/code)",
                author: { name: "johndoe", date: "2024-01-01T10:00:00Z" },
              },
              author: { login: "johndoe" },
              committer: { login: "johndoe" },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest: basePullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("Commit");
      expect(result.reason).toContain("GenAI pattern");
    });

    test("should return false when no GenAI detected", async () => {
      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest: basePullRequest,
      });

      expect(result.detected).toBe(false);
      expect(result.reason).toBeNull();
    });

    test("should detect GenAI bot in commit author", async () => {
      mockOctokit.paginate.mockImplementation((endpoint) => {
        if (endpoint.includes("commits")) {
          return Promise.resolve([
            {
              sha: "abc1234567890",
              commit: {
                message: "chore: update deps",
                author: { name: "copilot[bot]", date: "2024-01-01T10:00:00Z" },
              },
              author: { login: "copilot[bot]" },
              committer: { login: "copilot[bot]" },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest: basePullRequest,
      });

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("GenAI bot pattern");
    });

    test("should NOT detect automation bot in commit author (renovate)", async () => {
      mockOctokit.paginate.mockImplementation((endpoint) => {
        if (endpoint.includes("commits")) {
          return Promise.resolve([
            {
              sha: "abc1234567890",
              commit: {
                message: "chore: update deps",
                author: { name: "renovate[bot]", date: "2024-01-01T10:00:00Z" },
              },
              author: { login: "renovate[bot]" },
              committer: { login: "renovate[bot]" },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest: basePullRequest,
      });

      expect(result.detected).toBe(false);
    });

    test("should detect GenAI bot in comment author", async () => {
      mockOctokit.paginate.mockImplementation((endpoint) => {
        if (endpoint.includes("comments")) {
          return Promise.resolve([
            {
              user: { login: "copilot[bot]" },
              body: "Suggested changes",
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await detectGenAI(
        mockOctokit,
        {
          owner: "test",
          repo: "repo",
          pullNumber: 1,
          pullRequest: basePullRequest,
        },
        { detectCommentPatterns: true }
      );

      expect(result.detected).toBe(true);
      expect(result.reason).toContain("Comment author");
      expect(result.reason).toContain("GenAI bot pattern");
    });

    test("should NOT detect automation bot in comment author (github-actions)", async () => {
      mockOctokit.paginate.mockImplementation((endpoint) => {
        if (endpoint.includes("comments")) {
          return Promise.resolve([
            {
              user: { login: "github-actions[bot]" },
              body: "Deployment successful",
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await detectGenAI(mockOctokit, {
        owner: "test",
        repo: "repo",
        pullNumber: 1,
        pullRequest: basePullRequest,
      });

      expect(result.detected).toBe(false);
    });
  });
});
