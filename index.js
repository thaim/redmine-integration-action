const Redmine = require('node-redmine');

function run() {
  try {
    const hostname = process.env.REDMINE_HOST;
    const config = {
      apiKey: process.env.REDMINE_APIKEY
    };
    const redmine = new Redmine(hostname, config);

    redmine.get_issue_by_id(776, null, function(err, data) {
      if (err) throw err;

      console.log(JSON.stringify(data.issue));
    });
  } catch (error) {
    console.error("error: " + error);
  }
}

run();
