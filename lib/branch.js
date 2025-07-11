function isBranchNameValid(branchName) {
  return (
    !!branchName.match(
      /^(hotfix|feat|fix|chore|docs|refactor|test|revert|ci|perf|style|build|change|remove|poc|mobsuccessbot|dependabot)\/([a-z][a-z0-9._-]*)$/
    ) ||
    !!branchName.match(/^revert-([0-9]+)-([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/) ||
    !!branchName.match(/^(renovate)\/([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(copilot)\/([a-z0-9_\-@./_-]*)$/)
  );
}

module.exports = {
  isBranchNameValid,
};
