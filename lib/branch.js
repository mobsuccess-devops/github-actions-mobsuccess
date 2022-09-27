exports.isBranchNameValid = (branchName) =>
  (!!branchName.match(
    /^(core|feature|fix|hotfix|asset|rework|documentation|mobsuccessbot|dependabot)\/([a-z][a-z0-9.-]*)$/
  ) ||
    !!branchName.match(/^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/) ||
    !!branchName.match(/^revert-[0-9]+-/) ||
    !!branchName.match(/^(rework)\/([A-Z][a-zA-Z0-9.-]*)$/)) &&
  !branchName.match(/---/) &&
  !branchName.match(/\/\//);
