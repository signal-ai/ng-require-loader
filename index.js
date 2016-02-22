var R = require('ramda');
var esprima = require('esprima');
var estraverse = require('estraverse');
var loaderUtils = require('loader-utils');
var path = require('path');

var getMappings = require('./mappings');

var _mapping = null;
function getMapping(globs) {
    if (!_mapping) {
        _mapping = getMappings(globs);
    }

    return _mapping;
}

function getAngularModuleDependencies(source) {
    var dependencies = [];

    estraverse.traverse(esprima.parse(source), {
        leave(node, parent) {
            if (node.type !== 'MemberExpression' || node.object.name !== 'angular' || node.property.name !== 'module' || !parent.arguments[1]) return;

            dependencies = dependencies.concat(R.map(R.prop('value'), parent.arguments[1].elements));
        }
    });

    return R.uniq(dependencies);
}

module.exports = function (source) {
    this.cacheable = true;

    var query = loaderUtils.parseQuery(this.query);
    var dependencies = getAngularModuleDependencies(source);

    if (dependencies.length > 0) {
        var mapping = getMapping(query.src);

        var requireStatements = R.compose(
            R.join(''),
            R.uniq,
            R.unnest,
            R.map(dependency => {
                if (mapping[dependency]) {
                    return R.map(fileName => 'require("'+ loaderUtils.urlToRequest(path.relative(this.context, fileName), '~') +'");\n', mapping[dependency]);
                } else {
                    return ['require("'+ (query.alias[dependency] || dependency) +'");\n']
                }
            })
        )(dependencies);

        source = requireStatements + source;
    }

    return source;
}
