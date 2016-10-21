const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = yeoman.Base.extend({

  prompting: function () {
    this.log(yosay(
      `Welcome to the astounding ${chalk.red('crib-rn-scene-basic')} generator!`
    ));

    const prompts = [
      {
        type: 'input',
        name: 'componentName',
        message: 'New component\'s name',
        default: 'MyComponent',
      },
    ];

    return this.prompt(prompts).then((props) => {
      // To access props later use this.props.propName;
      this.props = props;
    });
  },

  writing: function () {
    this.fs.copy(
      this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt')
    );
  },

  install: function () {
    this.installDependencies();
  },

});
