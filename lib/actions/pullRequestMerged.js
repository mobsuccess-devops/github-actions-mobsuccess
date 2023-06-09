const { getOctokit } = require("./octokit");

const octokit = getOctokit();

const sendRebaseOntoCommentOnSubbranches = async ({
  repo: repoObject,
  mergedPrNumber,
}) => {
  const {
    owner: { login: owner },
    name: repo,
  } = repoObject;
  // fetch the pull request from github
  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: mergedPrNumber,
  });
  //TODO: uncomment when finished testing
  // if (pr.base.ref !== "master" || !pr.merge_commit_sha) {
  //   console.log("PR is not merged into master or is not a squash merge");
  //   return;
  // }
  // find all opened pull requests having the merged PR as base
  const { data: subprs } = await octokit.rest.pulls.list({
    owner,
    repo,
    base: `${pr.head.ref}`,
    state: "open",
    per_page: 100,
  });
  console.log(
    `There is ${subprs.length} PRs with ${pr.head.ref} as base: ${subprs
      .map((pr) => "#" + pr.number)
      .join(", ")}`
  );

  const lastCommitOfParentPR = pr.head.sha;
  const commentToDetectComment =
    "<!-- comment by ms-bot to inform of base branch merged -->";

  const body = `${commentToDetectComment}
💡 Base PR #${mergedPrNumber} has been squashed merged into master.

👉 This PR should be rebased on master using:
\`\`\`bash
git fetch && git rebase --onto origin/master ${lastCommitOfParentPR} && git push -f
\`\`\` 
`;

  // post a comment in each subprs
  for (const pr of subprs) {
    console.log(
      `*** PR #${pr.number} is a subpr of #${mergedPrNumber} which has been merged into master`
    );
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: pr.number,
    });
    const comment = comments.find((comment) => {
      return comment.body.startsWith(commentToDetectComment);
    });
    if (comment) {
      // if body is different, update body
      if (comment.body !== body) {
        await octokit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: comment.id,
          body,
        });
      }
      continue;
    }
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr.number,
      body,
    });
  }
};

exports.onPRMerged = async function onPRMerged({ pullRequest }) {
  console.log("Performing onPRMerged");
  const { base, head } = pullRequest;
  if (base.ref !== "master") {
    return;
  }
  await sendRebaseOntoCommentOnSubbranches({
    repo: {
      owner: { login: head.repo.owner.login },
      name: head.repo.name,
    },
    mergedPrNumber: pullRequest.number,
  });
};
