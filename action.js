const core = require("@actions/core");
const github = require("@actions/github");
//const getOctokit = require("./lib/actions/octokit");
const { validatePR } = require("./lib/actions/pullRequest");
const { generateChangelog } = require("./lib/actions/changelog");

exports.getActionParameters = function getActionParameters() {
  const pullRequest = github.context.payload.pull_request;
  const action = core.getInput("action", { required: true });
  return { pullRequest, action };
};

exports.action = async function action() {
  const { pullRequest, action } = exports.getActionParameters();

  console.info(`Calling action ${action}`);
  switch (action) {
    case "validate-pr":
      await validatePR({ pullRequest });
      break;
    case "changelog":
      await generateChangelog({ pullRequest });
      break;
  }
};
