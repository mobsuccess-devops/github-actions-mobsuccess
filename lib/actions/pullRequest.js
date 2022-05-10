const { getOctokit } = require("./octokit");
const { isBranchNameValid } = require("../branch");
const {
  isPullRequestTitleValid: isPullRequestTitleValid,
} = require("../pullRequest");
const { getAmplifyURI, getStorybookAmplifyUri } = require("./amplify");

exports.validatePR = async function validatePR({ pullRequest }) {
  const {
    number: pullNumber,
    commits,
    base: {
      ref: baseRef,
      repo: {
        owner: { login: owner },
        name: repo,
      },
    },
    head: { ref: headRef, sha: headSha },
    title,
  } = pullRequest;

  if (
    ["main", "master", "preprod", "prod"].indexOf(baseRef) === -1 &&
    headRef.slice(0, baseRef.length) !== baseRef &&
    !headRef.slice(baseRef.length).match(/^--/) &&
    !baseRef.match(/^hotfix\//)
  ) {
    throw new Error(
      `As this pull request is based on “${baseRef}”, its name should start with “${baseRef}--”. See https://www.notion.so/mobsuccess/Git-Guidelines-41996ef576cb4f29b7737772b74289c5#f9cadc10d949498dbe38c0eed08fd4f8`
    );
  }

  if (!isBranchNameValid(headRef)) {
    throw new Error(
      `This pull request is based on a branch with in invalid name: “${headRef}”. See https://www.notion.so/mobsuccess/Git-Guidelines-41996ef576cb4f29b7737772b74289c5#f9cadc10d949498dbe38c0eed08fd4f8`
    );
  }

  if (!isPullRequestTitleValid(title)) {
    throw new Error(
      `The title of this pull request is invalid, please edit: “${title}”. See https://www.notion.so/mobsuccess/Git-Guidelines-41996ef576cb4f29b7737772b74289c5#4ac148fd42a04141a528a87013ea5c57`
    );
  }

  const octokit = getOctokit();

  const branches = await octokit.paginate(
    "GET /repos/{owner}/{repo}/branches",
    { owner, repo }
  );
  let oneBranchIsOk = false;
  let nokBranch;
  for (const { name: branchName } of branches) {
    if (headRef === branchName) {
      continue;
    }
    const prefix = headRef.substr(0, branchName.length);
    const postfix = headRef.substr(branchName.length);
    if (prefix === branchName && prefix.length === branchName.length) {
      if (postfix.match(/^--[a-z]/)) {
        oneBranchIsOk = true;
        console.log(`Found OK branch: “${branchName}” matches “${headRef}”`);
      } else {
        nokBranch = branchName;
        console.log(
          `Found NOK branch: “${branchName}” does not match “${headRef}”`
        );
      }
    }
  }
  if (!oneBranchIsOk && nokBranch) {
    throw new Error(
      `This pull request is based on the branch “${headRef}”, which starts like “${nokBranch}”. Use double dashes (“--”) to separate sub-branches. See https://app.gitbook.com/@mobsuccess/s/mobsuccess/git`
    );
  }

  if (
    commits === 1 &&
    !title.match(/^Revert ".*"/) &&
    !title.match(/^Bump .*/)
  ) {
    // we have only one commit, make sure its name match the name of the PR
    const {
      data: { message: commitMessage },
    } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: headSha,
    });
    if (commitMessage !== title) {
      throw new Error(
        `This pull request has only one commit, and its message doesn't match the title of the PR. If you'd like to keep the title of the PR as it is, please add an empty commit.`
      );
    } else {
      console.log(
        "This pull request has only one commit, and its message matches the title of the PR."
      );
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
    const storybookAmplifyUri = await getStorybookAmplifyUri();
    console.log(`AWS Amplify URI: ${amplifyUri}`);
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner, repo, issue_number: pullNumber }
    );

    // add a comment with the PR
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
          body: `AWS Amplify live test URI: [${amplifyUri}](${amplifyUri})${
            !storybookAmplifyUri
              ? ""
              : `\n\nAWS Amplify Storybook URI: [${storybookAmplifyUri}](${storybookAmplifyUri})`
          }`,
        }
      );
    }

    // delete the bogus comments by the aws-amplify robot
    const bogusComments = comments.filter(({ user: { login } }) =>
      login.match(/^aws-amplify-/)
    );
    for (const bogusComment of bogusComments) {
      const { id: commentId } = bogusComment;
      console.log("Deleting comment", bogusComment);
      await octokit.issues.deleteComment({
        owner,
        repo,
        comment_id: commentId,
      });
    }
  }
};
