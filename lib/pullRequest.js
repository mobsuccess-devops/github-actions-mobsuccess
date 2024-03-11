function isPullRequestTitleValid(pullRequestName) {
  return !!pullRequestName.match(
    /^(feat|fix|chore|docs|refactor|test|revert|build|ci|perf|style|change|remove|poc)(?:\(.+\))?!?:.+/
  );
}

module.exports = {
  isPullRequestTitleValid,
};
