const { isPullRequestTitleValid } = require("./pullRequest");

describe("pul request", () => {
  test("recognize pull request branch names", () => {
    expect(isPullRequestTitleValid("Add feature")).toBe(true);
  });
  test("recognize invalid branch names", () => {
    expect(isPullRequestTitleValid("add feature")).toBe(false);
  });
});
