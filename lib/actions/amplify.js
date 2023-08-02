const core = require("@actions/core");
const github = require("@actions/github");

exports.getAmplifyURIs = async function getAmplifyURI() {
  const pullRequest = github.context.payload.pull_request;
  const labels = pullRequest.labels.map((label) => label.name);
  const amplifyUriRaw = core.getInput("amplify-uri");
  if (!amplifyUriRaw) {
    return;
  }
  const amplifyUri = amplifyUriRaw.replace(/%/g, pullRequest.number);
  if (amplifyUri.match(/^{/)) {
    const result = [];
    const amplifyUriMap = JSON.parse(amplifyUri);
    for (const label of labels) {
      if (amplifyUriMap[label]) {
        result.push(amplifyUriMap[label]);
      }
    }
    return result;
  } else if (!amplifyUri) {
    return null;
  } else {
    return [amplifyUri];
  }
};
