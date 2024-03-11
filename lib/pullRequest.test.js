const { isPullRequestTitleValid } = require("./pullRequest");

describe("pull request", () => {
  test.each([
    "chore: remove base files",
    "fix(design-system): update color palette for accessibility compliance",
    "feat!: send an email to the customer when a product is shipped",
    "feat(api)!: send an email to the customer when a product is shipped",
  ])("Test pull request title %s should be valid", (title) => {
    expect(isPullRequestTitleValid(title)).toBe(true);
  });
  test.each([
    "Add feature",
    "Remove feature",
    "add feature",
    "chore remove base files",
    "chore(): remove base files",
    "add: add new project",
    "feat!(api): send an email to the customer when a product is shipped",
  ])("Test pull request title %s should be invalid", (title) => {
    expect(isPullRequestTitleValid(title)).toBe(false);
  });
});
