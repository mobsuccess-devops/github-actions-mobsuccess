const core = require("@actions/core");
const github = require("@actions/github");
const { validatePR } = require("./lib/actions/pullRequest");
const { onPRMerged } = require("./lib/actions/pullRequestMerged");
const { generateChangelog } = require("./lib/actions/changelog");

exports.getActionParameters = function getActionParameters() {
  const repository = github.context.payload.repository;
  const ref = github.context.ref;
  const pullRequest = github.context.payload.pull_request;
  const action = core.getInput("action", { required: true });
  return { repository, ref, pullRequest, action };
};

exports.action = async function action() {
  const {
    repository,
    ref,
    pullRequest,
    action,
  } = exports.getActionParameters();

  console.info(`Calling action ${action}`);
  console.info(`With context`, github.context);
  switch (action) {
    case "validate-pr":
      await validatePR({ pullRequest });
      break;
    case "after-pr-merged":
      await onPRMerged({ pullRequest });
      break;
    case "changelog":
      await generateChangelog({ repository, pullRequest, ref });
      break;
  }
};
