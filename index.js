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
    const pattern = core.getInput('redmine_pattern');

    const pr_data = [pr.data.title, pr.data.body, pr.data.head.label].join('\n');
    const redmine_issue_numbers = await helper.parse_redmine_issues(pr_data, hostname, pattern);

    const redmine_message = await helper.build_redmine_message(pr.data, context)
    const redmine_issue_note = {
      "issue": {
        "notes": redmine_message
      }
    };
    const github_message = await helper.build_github_message(hostname, redmine_issue_numbers);
    const github_pr_comment = {
      "owner": context.repo.owner,
      "repo": context.repo.repo,
      "issue_number": pr.data.number,
      "body": github_message
    };

    redmine_issue_numbers.forEach(id => {
      redmine.update_issue(id, redmine_issue_note, function(err, data) {
        if (err) throw err;

        console.log("update issue: " + JSON.stringify(redmine_issue_note));
      });
    });

    octokit.rest.issues.createComment(github_pr_comment);

  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
