const { isBranchNameValid } = require("./branch");

describe("branch", () => {
  test.each([
    "feat/foo",
    "fix/foo",
    "hotfix/foo",
    "refactor/foo",
    "docs/foo",
    "chore/foo--bar",
    "chore/foo--bar--z",
    "feat/branch-name_from_linear",
    "mobsuccessbot/foo",
    "mobsuccessbot/foo@foo",
    "mobsuccessbot/foo@foo/foo",
    "dependabot/foo",
    "dependabot/npm_and_yarn/axios-0.21.1",
    "dependabot/npm_and_yarn/axios-0.21.1",
  ])("Test branch %s should be valid", (branch) => {
    expect(isBranchNameValid(branch)).toBe(true);
  });
  // Some tests were commented out, see #92.
  test.each([
    "core/foo--bar",
    "core/foo--bar--z",
    "foo/foo-bar",
    "feature/foo",
    "hotfix/foo",
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
  ])("Test branch %s should be invalid", (branch) => {
    expect(isBranchNameValid(branch)).toBe(false);
  });
});
