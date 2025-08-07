function isBranchNameValid(branchName) {
  return (
    /^(hotfix|feat|fix|chore|docs|refactor|test|revert|ci|perf|style|build|change|remove|poc|mobsuccessbot|dependabot)\/([a-z][a-z0-9._-]*)$/.test(
      branchName
    ) ||
    /^revert-([0-9]+)-([a-z0-9_\-@./_-]*)$/.test(branchName) ||
    /^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/.test(branchName) ||
    /^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/.test(branchName) ||
    /^(renovate)\/([a-z0-9_\-@./_-]*)$/.test(branchName) ||
    /^(copilot)\/([a-z0-9_\-@./_-]*)$/.test(branchName) ||
    /^crowdin\/update-translations$/.test(branchName)
  );
}

module.exports = {
  isBranchNameValid,
};
