const path = require('path');
const glob = require('glob');
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const changeCase = require('change-case');

module.exports = class extends Generator {

  prompting() {
    this.log(yosay(
      `Welcome to the astounding ${chalk.red('crib-rn-scene')} generator!`
    ));

    const prompts = [
      {
        type: 'input',
        name: 'projectPath',
        message: 'Absolute path to your React Native project',
        default: '/Users/klap-hotel/Dev/cribspot/apps/home-app/',
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
  }

  writing() {
    const {
      projectPath, componentPath, componentName, componentNameConstant, componentNameCamel,
      includeReducer,
    } = this.props;

    // Ignore certain template files based on config flags.
    const templateGlobsToIgnore = includeReducer ? '' : 'reducers|source|source.test|mockName';

    const relativeTemplates = glob.sync(`${__dirname}/templates/relative/**/!(${templateGlobsToIgnore}).ejs`);

    // Copy over all the template files, filling in the placeholders.
    relativeTemplates.forEach((templatePath) => {
      const filePath = path.relative(`${__dirname}/templates/relative`, templatePath);
      const formattedPath = filePath.replace('.ejs', '.js').replace('Name', componentName);

      this.fs.copyTpl(
        this.templatePath(`relative/${filePath}`),
        path.join(projectPath, componentPath, componentName, formattedPath),
        this.props
      );
    });

    const rootTemplates = glob.sync(`${__dirname}/templates/root/**/!(${templateGlobsToIgnore}).ejs`);

    // Copy over all the template files, filling in the placeholders.
    rootTemplates.forEach((templatePath) => {
      const filePath = path.relative(`${__dirname}/templates/root`, templatePath);
      const formattedPath = filePath.replace('.ejs', '.js').replace('Name', componentName);

      this.fs.copyTpl(
        this.templatePath(`root/${filePath}`),
        path.join(projectPath, formattedPath),
        this.props
      );
    });

    // Tweak constants file.
    const constantsPath = path.join(projectPath, 'src', 'constants.js');
    this._insertLineBeforeMatch(
      'new-sceneKeys-here',
      `${getIndent(2)}${componentNameConstant}: '${componentNameConstant}',`,
      constantsPath);
    this._insertLineBeforeMatch(
      'new-namespaces-here',
      `${getIndent(2)}${componentNameConstant}: '${componentName}',`,
      constantsPath);

    if (includeReducer) {
      // Tweak reducers index.
      const reducersPath = path.join(projectPath, 'src', 'reducers.index.js');
      const reducerImportPath = `./components/scenes/${componentName}/reducers`;
      this._insertLineBeforeMatch(
        'new-imports-here',
        `import { ${componentName}Reducer } from '${reducerImportPath}';`,
        reducersPath);
      this._insertLineBeforeMatch(
        'new-reducers-here',
        `${getIndent(1)}${componentNameCamel}: ${componentName}Reducer.reduce,`,
        reducersPath);
    }

    // Tweak workflows index.
    const workflowsPath = path.join(projectPath, 'src', 'workflows.index.js');
    const workflowImportPath = `./components/scenes/${componentName}/workflow`;
    this._insertLineBeforeMatch(
      'new-imports-here',
      `import ${componentNameCamel}Workflow from '${workflowImportPath}';`,
      workflowsPath);
    this._insertLineBeforeMatch(
      'new-workflows-here',
      `${getIndent(2)}call(${componentNameCamel}Workflow),`,
      workflowsPath);

    // Tweak route list.
    const routerPath = path.join(projectPath, 'src', 'app-utils.js');
    this._insertLineBeforeMatch(
      'new-imports-here',
      `${getIndent(4)}require('./components/scenes/${componentName}/index').default,`,
      routerPath);

    if (includeReducer) {
      // Tweak populatedState.
      const populatedStatePath = path.join(projectPath, 'src/mock-data/states/populatedState.js');
      this._insertLineBeforeMatch(
        'new-actions-here',
        `import { ${componentName}Actions } from '../../components/scenes/${componentName}/actions';`,
        populatedStatePath);
      this._insertLineBeforeMatch(
        'new-data-here',
        `import { mock${componentName} } from '../responses/mock${componentName}';`,
        populatedStatePath);
      this._insertLineBeforeMatch(
        'new-reducers-here',
        `populatedState.${componentNameCamel} = reducersMap.${componentNameCamel}(undefined, ${componentName}Actions.set(mock${componentName}, '/link'));`,
        populatedStatePath);
      this._insertBlankLineBeforeMatch('new-reducers-here', populatedStatePath);

      // Tweak loadingState.
      const loadingStatePath = path.join(projectPath, 'src/mock-data/states/loadingState.js');
      this._insertLineBeforeMatch(
        'new-actions-here',
        `import { ${componentName}Actions } from '../../components/scenes/${componentName}/actions';`,
        loadingStatePath);
      this._insertLineBeforeMatch(
        'new-reducers-here',
        `loadingState.${componentNameCamel} = reducersMap.${componentNameCamel}(undefined, ${componentName}Actions.get());`,
        loadingStatePath);
      this._insertBlankLineBeforeMatch('new-reducers-here', loadingStatePath);

      // Tweak errorState.
      const errorStatePath = path.join(projectPath, 'src/mock-data/states/errorState.js');
      this._insertLineBeforeMatch(
        'new-actions-here',
        `import { ${componentName}Actions } from '../../components/scenes/${componentName}/actions';`,
        errorStatePath);
      this._insertLineBeforeMatch(
        'new-reducers-here',
        `errorState.${componentNameCamel} = reducersMap.${componentNameCamel}(undefined, ${componentName}Actions.failedToGet(error));`,
        errorStatePath);
      this._insertBlankLineBeforeMatch('new-reducers-here', errorStatePath);

      // Tweak mock data index.js.
      const mockDataIndexPath = path.join(projectPath, 'src/mock-data/responses/index.js');
      this._insertLineBeforeMatch(
        'new-exports-here',
        `export * from './mock${componentName}';`,
        mockDataIndexPath);

      // Tweak mock fetch responses.
      const mockDataPath = path.join(projectPath, 'src/mock-data/utils/fetchMockData.js');
      this._insertLineBeforeMatch(
        'new-endpoints-here',
        `${getIndent(2)}'/api/${componentNameCamel}': createMockResponse({ ${componentNameCamel}: mockResponse.mock${componentName}.toJS() }),`,
        mockDataPath);
    }
  }

  // --- Replacers.
  //
  // Note: These commands require `gsed` (GNU-sed) to be installed, for cross-platform compatibility.
  // You can use `brew install gnu-sed`, or `alias gsed=sed` if you're already using it.
  //
  // More `sed` info here:
  // http://www.grymoire.com/Unix/Sed.html
  // http://sed.sourceforge.net/sed1line.txt

  /** Spawn a shell command that inserts lineToAdd directly above the matched text, followed by a newline. */
  _insertLineBeforeMatch(matcher, lineToAdd, filePath) {
    this.spawnCommand('gsed', ['-i', `/${matcher}/ i ${lineToAdd}`, filePath]);
  }

  /** Spawn a shell command that inserts a blank line directly above the matched text. */
  _insertBlankLineBeforeMatch(matcher, filePath) {
    this.spawnCommand('gsed', ['-i', `/${matcher}/ {x;p;x;}`, filePath]);
  }

};

/** Indent 2 spaces per tab, escaping spaces for `sed`. */
function getIndent(numTabs) {
  return '\\ '.repeat(numTabs * 2);
}
