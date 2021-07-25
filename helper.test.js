const sut = require('./helper.js');
const redmine_host = 'https://redmine.example.com';


test('parse_redmine_issue parse single issue', async () => {
  const body = 'https://redmine.example.com/issues/776';
  const actual = await sut(body, redmine_host);

  expect(actual).toEqual(expect.arrayContaining([776]));
});

test('parse_redmine_issue parse nothing from body w/o URL', async () => {
  const body = 'This is pull request body without redmine URL.';
  const actual = await sut(body, redmine_host);

  expect(actual).toHaveLength(0);
});

test('parse_redmine_issue parse nothing from body with different URL', async () => {
  const body = 'https://redmine.example.org/issues/776';
  const actual = await sut(body, redmine_host);

  expect(actual).toHaveLength(0);
});

test('parse_redmine_issue parse issue with extra strings', async () => {
  const body = 'issue https://redmine.example.com/issues/776 is here';
  const actual = await sut(body, redmine_host);

  expect(actual).toEqual(expect.arrayContaining([776]));
});

test('parse_redmine_issue parse issues from multiple URL', async () => {
  const body = '* https://redmine.example.com/issues/123\n* https://redmine.example.com/issues/456';
  const actual = await sut(body, redmine_host);

  expect(actual).toEqual(expect.arrayContaining([123, 456]));
});

test('parse_redmine_issue parse issues containing quotation in body', async () => {
  const body = `it's my issue: "https://redmine.example.com/issues/123"`;
  const actual = await sut(body, redmine_host);

  expect(actual).toEqual(expect.arrayContaining([123]));
});
