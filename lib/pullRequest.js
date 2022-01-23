exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Fix|Improve|Remove|Set|Update|Rework|Ignore|Bump) [a-zA-Z@].*$/
    /* remember to edit the GitBook when changing this value:
       https://mobsuccess.notion.site/Git-Guidelines-41996ef576cb4f29b7737772b74289c5
     */
  ) || !!pullRequestName.match(/^Revert ".*"$/);
