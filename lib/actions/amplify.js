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
    return {};
  }
  const amplifyUri = amplifyUriRaw.replace(/%/g, pullNumber);
  if (amplifyUri.match(/^{/)) {
    const amplifyUris = JSON.parse(amplifyUri);

    const hasAtLeastOnePackageOrConfig = labels.some(
      (label) => label.startsWith("packages/") || label.startsWith("configs/")
    );

    const allLinks = Object.entries(amplifyUris).map(([label, url]) => {
      const hasLabel = labels.some((l) => label.includes(l));
      return {
        label,
        url,
        isVisibleInComment: hasAtLeastOnePackageOrConfig || hasLabel,
        hasPreview: hasLabel,
      };
    });
    return {
      links: allLinks.filter((l) => l.isVisibleInComment),
      hiddenLinks: allLinks.filter((l) => !l.isVisibleInComment),
    };
  } else if (!amplifyUri) {
    return {};
  } else {
    return { links: [{ url: amplifyUri, hasPreview: true }] };
  }
};
