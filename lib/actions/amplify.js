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

exports.getStorybookAmplifyUri = async function getStorybookAmplifyUri() {
  const pullRequest = github.context.payload.pull_request;
  const storybookAmplifyUri = core.getInput("storybook-amplify-uri");
  if (!storybookAmplifyUri) {
    return;
  }
  return storybookAmplifyUri.replace("%", pullRequest.number);
};
