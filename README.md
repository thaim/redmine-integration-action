# Redmine Integration
GitHub Action for updating Redmine issue with GitHub pull request link.

When GitHub pull request created with Redmine issue link, this action update target Redmine issue by adding notes with link to the pull request.
The note looks like below:

```
pull request <pull_requeta_title> <action>
```

`<pull_request_title>` is your pull request title and link to the pull request, and `<action>` is `opended`, `closed` or `reopended` depends on the status on your pull request.


## Usage

```yaml
name: update Redmine issue
on:
  pull_requests:
    types: [opened, closed, reopened]

jobs:
  action:
    runs-on: ubuntu-latest
    steps:
      - uses: thaim/redmine-integration-action@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          redmine_host: ${{ secrets.REDMINE_HOST }}
          redmine_apikey: ${{ secrets.REDMINE_API_KEY}}
```

## Settings
Setup your Redmine [enabling REST API](https://www.redmine.org/projects/redmine/wiki/rest_api#Authentication). Register your Redmine api key as `REDMINE_API_KEY` and your Redmine URL as `REDMINE_HOST` in [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

Be sure that your `REDMINE_HOST` contains protocol such as `https://redmine.example.com`.
