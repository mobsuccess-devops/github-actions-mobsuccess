const core = require("@actions/core");
const github = require("@actions/github");

exports.getAmplifyURIs = async function getAmplifyURI() {
  const pullRequest = github.context.payload.pull_request;
  const issue = github.context.payload.issue;
  const pullNumber = pullRequest?.number || issue?.number;
  const labels =
    pullRequest?.labels.map((label) => label.name) ||
    issue?.labels.map((label) => label.name);
  const amplifyUriRaw = core.getInput("amplify-uri");
  if (!amplifyUriRaw) {
    console.log("No input for amplify-uri");
    return;
  }
  const amplifyUri = amplifyUriRaw.replace(/%/g, pullNumber);
  if (amplifyUri.match(/^{/)) {
    const result = [];
    const amplifyUris = JSON.parse(amplifyUri);
    for (const label of labels) {
      if (amplifyUris[label]) {
        result.push(amplifyUris[label]);
      }
    }
    return result;
  } else if (!amplifyUri) {
    return null;
  } else {
    return [amplifyUri];
  }
};
