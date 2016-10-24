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
        default: 'src/components/App',
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
    ];

    return this.prompt(prompts).then((props) => {
      // To access props later use this.props.propName;
      this.props = props;

      this.props.componentNameConstant = changeCase.constantCase(this.props.componentName);
      this.props.componentNameCamel = changeCase.camelCase(this.props.componentName);
    });
  },

  writing: function () {
    const { projectPath, componentPath, componentName, componentNameConstant, componentNameCamel } = this.props;

    const templates = glob.sync(`${__dirname}/templates/**/*.ejs`);

    templates.forEach((templatePath) => {
      const filename = path.relative(`${__dirname}/templates`, templatePath);

      this.fs.copyTpl(
        this.templatePath(filename),
        path.join(projectPath, componentPath, componentName, filename.replace('.ejs', '.js')),
        this.props
      );
    });

    const constantsPath = path.join(projectPath, 'src', 'constants.js');
    this._insertLineBeforeMatch(
      'new-constants-here',
      `${this._getSedIndent(2)}${componentNameConstant}: '${componentNameConstant}',`,
      constantsPath);

    const workflowsPath = path.join(projectPath, 'src', 'workflows.index.js');
    this._insertLineBeforeMatch(
      'new-imports-here',
      `${this._getSedIndent(0)}import ${componentNameCamel}Workflow from './components/App/${componentName}/workflow';`,
      workflowsPath);
    this._insertLineBeforeMatch(
      'new-workflows-here',
      `${this._getSedIndent(2)}${componentNameCamel}Workflow(),`,
      workflowsPath);

    const routerPath = path.join(projectPath, 'src', 'components', 'App', 'navigation', 'router.js');
    this._insertLineBeforeMatch(
      'new-imports-here',
      `${this._getSedIndent(1)}const ${componentName} = require('../${componentName}').default;`,
      routerPath);
    this._insertLineBeforeMatch(
      'new-routes-here',
      `${this._getSedIndent(1)}routes[constants.sceneKey.${componentNameConstant}] = () => ${componentName};`,
      routerPath);
  },

  /** Indent 2 spaces per tab, escaping spaces for `sed`. */
  _getSedIndent: (numTabs) => '\\ '.repeat(numTabs * 2),

  // TODO: Fix -i flag so it works on regular linux. Empty string is required to make it work on OSX.
  /** Spawn a shell command that inserts lineToAdd directly after the matched text, followed by a newline. */
  _insertLineBeforeMatch: function (matcher, lineToAdd, filePath) {
    this.spawnCommand('sed', ['-i', '', `/${matcher}/i\\\n${lineToAdd}\n`, filePath]);
  },

});
