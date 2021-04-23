exports.isBranchNameValid = (branchName) =>
  (!!branchName.match(
    /^(core|feature|fix|hotfix|asset|rework|documentation|mobsuccessbot|dependabot)\/([a-z][a-z0-9.-]*)$/
  ) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-z0-9./_-]*)$/) ||
    !!branchName.match(/^(rework)\/([A-Z][a-zA-Z0-9.-]*)$/)) &&
  !branchName.match(/---/) &&
  !branchName.match(/\/\//);
