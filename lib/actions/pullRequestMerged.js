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
  if (pr.base.ref !== "master" || !pr.merge_commit_sha) {
    return;
  }
  // get all open branches from the repository
  const { data: branches } = await octokit.rest.repos.listBranches({
    owner,
    repo,
  });
  // filter out branches that are not subbranches of the merged PR
  const subbranches = branches.filter((branch) => {
    return branch.name.startsWith(`${pr.head.ref}--`);
  });

  const lastCommitOfParentPR = pr.head.sha;
  const commentToDetectComment =
    "<!-- comment by ms-bot to inform of base branch merged -->";

  const body = `${commentToDetectComment}
💡 Base PR #${mergedPrNumber} has been squashed merged into master.

👉 This PR should be rebased on master using:
- Fetch all:
\`\`\`bash
git fetch
\`\`\`
- Rebase on master using last common commit:
\`\`\`bash
git rebase --onto origin/master ${lastCommitOfParentPR}
\`\`\` 
- Force push to your branch:
\`\`\`bash
git push -f
\`\`\` 
`;

  // post a comment in each subbranches PRs
  for (const branch of subbranches) {
    const { data: branchPr } = await octokit.rest.pulls.list({
      owner,
      repo,
      head: `${owner}:${branch.name}`,
    });
    if (
      branchPr.length === 0 ||
      branchPr[0].closed_at ||
      branchPr[0].merged_at
    ) {
      continue;
    }
    console.log(
      `*** PR #${branchPr[0].number} is a subpr of #${mergedPrNumber} which has been merged into master`
    );
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: branchPr[0].number,
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
      issue_number: branchPr[0].number,
      body,
    });
  }
};

exports.onPRMerged = async function onPRMerged({ pullRequest }) {
  console.log("Performing onPRMerged");
  const { base, head } = pullRequest;
  if (base.ref !== "master" || !head.ref.includes("--")) {
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
