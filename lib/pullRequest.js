exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Fix|Improve|Remove|Update|Rework|Ignore|Bump) [a-zA-Z@].*$/
    /* remember to edit the Notion when changing this value:
       https://www.notion.so/mobsuccess/Git-Guidelines-41996ef576cb4f29b7737772b74289c5
     */
  ) || !!pullRequestName.match(/^Revert ".*"$/);
