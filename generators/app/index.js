const path = require('path');
const glob = require('glob');
const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const changeCase = require('change-case');

module.exports = yeoman.Base.extend({

  prompting: function () {
    this.log(yosay(
      `Welcome to the astounding ${chalk.red('crib-rn-scene-basic')} generator!`
    ));

    const prompts = [
      {
        type: 'input',
        name: 'projectPath',
        message: 'Absolute path to your React Native project',
        default: '/Users/klap-hotel/Dev/cribspot/home-app/',
      },
      {
        type: 'input',
        name: 'componentPath',
        message: 'Relative path the new component\'s parent directory',
        default: 'src/components/scenes',
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'New component\'s name',
        default: 'MyScene',
      },
      {
        type: 'input',
        name: 'sceneTitle',
        message: 'Scene title',
        default: 'My Scene',
      },
      {
        type: 'input',
        name: 'description',
        message: 'New component\'s description',
        default: 'Screen showing a basic greeting.',
      },
      {
        type: 'confirm',
        name: 'includeReducer',
        message: 'Include a reducer + source for fetching data?',
        default: false,
      },
    ];

    return this.prompt(prompts).then((props) => {
      // To access props later use this.props.propName;
      this.props = props;

      this.props.componentNameConstant = changeCase.constantCase(this.props.componentName);
      this.props.componentNameCamel = changeCase.camelCase(this.props.componentName);
    });
  },

  writing: function () {
    const {
      projectPath, componentPath, componentName, componentNameConstant, componentNameCamel,
      includeReducer,
    } = this.props;

    // Ignore certain template files based on config flags.
    const templateGlobsToIgnore = includeReducer ? '' : 'reducers|source|source.test';

    const templates = glob.sync(`${__dirname}/templates/**/!(${templateGlobsToIgnore}).ejs`);

    // Copy over all the template files, filling in the placeholders.
    templates.forEach((templatePath) => {
      const filename = path.relative(`${__dirname}/templates`, templatePath);

      this.fs.copyTpl(
        this.templatePath(filename),
        path.join(projectPath, componentPath, componentName, filename.replace('.ejs', '.js')),
        this.props
      );
    });

    // Tweak constants file.
    const constantsPath = path.join(projectPath, 'src', 'constants.js');
    this._insertLineBeforeMatch(
      'new-sceneKeys-here',
      `${this._getIndent(2)}${componentNameConstant}: '${componentNameConstant}',`,
      constantsPath);
    this._insertLineBeforeMatch(
      'new-namespaces-here',
      `${this._getIndent(2)}${componentNameConstant}: '${componentName}',`,
      constantsPath);

    // Tweak reducers index.
    if (includeReducer) {
      const reducersPath = path.join(projectPath, 'src', 'reducers.index.js');
      const newReducerPath = `./components/scenes/${componentName}/reducers`;
      this._insertLineBeforeMatch(
        'new-imports-here',
        `${this._getIndent(0)}import { ${componentNameCamel}Reducer } from '${newReducerPath}';`,
        reducersPath);
      this._insertLineBeforeMatch(
        'new-reducers-here',
        `${this._getIndent(1)}${componentNameCamel}: ${componentNameCamel}Reducer,`,
        reducersPath);
    }

    // Tweak workflows index.
    const workflowsPath = path.join(projectPath, 'src', 'workflows.index.js');
    const newWorkflowPath = `./components/scenes/${componentName}/workflow`;
    this._insertLineBeforeMatch(
      'new-imports-here',
      `${this._getIndent(0)}import ${componentNameCamel}Workflow from '${newWorkflowPath}';`,
      workflowsPath);
    this._insertLineBeforeMatch(
      'new-workflows-here',
      `${this._getIndent(2)}${componentNameCamel}Workflow(),`,
      workflowsPath);

    // Tweak route list.
    const routerPath = path.join(projectPath, 'src', 'app-utils.js');
    this._insertLineBeforeMatch(
      'new-imports-here',
      `${this._getIndent(4)}require('./components/scenes/${componentName}/index').default,`,
      routerPath);
  },

  /** Indent 2 spaces per tab, escaping spaces for `sed`. */
  _getIndent: (numTabs) => '\\ '.repeat(numTabs * 2),

  // TODO: Fix -i flag so it works on regular linux. Empty string is required to make it work on OSX.
  /** Spawn a shell command that inserts lineToAdd directly after the matched text, followed by a newline. */
  _insertLineBeforeMatch: function (matcher, lineToAdd, filePath) {
    this.spawnCommand('sed', ['-i', '', `/${matcher}/i\\\n${lineToAdd}\n`, filePath]);
  },

});
