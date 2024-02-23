exports.isPullRequestTitleValid = (pullRequestName) =>
  isPullRequestTitleValid(pullRequestName) ||
  isPullRequestTitleValidLegacy(pullRequestName);

function isPullRequestTitleValidLegacy(pullRequestName) {
  return (
    !!pullRequestName.match(
      /^(Add|Clean|Fix|Improve|Remove|Update|Rework|Ignore|Bump|Switch|Migrate) .+$/
      /* remember to edit the Notion when changing this value:
         https://www.notion.so/mobsuccess/Git-Guidelines-41996ef576cb4f29b7737772b74289c5
       */
    ) || !!pullRequestName.match(/^Revert ".*"$/)
  );
}

// commit convention: prefix([optional scope]): description
function isPullRequestTitleValid(pullRequestName) {
  return !!pullRequestName.match(
    /^(feat|fix|chore|docs|refactor|change|remove|test|revert|poc)(?:\(.+\))?:.+/
  );
}
