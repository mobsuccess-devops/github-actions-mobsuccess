const { isBranchNameValid } = require("./branch");

describe("branch", () => {
  test("recognize valid branch names", () => {
    expect(isBranchNameValid("core/foo")).toBe(true);
    expect(isBranchNameValid("feature/foo")).toBe(true);
    expect(isBranchNameValid("fix/foo")).toBe(true);
    expect(isBranchNameValid("hotfix/foo")).toBe(true);
    expect(isBranchNameValid("asset/foo")).toBe(true);
    expect(isBranchNameValid("rework/foo")).toBe(true);
    expect(isBranchNameValid("rework/DriveFooterBar")).toBe(true);
    expect(isBranchNameValid("dependabot/foo")).toBe(true);
    expect(isBranchNameValid("dependabot/npm_and_yarn/axios-0.21.1")).toBe(
      true
    );
    expect(isBranchNameValid("mobsuccessbot/foo")).toBe(true);
    expect(isBranchNameValid("foo/foo-bar")).toBe(false);
    expect(isBranchNameValid("core/foo--bar")).toBe(true);
    expect(isBranchNameValid("core/foo--bar--z")).toBe(true);
  });
  test("recognize invalid branch names", () => {
    expect(isBranchNameValid("core/npm_and_yarn/axios-0.21.1")).toBe(false);
    expect(isBranchNameValid("core")).toBe(false);
    expect(isBranchNameValid("core/")).toBe(false);
    expect(isBranchNameValid("core/FOO")).toBe(false);
    expect(isBranchNameValid("foo/foo")).toBe(false);
    expect(isBranchNameValid("foo/foo/bar")).toBe(false);
    expect(isBranchNameValid("fix/DriveFooterBar")).toBe(false);
    expect(isBranchNameValid("rework/fooDriveFooterBar")).toBe(false);
    expect(isBranchNameValid("core//foo")).toBe(false);
  });
});
