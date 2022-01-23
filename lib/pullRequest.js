exports.isPullRequestTitleValid = (pullRequestName) =>
  !!pullRequestName.match(
    /^(Add|Clean|Fix|Improve|Remove|Set|Update|Rework|Ignore|Bump) [a-zA-Z@].*$/
    /* remember to edit the GitBook when changing this value:
       https://app.gitbook.com/@mobsuccess/s/mobsuccess/git-1/git-guidelines#pull-request-naming
     */
  ) || !!pullRequestName.match(/^Revert ".*"$/);

// components
// add 235
// clean 3
// create 1
// fix 279
// improve 37
// remove 22
// set 3
// update 25~ (38 npm update)
// upgrade 1
// use 2
// rework 9 (sur drive ça doit être bien plus)
// ignore 2
// bump 39 (mais la plus part c'est dependabot)
