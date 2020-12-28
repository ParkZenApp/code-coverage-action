const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

const lcov = require('./lcov');
const { sendComment } = require('./github');

async function main() {
  const token = core.getInput('github-token');
  const baseFile = core.getInput('lcov-file');
  const headFile = core.getInput('head-lcov-file');

  const baseFileRaw = fs.readFileSync(
    path.join(__dirname, '../', baseFile),
    'utf8'
  );

  if (!baseFileRaw) {
    console.log(`No coverage report found at '${baseFile}', exiting...`);
    return;
  }

  const headFileRaw = fs.readFileSync(
    path.join(__dirname, '../', headFile),
    'utf8'
  );

  if (!headFileRaw) {
    console.log(`No coverage report found at '${headFileRaw}', exiting...`);
    return;
  }

  const headFileData = await lcov.parse(headFileRaw);
  const baseFileData = await lcov.parse(baseFileRaw);

  const basePercentage = lcov.percentage(baseFileData).toFixed(2);
  const headPercentage = lcov.percentage(headFileData).toFixed(2);

  const diff = basePercentage - headPercentage;

  sendComment(token, diff, basePercentage);

  core.setOutput('percentage', basePercentage);
  core.setOutput('diff', diff);
}

try {
  main();
} catch {
  console.log(err);
  core.setFailed(err.message);
}