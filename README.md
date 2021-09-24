## What is this?

**This loader is no longer maintained**

This webpack loader reads your angular module dependencies and requires the files that define those modules.

It accepts two arguments:

#### src
This tells the loader which files to analyse for module definitions

#### alias
This tells the loader which module names map to which vendor locations

## Example

    { test: /\.js$/, exclude: /node_modules|bower_components/,
      loaders: [
        'ng-require?' +
            JSON.stringify({
                src: './app/**/*.js',
                alias: {
                    'xeditable': 'angular-xeditable/dist/js/xeditable.min.js',
                    'ui.router.state': 'angular-ui-router'
                }
            })
    ]}
