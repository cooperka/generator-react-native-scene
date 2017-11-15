# Generator for React Native scenes

Yeoman generator for React Native scenes (aka screens/routes/views) customized for Cribspot's mobile apps.

The scenes that are generated rely on the following libraries, along with some proprietary helper methods which you could easily stub out yourself; have a look at the [`*.ejs`](https://github.com/cribspot/generator-react-native-scene/find/master) files for specific details.

- [react-navigation](https://github.com/react-community/react-navigation)
- [redux-saga](https://github.com/redux-saga/redux-saga)
- [reselect](https://github.com/reactjs/reselect)
- [immutable](https://github.com/facebook/immutable-js)

## Installation

1. Install [Yeoman](http://yeoman.io)
(assuming you already have [npm](https://nodejs.org/en/download/)):

    ```bash
    npm install -g yo
    ```

2. Download and link this generator:

    ```bash
    git clone https://github.com/cribspot/generator-react-native-scene.git
    cd generator-react-native-scene
    npm link
    ```

3. Make sure you have a working copy of `gsed` (the GNU **s**tream **ed**itor)
for inserting lines of code into existing files during generation.

    You can use `brew install gnu-sed` on OSX, or `alias gsed=sed` if you're already using it for `sed`.

## Usage

Run the generator wherever you want and follow the prompts:

```bash
yo react-native-scene
```

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).
