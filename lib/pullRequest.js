function isPullRequestTitleValid(pullRequestName) {
  return (
    !!pullRequestName.match(
      /^(hotfix|feat|fix|chore|docs|refactor|test|revert|build|ci|perf|style|change|remove|poc)(?:\(.+\))?!?:.+/
    ) || !!pullRequestName.match(/^revert .+/)
  );
}

module.exports = {
  isPullRequestTitleValid,
};
