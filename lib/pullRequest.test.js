const { isPullRequestTitleValid } = require("./pullRequest");

describe("pull request", () => {
  test("recognize pull request branch names", () => {
    expect(isPullRequestTitleValid("Add feature")).toBe(true);
    expect(isPullRequestTitleValid("chore: remove base files")).toBe(true);
    expect(
      isPullRequestTitleValid(
        "fix(design-system): update color palette for accessibility compliance"
      )
    ).toBe(true);
  });
  test("recognize invalid branch names", () => {
    expect(isPullRequestTitleValid("add feature")).toBe(false);
    expect(isPullRequestTitleValid("chore remove base files")).toBe(false);
    expect(isPullRequestTitleValid("chore(): remove base files")).toBe(false);
    expect(isPullRequestTitleValid("add: add new project")).toBe(false);
  });
});
