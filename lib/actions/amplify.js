const core = require("@actions/core");
const github = require("@actions/github");

exports.getAmplifyURIs = async function getAmplifyURI() {
  const pullRequest = github.context.payload.pull_request;
  const issue = github.context.payload.issue;
  const pullNumber = pullRequest?.number || issue?.number;

  const amplifyUriRaw = core.getInput("amplify-uri");
  if (!amplifyUriRaw) {
    console.log("No input for amplify-uri");
    return;
  }
  const amplifyUri = amplifyUriRaw.replace(/%/g, pullNumber);
  if (amplifyUri.match(/^{/)) {
    const result = [];
    const amplifyUris = JSON.parse(amplifyUri);
    for (const [key, url] of Object.entries(amplifyUris)) {
      result.push(`- ${key}: ${url}`);
    }
    return result;
  } else if (!amplifyUri) {
    return null;
  } else {
    return [amplifyUri];
  }
};
