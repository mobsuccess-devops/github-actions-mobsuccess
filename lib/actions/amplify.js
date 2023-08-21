const core = require("@actions/core");
const github = require("@actions/github");

exports.getAmplifyURIs = async function getAmplifyURI() {
  const pullRequest = github.context.payload.pull_request;
  const issue = github.context.payload.issue;
  const pullNumber = pullRequest?.number || issue?.number;
  const labels =
    pullRequest?.labels.map((label) => label.name) ??
    issue?.labels.map((label) => label.name) ??
    [];

  const amplifyUriRaw = core.getInput("amplify-uri");
  if (!amplifyUriRaw) {
    console.log("No input for amplify-uri");
    return;
  }
  const amplifyUri = amplifyUriRaw.replace(/%/g, pullNumber);
  if (amplifyUri.match(/^{/)) {
    const links = [];
    const hiddenLinks = [];
    const amplifyUris = JSON.parse(amplifyUri);

    const hasAtLeastOnePackageOrConfig = labels.some(
      (label) => label.startsWith("package/") || label.startsWith("config/")
    );

    if (hasAtLeastOnePackageOrConfig) {
      for (const [url] of Object.values(amplifyUris)) {
        links.push(url);
      }
    } else {
      for (const label of labels) {
        if (amplifyUris[label]) {
          links.push(amplifyUris[label]);
        }
      }
      for (const [key, url] of Object.entries(amplifyUris)) {
        if (!labels.includes(key)) {
          hiddenLinks.push(url);
        }
      }
    }
    return { links, hiddenLinks };
  } else if (!amplifyUri) {
    return null;
  } else {
    return { links: [amplifyUri] };
  }
};
