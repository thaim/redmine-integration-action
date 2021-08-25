module.exports.parse_redmine_issues = async function (prdata, redmine_host, redmine_pattern) {
  let regexp_str = redmine_host + '/issues/(\\d+)';
  if (redmine_pattern) {
    regexp_str += '|' + redmine_pattern;
  }
  const regexp = new RegExp(regexp_str, 'g');
  const issues = [];

  let result;
  while ((result = regexp.exec(prdata)) !== null) {
    issues.push(parseInt(result[1] || result[2]));
  }

  return issues;
}

module.exports.build_redmine_message = async function (prdata, context) {
  return 'Github Pull Request "' + prdata.title + '":' + prdata.html_url + ' ' + context.payload.action;
}

module.exports.build_github_message = async function(redmine_host, redmine_issue_numbers) {
  return redmine_issue_numbers.reduce(function(message, issue_number) {
    return message + '[' + issue_number + '](' + redmine_host + '/issues/' + issue_number + ')';
  }, "Redmine issue(s): ");
}
