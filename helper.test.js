const sut = require('./helper.js');
const redmine_host = 'https://redmine.example.com';


describe('parse_redmine_issue', () => {
  it('ssue parse single issue', async () => {
    const body = 'https://redmine.example.com/issues/776';
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toEqual(expect.arrayContaining([776]));
  });

  it('parse nothing from body w/o URL', async () => {
    const body = 'This is pull request body without redmine URL.';
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toHaveLength(0);
  });

  it('parse nothing from body with different URL', async () => {
    const body = 'https://redmine.example.org/issues/776';
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toHaveLength(0);
  });

  it('parse issue with extra strings', async () => {
    const body = 'issue https://redmine.example.com/issues/776 is here';
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toEqual(expect.arrayContaining([776]));
  });

  it('parse issues from multiple URL', async () => {
    const body = '* https://redmine.example.com/issues/123\n* https://redmine.example.com/issues/456';
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toEqual(expect.arrayContaining([123, 456]));
  });

  it('parse issues containing quotation in body', async () => {
    const body = `it's my issue: "https://redmine.example.com/issues/123"`;
    const actual = await sut.parse_redmine_issues(body, redmine_host);

    expect(actual).toEqual(expect.arrayContaining([123]));
  });
});

describe('build_message', () => {
  it('create message from title and action', async () => {
    const prdata = {
      "title": "my pull request title",
      "html_url": "https://github.com/thaim/redmine-integration-action/pull/456"
    };
    const context = {
      "payload": {
        "action": "opened"
      }
    };
    const actual = await sut.build_redmine_message(prdata, context);

    expect(actual).toEqual("Github Pull Request [my pull request title](https://github.com/thaim/redmine-integration-action/pull/456) opened");
  });


  it('create message which contains quotation in title', async () => {
    const prdata = {
      "title": "it's my pull request title",
      "html_url": "https://github.com/thaim/redmine-integration-action/pull/456"
    };
    const context = {
      "payload": {
        "action": "opened"
      }
    };
    const actual = await sut.build_redmine_message(prdata, context);

    expect(actual).toEqual("Github Pull Request [it's my pull request title](https://github.com/thaim/redmine-integration-action/pull/456) opened");
  });
});
