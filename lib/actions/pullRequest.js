const { getOctokit } = require("./octokit");
const { isBranchNameValid } = require("../branch");
const {
  isPullRequestTitleValid: isPullRequestTitleValid,
} = require("../pullRequest");
const { getAmplifyURIs } = require("./amplify");
const {
  detectGenAI,
  GENAI_LABEL,
  GENAI_LABEL_COLOR,
  GENAI_LABEL_DESCRIPTION,
} = require("../genaiDetection");

exports.validatePR = async function validatePR({ pullRequest, issue }) {
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

    const branchTag = headRef.split("/")[0];

    try {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: pullNumber,
        labels: [branchTag],
      });
    } catch (e) {
      console.log(`Could not apply label: ${e}`);
    }

    try {
      const genaiResult = await detectGenAI(octokit, {
        owner,
        repo,
        pullNumber,
        pullRequest,
      });

      if (genaiResult.detected) {
        console.log(`GenAI detected: ${genaiResult.reason}`);
        try {
          await octokit.issues.createLabel({
            owner,
            repo,
            name: GENAI_LABEL,
            color: GENAI_LABEL_COLOR,
            description: GENAI_LABEL_DESCRIPTION,
          });
          console.log(
            `Created label "${GENAI_LABEL}" with color #${GENAI_LABEL_COLOR}`
          );
        } catch (createError) {
          // Label already exists (status 422 or error message contains "already_exists")
          if (
            createError.status === 422 ||
            createError.message?.includes("already_exists")
          ) {
            await octokit.issues.updateLabel({
              owner,
              repo,
              name: GENAI_LABEL,
              color: GENAI_LABEL_COLOR,
              description: GENAI_LABEL_DESCRIPTION,
            });
            console.log(
              `Updated label "${GENAI_LABEL}" with color #${GENAI_LABEL_COLOR}`
            );
          } else {
            throw createError;
          }
        }
        await octokit.issues.addLabels({
          owner,
          repo,
          issue_number: pullNumber,
          labels: [GENAI_LABEL],
        });
        console.log(`Added "${GENAI_LABEL}" label to PR #${pullNumber}`);
      } else if (genaiResult.alreadyLabeled) {
        console.log(`PR #${pullNumber} already has "${GENAI_LABEL}" label`);
      } else {
        console.log(`No GenAI assistance detected in PR #${pullNumber}`);
      }
    } catch (e) {
      console.log(`Warning: GenAI detection failed: ${e.message}`);
    }
  }

  const {
    links: amplifyUris,
    hiddenLinks: hiddenAmplifyUris,
  } = await getAmplifyURIs();
  const hiddenAmplifyText =
    hiddenAmplifyUris && hiddenAmplifyUris.length > 0
      ? `\n<details><summary>More uris</summary>

- ${hiddenAmplifyUris.map((item) => item.url).join("\n - ")}

</details>`
      : "";
  if (
    (!amplifyUris || amplifyUris.length === 0) &&
    (!hiddenAmplifyUris || hiddenAmplifyUris.length === 0)
  ) {
    console.log("No AWS Amplify URI for this repository");
  } else {
    console.log("AWS Amplify URIs: ", amplifyUris, "hidden", hiddenAmplifyUris);
    const pullNumber = pullRequest?.number || issue?.number;
    const owner =
      pullRequest?.base.repo.owner.login ||
      issue?.repository_url?.split("/")[4];
    const repo =
      pullRequest?.base.repo.name || issue?.repository_url?.split("/")[5];
    const comments = await octokit.paginate(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      { owner, repo, issue_number: pullNumber }
    );

    const body =
      "AWS Amplify live test URI:\n" +
      "- " +
      amplifyUris
        .map(
          (elt) =>
            `[${[
              elt.label?.split("/")?.pop(),
              elt.hasPreview ? " preview" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}](${elt.url})`
        )
        .join("\n- ") +
      hiddenAmplifyText;
    const previousComments = comments.filter(({ body }) =>
      body.match(/AWS Amplify live/)
    );
    if (previousComments.length > 0) {
      console.log(
        "A comment already exists with a link to AWS Amplify, editing it"
      );
      const firstComment = previousComments[0];
      await octokit.request(
        "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
        {
          owner,
          repo,
          comment_id: firstComment.id,
          body,
        }
      );
    } else {
      console.log("Comment with link to Amplify URI missing, creating it");
      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner,
          repo,
          issue_number: pullNumber,
          body,
        }
      );
    }

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
