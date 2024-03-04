exports.isBranchNameValid = (branchName) =>
  isBranchNameValid(branchName) || isBranchNameValidLegacy(branchName);

function isBranchNameValidLegacy(branchName) {
  return (
    (!!branchName.match(
      /^(core|feature|fix|hotfix|asset|rework|documentation|mobsuccessbot|dependabot)\/([a-z][a-z0-9._-]*)$/
    ) ||
      !!branchName.match(/^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/) ||
      !!branchName.match(/^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/) ||
      !!branchName.match(/^revert-[0-9]+-/) ||
      !!branchName.match(/^(rework)\/([A-Z][a-zA-Z0-9.-]*)$/)) &&
    !branchName.match(/---/) &&
    !branchName.match(/\/\//)
  );
}

function isBranchNameValid(branchName) {
  return (
    !!branchName.match(
      /^(feat|fix|chore|docs|refactor|test|revert|ci|perf|style|build|change|remove|poc|mobsuccessbot|dependabot)\/([a-z][a-z0-9._-]*)$/
    ) ||
    !!branchName.match(/^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/)
  );
}
