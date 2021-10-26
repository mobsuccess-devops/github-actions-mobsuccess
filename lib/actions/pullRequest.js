const { getOctokit } = require("./octokit");
const { isBranchNameValid } = require("../branch");
const {
  isPullRequestTitleValid: isPullRequestTitleValid,
} = require("../pullRequest");
const { getAmplifyURI } = require("./amplify");

exports.validatePR = async function validatePR({ pullRequest }) {
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
      `The title of this pull request is invalid, please edit: “${title}”. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git-1/git-guidelines#pull-request-naming`
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

  // do we have an AWS Amplify URI? If so, make sure that at least one comment
  // exists with a link to it
  const amplifyUri = await getAmplifyURI();
  if (!amplifyUri) {
    console.log("No AWS Amplify URI for this repository");
  } else {
    console.log(`AWS Amplify URI: ${amplifyUri}`);
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner, repo, issue_number: pullNumber }
    );
    console.log("debug comments", comments);
    if (comments.some(({ body }) => body.match(amplifyUri))) {
      console.log("A comment already exists with a link to AWS Amplify");
    } else {
      console.log("Comment with link to Amplify URI missing");
      console.log("Adding comment with AWS Amplify URI");
      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner,
          repo,
          issue_number: pullNumber,
          body: `AWS Amplify live test URI: [${amplifyUri}](${amplifyUri})`,
        }
      );
    }
  }
};
