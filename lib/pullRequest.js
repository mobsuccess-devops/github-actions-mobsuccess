exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Create|Fix|Improve|Remove|Set|Update|Upgrade|Use|Rework) [a-zA-Z].*$/
  );
