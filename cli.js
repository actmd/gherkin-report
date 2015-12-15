#!/usr/bin/env node
'use strict';
var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');
var gherkin_report = require('./');

function printHelp() {
    console.log([
        pkg.description,
        '',
        'Usage',
        '  $ gherkin-report [options] files',
        '',
        'Example',
        '  $ gherkin-report --format=markdown --exclude=excludeTag *.feature'
    ].join('\n'));
}

if (argv.v || argv.version) {
    console.log(pkg.version);
    return;
}

if (argv.h || argv.help || argv._.length === 0) {
    printHelp();
    return;
}

// Defaults
var options = {
    format: "markdown",
    exclude: "@excludeFromReport"
};

if (argv.destination) {
    options.destination = argv.destination;
}

if (argv.format) {
    options.format = argv.format;
    if (options.format == "word" && !options.destination) {
        throw new Error("Must provide --destination option to output in `word` format");
    }
}

if (argv.exclude) {
    if (!argv.exclude.startsWith("@")) {
        argv.exclude = "@" + argv.exclude;
    }
    options.exclude = argv.exclude;
}

gherkin_report(argv._, options);