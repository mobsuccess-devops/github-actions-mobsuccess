const core = require("@actions/core");
const github = require("@actions/github");

exports.getAmplifyURI = async function getAmplifyURI() {
  const pullRequest = github.context.payload.pull_request;
  const amplifyUri = core.getInput("amplify-uri");
  if (!amplifyUri) {
    return;
  }
  return amplifyUri.replace("%", pullRequest.number);
};
