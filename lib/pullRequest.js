exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Fix|Improve|Remove|Set|Update|Rework|Ignore|Bump) [a-zA-Z@].*$/
    /* remember to edit the GitBook when changing this value:
       https://app.gitbook.com/@mobsuccess/s/mobsuccess/git-1/git-guidelines#pull-request-naming
     */
  ) || !!pullRequestName.match(/^Revert ".*"$/);
