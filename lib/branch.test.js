const { isBranchNameValid } = require("./branch");

describe("branch", () => {
  test("recognize valid branch names", () => {
    expect(isBranchNameValid("feat/foo")).toBe(true);
    expect(isBranchNameValid("fix/foo")).toBe(true);
    expect(isBranchNameValid("refactor/foo")).toBe(true);
    expect(isBranchNameValid("docs/foo")).toBe(true);
    expect(isBranchNameValid("chore/foo--bar")).toBe(true);
    expect(isBranchNameValid("chore/foo--bar--z")).toBe(true);
    expect(isBranchNameValid("feat/branch-name_from_linear")).toBe(true);
    expect(isBranchNameValid("mobsuccessbot/foo")).toBe(true);
    expect(isBranchNameValid("mobsuccessbot/foo@foo")).toBe(true);
    expect(isBranchNameValid("mobsuccessbot/foo@foo/foo")).toBe(true);
    expect(isBranchNameValid("dependabot/foo")).toBe(true);
    expect(isBranchNameValid("dependabot/npm_and_yarn/axios-0.21.1")).toBe(
      true
    );
  });
  test("recognize invalid branch names", () => {
    expect(isBranchNameValid("core/foo--bar")).toBe(false);
    expect(isBranchNameValid("core/foo--bar--z")).toBe(false);
    expect(isBranchNameValid("foo/foo-bar")).toBe(false);
    expect(isBranchNameValid("feature/foo")).toBe(false);
    expect(isBranchNameValid("hotfix/foo")).toBe(false);
    expect(isBranchNameValid("asset/foo")).toBe(false);
    expect(isBranchNameValid("core/npm_and_yarn/axios-0.21.1")).toBe(false);
    expect(isBranchNameValid("core")).toBe(false);
    expect(isBranchNameValid("core/")).toBe(false);
    expect(isBranchNameValid("core/foo")).toBe(false);
    expect(isBranchNameValid("core/FOO")).toBe(false);
    expect(isBranchNameValid("foo/foo")).toBe(false);
    expect(isBranchNameValid("foo/foo/bar")).toBe(false);
    expect(isBranchNameValid("documentation/foo")).toBe(false);
    expect(isBranchNameValid("fix/DriveFooterBar")).toBe(false);
    expect(isBranchNameValid("refactor/DriveFooterBar")).toBe(false);
    expect(isBranchNameValid("rework/fooDriveFooterBar")).toBe(false);
    expect(isBranchNameValid("core//foo")).toBe(false);
  });
});
