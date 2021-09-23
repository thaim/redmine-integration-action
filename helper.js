module.exports.parse_redmine_issues = function (prdata, redmine_host, redmine_pattern) {
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

  // Unique issues
  return [...new Set(issues)];
}

module.exports.build_redmine_message = function (prdata, context) {
  return 'Github Pull Request [' + prdata.title + '](' + prdata.html_url + ') ' + context.payload.action;
}

module.exports.build_github_message = function(redmine_host, redmine_issues) {
  const formatted_issues = redmine_issues.map(function(issue) {
    return '[#' + issue.id + ': ' + issue.subject + '](' + redmine_host + '/issues/' + issue.id + ')';
  });
  return "Redmine issue(s): " + formatted_issues.join('\n');
}
