const { isBranchNameValid } = require("./branch");

describe("branch", () => {
  test.each([
    "feat/foo",
    "fix/foo",
    "hotfix/foo",
    "refactor/foo",
    "docs/foo",
    "revert-425-change/brevo-emailing",
    "chore/foo--bar",
    "chore/foo--bar--z",
    "feat/branch-name_from_linear",
    "mobsuccessbot/foo",
    "mobsuccessbot/foo@foo",
    "mobsuccessbot/foo@foo/foo",
    "dependabot/foo",
    "dependabot/npm_and_yarn/axios-0.21.1",
    "dependabot/npm_and_yarn/axios-0.21.1",
    "renovate/configure",
    "renovate/tanstack-table-monorepo",
    "renovate/mobsuccess-devops-dlpo-react-client-1.x",
  ])("Test branch %s should be valid", (branch) => {
    expect(isBranchNameValid(branch)).toBe(true);
  });
  // Some tests were commented out, see #92.
  test.each([
    "core/foo--bar",
    "core/foo--bar--z",
    "foo/foo-bar",
    "feature/foo",
    "core/foo",
    "asset/foo",
    "documentation/foo",
    "chore",
    "chore/",
    "chore/FOO",
    "foo/foo",
    "foo/foo/bar",
    "fix/DriveFooterBar",
    "refactor/DriveFooterBar",
    "rework/fooDriveFooterBar",
    "chore//foo",
    "revert-change/brevo-emailing",
  ])("Test branch %s should be invalid", (branch) => {
    expect(isBranchNameValid(branch)).toBe(false);
  });
});
