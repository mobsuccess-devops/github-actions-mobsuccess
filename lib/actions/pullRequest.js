const { getOctokit } = require("./octokit");
const { isBranchNameValid } = require("../branch");
const {
  isPullRequestTitleValid: isPullRequestTitleValid,
} = require("../pullRequest");

exports.validatePR = async function validatePR({ pullRequest }) {
  const {
    base: {
      ref: baseRef,
      repo: {
        owner: { login: owner },
        name: repo,
      },
    },
    head: { ref: headRef },
    title,
  } = pullRequest;

  if (
    ["master", "preprod", "prod"].indexOf(baseRef) === -1 &&
    headRef.slice(0, baseRef.length) !== baseRef &&
    !headRef.slice(baseRef.length).match(/^--/)
  ) {
    throw new Error(
      `As this pull request is based on “${baseRef}”, its name should start with “${baseRef}--”. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git`
    );
  }

  if (!isBranchNameValid(headRef)) {
    throw new Error(
      `This pull request is based on a branch with in invalid name: “${headRef}”. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git`
    );
  }

  if (!isPullRequestTitleValid(title)) {
    throw new Error(
      `The title of this pull request is invalid, please edit: “${title}”. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git`
    );
  }

  const octokit = getOctokit();

  const branches = await octokit.paginate(
    "GET /repos/{owner}/{repo}/branches",
    { owner, repo }
  );
  for (const { name: branchName } of branches) {
    if (headRef === branchName) {
      continue;
    }
    const prefix = headRef.substr(0, branchName.length);
    const postfix = headRef.substr(branchName.length);
    if (prefix === branchName) {
      if (!postfix.match(/^--[a-z]/)) {
        throw new Error(
          `This pull request is based on the branch “${headRef}”, which starts like “${branchName}”. Use double dashes (“--”) to separate sub-branches. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git`
        );
      }
    }
  }
};
