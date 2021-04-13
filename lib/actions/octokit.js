const core = require("@actions/core");
const github = require("@actions/github");

exports.getOctokit = function getOctokit() {
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = github.getOctokit(githubToken);
  return octokit;
};
