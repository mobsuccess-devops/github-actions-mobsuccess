function isBranchNameValid(branchName) {
  return (
    // The following are the older branch prefixes, that are still valid, with
    // discussions pending on the ADR #9 with a PR #35 still active at the time
    // of writing, to maybe deprecate them. In the meantime we still have to
    // allow branches using these prefixes, as no active ADR disallows their
    // use.
    !!branchName.match(
      /^(core|feature|fix|hotfix|asset|rework|documentation)\/([a-z][a-z0-9._-]*)$/
    ) ||
    !!branchName.match(
      /^(feat|fix|chore|docs|refactor|test|revert|ci|perf|style|build|change|remove|poc|mobsuccessbot|dependabot)\/([a-z][a-z0-9._-]*)$/
    ) ||
    !!branchName.match(/^(mobsuccessbot)\/([a-z0-9_\-@./_-]*)$/) ||
    !!branchName.match(/^(dependabot)\/([a-z][a-zA-Z0-9./_-]*)$/)
  );
}

module.exports = {
  isBranchNameValid,
};
