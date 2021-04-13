exports.isBranchNameValid = (branchName) =>
  (!!branchName.match(
    /^(core|feature|fix|hotfix|asset|rework|documentation|dependabot)\/([a-z][a-z0-9.-]*)$/
  ) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-z0-9./_-]*)$/)) &&
  !branchName.match(/---/) &&
  !branchName.match(/\/\//);
