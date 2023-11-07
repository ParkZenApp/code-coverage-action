const core = require("@actions/core");
const { githubApi } = require("@barecheck/core");
const path = require("path");

const { getPullRequestContext, getOctokit } = require("../lib/github");
const { getWorkspacePath } = require("../input");

const getChangedFilesCoverage = async (coverage) => {
  const pullRequestContext = getPullRequestContext();

  if (!pullRequestContext) {
    core.info(`NO PullRequestContext`);
    return coverage.data;
  }

  const octokit = await getOctokit();

  const { repo, owner, pullNumber } = pullRequestContext;
  core.info(`PullRequestContext ${repo}, ${owner}, ${pullNumber}`);
  
  const changedFiles = await githubApi.getChangedFiles(octokit, {
    repo,
    owner,
    pullNumber
  });
  core.info(`Changed files ${changedFiles}`);

  const workspacePath = getWorkspacePath();
  const changedFilesCoverage = coverage.data.reduce(
    (allFiles, { file, lines }) => {
      const filePath = workspacePath ? path.join(workspacePath, file) : file;
      // core.info(`Files Changed Path ${filePath}`);

      const changedFile = changedFiles.find(
        ({ filename }) => {
          core.info(`Got Changed File ${filename}`);
          return filename === filePath;
        }
      );

      if (changedFile) {
        return [
          ...allFiles,
          {
            file: filePath,
            url: changedFile.blob_url,
            lines
          }
        ];
      }
      return allFiles;
    },
    []
  );

  return changedFilesCoverage;
};

module.exports = getChangedFilesCoverage;
