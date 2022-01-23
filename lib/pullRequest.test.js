import React from "react";

const { isPullRequestTitleValid } = require("./pullRequest");

test("recognize pull request branch names", () => {
  expect(isPullRequestTitleValid("Add feature")).toBe(true);
});

test("recognize invalid branch names", () => {
  expect(isPullRequestTitleValid("add feature")).toBe(false);
});
