const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-crib-rn-scene-basic:app', () => {
  before(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        componentName: 'TestComponent',
      })
      .toPromise();
  });

  it('creates files', () => {
    assert.file([
      'index.js',
      'component.js',
      'actions.js',
      'workflow.js',
      '__tests__/component.test.js',
    ]);
  });
});
