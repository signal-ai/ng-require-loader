'use strict';

var glob = require('glob');
var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');
var R = require('ramda');

function getModuleDefinitions(fileName) {
    var file = fs.readFileSync(fileName, 'utf8');

    var moduleDefinitions = [];

    estraverse.traverse(esprima.parse(file), {
        leave(node, parent) {
            if (node.type !== 'MemberExpression' || node.object.name !== 'angular' || node.property.name !== 'module') return;

            moduleDefinitions.push(parent.arguments[0].value);
        }
    });

    return R.uniq(moduleDefinitions);
}

function getModuleDefinitionsFromGlobs(globs) {
    return R.reduce((acc, fileName) => {
        var moduleDefinitions = getModuleDefinitions(fileName);

        moduleDefinitions.forEach(definition => {
            acc[definition] = acc[definition] || [];

            acc[definition].push(fileName);

            acc[definition] = R.uniq(acc[definition]);
        });

        return acc;
    }, {}, glob.sync(globs));
}

module.exports = getModuleDefinitionsFromGlobs;
