const core = require("@actions/core");
const { getOctokit } = require("./octokit");
const semverGt = require("semver/functions/gt");

const octokit = getOctokit();

// return latest releases sorted by creation date desc
const getLatestsReleases = async ({ owner, repo, maxCount = 10 }) => {
  const { data: releases } = await octokit.rest.repos.listReleases({
    owner,
    repo,
    per_page: 100,
  });
  return releases
    .filter((release) => !!release.tag_name)
    .sort((a, b) => semverGt(a.tag_name, b.tag_name))
    .slice(0, maxCount);
};

exports.generateChangelog = async function generateChangelog({ pullRequest }) {
  console.log("Generating changelog");

  const latestTagInput = core.getInput("unreleased-tag") || null; // default to null, in case the action passes false or an empty string

  const { base, head } = pullRequest;
  const repo = {
    owner: { login: head.repo.owner.login },
    name: head.repo.name,
  };

  let maxReleases = core.getInput("max-releases");
  if (maxReleases) {
    maxReleases = parseInt(maxReleases, 10) + 1;
  } else {
    maxReleases = 11;
  }

  const releases = await getLatestsReleases({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    maxCount: maxReleases,
  });

  // list last 100 pull requests
  const { data: pullRequests } = await octokit.rest.pulls.list({
    owner: repo.owner.login,
    repo: repo.name,
    base: base.ref,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  // filter pull requests that are not merged
  const mergedPullRequests = pullRequests
    .filter((pr) => !!pr.merge_commit_sha)
    .filter((pr) => pr.base.ref === base.ref);

  // reverse releases to have the oldest first
  const reversedReleases = releases.reverse();

  // generate changelog for each release
  const changelog = await Promise.all(
    reversedReleases.map(async (previousRelease, index, arr) => {
      let release = index + 1 < arr.length ? arr[index + 1] : null;
      const tag = release ? release.tag_name : latestTagInput;
      if (tag) {
        console.log(
          `Generating changelog for ${tag}, previous release= ${previousRelease.tag_name}`
        );
        // list pull request in between those tags
        const commitsBetweenThoseTwoTags = await octokit.rest.repos.compareCommits(
          {
            owner: repo.owner.login,
            repo: repo.name,
            base: previousRelease.tag_name,
            head: tag,
          }
        );
        const commits = commitsBetweenThoseTwoTags.data.commits;
        const commitsHashes = commits.map((commit) => commit.sha);
        const pullRequests = mergedPullRequests.filter((pr) =>
          commitsHashes.includes(pr.merge_commit_sha)
        );
        return {
          release,
          previousRelease,
          tag,
          pullRequests,
        };
      }
      return {};
    })
  );

  const changelogContentArray = changelog.map(
    ({ release, tag, previousRelease, pullRequests = [] }) => {
      const currentTag = release ? release.tag_name : tag;
      if (!currentTag) {
        return "";
      }
      const date = release ? new Date(release.published_at) : new Date();
      const niceDate =
        date.toLocaleDateString() + " - " + date.toLocaleTimeString();
      const results = [`## ${currentTag} (${niceDate})`];

      if (pullRequests.length) {
        results.push("");
        results.push(
          pullRequests
            .map((pr) => {
              return `- \`${pr.title}\` #${pr.number} by @${pr.user.login}`;
            })
            .join("\n")
        );
      }

      if (previousRelease) {
        results.push("");
        results.push(
          `**Full Changelog**: https://github.com/${repo.owner.login}/${repo.name}/compare/${previousRelease.tag_name}...${currentTag}`
        );
      }
      return results.join("\n");
    }
  );

  const changelogContent = changelogContentArray.reverse().join("\n\n");

  core.setOutput("changelog", changelogContent.trim());
};
