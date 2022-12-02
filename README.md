# Github Mobsuccess action

[![NPM](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml/badge.svg)](https://github.com/mobsuccess-devops/github-actions-mobsuccess/actions/workflows/npm.yml)

This action validates that the various Mobsuccess policies are enforced when
changes are made to the repository. It checks, for example, the title of the
pull request, the names of the branch…

# Install the workflow in repository

You do not need to make any action to install the GitHub Action workflow,
ms-bot will automatically make PRs on your repository when changes are needed.

# ACTIONS

## Changelog

The changelog action allows to generate on a particular repo, a changelog for the last X tags.

The "latest tag" corresponds to a tag that has not been pushed as a release. As this action is based on GH releases, it allows to generate the changelog between the last release and the tag being created right now.

Usage:

```yml
- uses: mobsuccess-devops/github-actions-mobsuccess@master
  with:
    github-token: ${{ github.token }}
    action: changelog
    max-releases: 10 #(optional, default to 10)
    unreleased-tag: 0.0.90289303809 # newly created unreleased tag (optional)
```
