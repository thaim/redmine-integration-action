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

    const commits = await octokit.rest.pulls.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number
    });
    const commit_messages = commits.data.map(function(commit) {
      return commit.commit.message;
    });

    const pr_data = [pr.data.title, pr.data.body, pr.data.head.label].concat(commit_messages).join('\n');
    const redmine_issue_numbers = helper.parse_redmine_issues(pr_data, hostname, pattern);

    redmine.request('GET', '/my/account.json', {}, function(err, data) {
      const my_user = data.user.id;

      const redmine_issues = redmine.issues({"issue_id": redmine_issue_numbers.join(",")}, function(err, data) {
        if (err) throw err;

        const redmine_issues = data.issues;

        const redmine_message = helper.build_redmine_message(pr.data, context)
        const redmine_issue_attributes = {
          "issue": {
            "notes": redmine_message
          }
        };

        redmine_issues.forEach(issue => {
          let this_issue_attributes = JSON.parse(JSON.stringify(redmine_issue_attributes));

          redmine.get_issue_by_id(issue.id, {"include": "allowed_statuses,journals"}, function(err, data) {

            // The "allowed_statuses" option doesn't seem to work as the Redmine API documentation claims, so we'll skip checking that for now.
            if (issue.status.name === "Queued" || issue.status.name === "In Progress") {
              this_issue_attributes.issue.status_id = 4; // Pull Request
            }

            const already_commented = data.issue.journals.some(function(journal) {
              return journal.user.id === my_user.id && journal.notes === this_issue_attributes.issue.notes;
            });

            if (!already_commented) {
              redmine.update_issue(issue.id, this_issue_attributes, function(err, data) {
                if (err) throw err;

                console.log("Update Redmine Issue: " + JSON.stringify(this_issue_attributes));
              });
            }
          });
        });

        if (redmine_issue_numbers.length === 0) {
          console.log("No issues parsed from Pull Request or commits.");
          return;
        } else {
          const redmmine_issues = redmine.issues({"issue_id": redmine_issue_numbers.join(",")}, function(err, data) {
            if (err) throw err;

            const redmine_issues = data.issues;
            const github_message = helper.build_github_message(hostname, redmine_issues);
            const github_pr_comment = {
              "owner": context.repo.owner,
              "repo": context.repo.repo,
              "issue_number": pr.data.number,
              "body": github_message
            };

            console.log('Update Pull Request: ' + JSON.stringify(github_pr_comment));
            octokit.rest.issues.createComment(github_pr_comment);
          });
        }
      });
    });

  } catch (error) {
    console.error("Error: " + error);
    process.exitCode = 1;
  }
}

run();
