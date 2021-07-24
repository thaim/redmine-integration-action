const sut = require('./helper.js');

const body = 'https://redmine.example.com/issues/776';

test('parse_redmine_issue parse single issue', async () => {
  const actual = await sut(body);

  expect(actual).toEqual(expect.arrayContaining([776]));
});
