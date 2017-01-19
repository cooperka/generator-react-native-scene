const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

// This will be set to a real value later.
let tempDir = '/dev/null';

describe('generator-crib-rn-scene, with reducer', () => {
  before(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inTmpDir((dir) => {
        // TODO: Can't set this in a callback, need to set it before `withPrompts`.
        //   Until then, tests will just fail because /dev/null can't have folders created in it.
        tempDir = dir;
      })
      .withPrompts({
        projectPath: tempDir,
        componentPath: '',
        componentName: 'TestComponent',
        includeReducer: true,
      });
  });

  it('creates files', () => {
    assert.file([
      'index.js',
      'actions.js',
      'component.js',
      'reducers.js',
      'utils.js',
      'workflow.js',
      '__tests__/component.test.js',
      '__tests__/source.test.js',
    ]);
  });
});
