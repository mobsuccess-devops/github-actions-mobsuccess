exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Create|Fix|Improve|Remove|Set|Update|Upgrade|Use) [a-zA-Z].*$/
  );
