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
    expect(
      isPullRequestTitleValid(
        "feat!: send an email to the customer when a product is shipped"
      )
    ).toBe(true);
    expect(
      isPullRequestTitleValid(
        "feat(api)!: send an email to the customer when a product is shipped"
      )
    ).toBe(true);
  });
  test("recognize invalid branch names", () => {
    expect(isPullRequestTitleValid("add feature")).toBe(false);
    expect(isPullRequestTitleValid("chore remove base files")).toBe(false);
    expect(isPullRequestTitleValid("chore(): remove base files")).toBe(false);
    expect(isPullRequestTitleValid("add: add new project")).toBe(false);
    expect(
      isPullRequestTitleValid(
        "feat!(api): send an email to the customer when a product is shipped"
      )
    ).toBe(false);
  });
});
