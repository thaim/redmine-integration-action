const helper = require('./helper.js');

const core = require('@actions/core');
const github = require('@actions/github');
const Redmine = require('node-redmine');

async function run() {
  try {
    const context = github.context;
    const octokit = github.getOctokit(core.getInput('token'));

    const hostname = core.getInput('redmine_host');
    const config = {
      apiKey: core.getInput('redmine_apikey')
    };
    const redmine = new Redmine(hostname, config);
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });

    const redmine_issue_numbers = await helper.parse_redmine_issues(pr.data.body, hostname);

    const message = await helper.build_message(pr.data, context)
    const redmine_issue = {
      "issue": {
        "notes": message
      }
    };

    redmine_issue_numbers.forEach(id => {
      redmine.update_issue(id, redmine_issue, function(err, data) {
        if (err) throw err;

        console.log("update issue: " + JSON.stringify(redmine_issue));
      });
    });
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
