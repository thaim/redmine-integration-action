async function parse_redmine_issues(prdata, redmine_host) {
  const regexp = new RegExp('.*' + redmine_host + '/issues/(\\d+).*', 'g');

  let result = regexp.exec(prdata);
  if (result !== null) {
    console.log(result);
    result.shift();
    result = result.map(id => parseInt(id));
  } else {
    result = [];
  }

  return result;
}

module.exports = parse_redmine_issues;
