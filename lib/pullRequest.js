exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Create|Fix|Improve|Remove|Set|Update|Upgrade|Use|Rework|Ignore|Bump|Revert) [a-zA-Z@].*$/
    /* remember to edit the GitBook when changing this value:
       https://app.gitbook.com/@mobsuccess/s/mobsuccess/git-1/git-guidelines#pull-request-naming
     */
  );
