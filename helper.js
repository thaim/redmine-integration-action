async function parse_redmine_issues(prdata, redmine_host) {
  const regexp = new RegExp('.*' + redmine_host + '/issues/(\\d+).*', 'g');
  const issues = [];

  let result;
  while ((result = regexp.exec(prdata)) !== null) {
    issues.push(parseInt(result[1]));
  }

  return issues;
}

module.exports = parse_redmine_issues;
