const core = require("@actions/core");
const github = require("@actions/github");
const { validatePR } = require("./lib/actions/pullRequest");
const { onPRMerged } = require("./lib/actions/pullRequestMerged");
const { generateChangelog } = require("./lib/actions/changelog");

exports.getActionParameters = function getActionParameters() {
  const comment = github.context.payload.comment;
  const issue = github.context.payload.issue;
  const repository = github.context.payload.repository;
  const ref = github.context.ref;
  const pullRequest = github.context.payload.pull_request;
  const mergeGroup = github.context.payload.merge_group;
  const action = core.getInput("action", { required: true });
  return { repository, ref, pullRequest, action, mergeGroup, issue, comment };
};

exports.action = async function action() {
  const parameters = exports.getActionParameters();
  console.log("Actiona prameters", JSON.stringify(parameters));
  const {
    repository,
    ref,
    pullRequest,
    action,
    mergeGroup,
    issue,
  } = parameters;

  console.info(`Calling action ${action}`);
  switch (action) {
    case "validate-pr":
      if (mergeGroup) {
        console.log("Ignoring PR validation when running in merge group");
        return;
      }
      await validatePR({ pullRequest, issue });
      break;
    case "after-pr-merged":
      await onPRMerged({ pullRequest });
      break;
    case "changelog":
      await generateChangelog({ repository, pullRequest, ref });
      break;
  }
};
