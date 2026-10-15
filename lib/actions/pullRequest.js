const { getOctokit } = require("./octokit");
const { isBranchNameValid } = require("../branch");
const {
  isPullRequestTitleValid: isPullRequestTitleValid,
} = require("../pullRequest");

exports.validatePR = async function validatePR({ pullRequest }) {
  const octokit = getOctokit();

  if (pullRequest) {
    const {
      number: pullNumber,
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
      ["main", "master", "preprod", "prod"].indexOf(baseRef) === -1 &&
      headRef.slice(0, baseRef.length) !== baseRef &&
      !headRef.slice(baseRef.length).match(/^--/) &&
      !baseRef.match(/^hotfix\//)
    ) {
      throw new Error(
        `As this pull request is based on “${baseRef}”, its name should start with “${baseRef}--”. See https://github.com/mobsuccess-devops/rfc/blob/master/docs/decisions/0009-convention-nommage-branch-pr.md`
      );
    }

    if (!isBranchNameValid(headRef)) {
      throw new Error(
        `This pull request is based on a branch with in invalid name: “${headRef}”. See https://github.com/mobsuccess-devops/rfc/blob/master/docs/decisions/0009-convention-nommage-branch-pr.md`
      );
    }

    if (!isPullRequestTitleValid(title)) {
      throw new Error(
        `The title of this pull request is invalid, please edit: “${title}”. See https://github.com/mobsuccess-devops/rfc/blob/master/docs/decisions/0009-convention-nommage-branch-pr.md`
      );
    }

    // everything seems valid: add the label if it exists
    const branchTag = headRef.split("/")[0];

    try {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pullNumber,
        labels: [branchTag],
      });
    } catch (e) {
      // ignore error
      console.log(`Could not apply label: ${e}`);
    }
  }
};
