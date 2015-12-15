/*
**  Copyright (C) 2015 Accountable Care Transactions, Inc.
**  Written by Jonathan Abbett <jonathan@act.md>
**
**  Licensed under the Apache License, Version 2.0 (the "License");
**  you may not use this file except in compliance with the License.
**  You may obtain a copy of the License at
**
**  http://www.apache.org/licenses/LICENSE-2.0
**
**  Unless required by applicable law or agreed to in writing, software
**  distributed under the License is distributed on an "AS IS" BASIS,
**  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
**  See the License for the specific language governing permissions and
**  limitations under the License.
*/
'use strict';
var fs = require('fs');
var tmp = require('tmp');
var _ = require('underscore');
var Handlebars = require('handlebars');
var Gherkin = require('gherkin');
var OfficeClippy = require('office-clippy');

module.exports = function(files, options) {

    if (!options) {
        options = {};
    }

    var features,
        parser = new Gherkin.Parser();

    // Load and parse all our feature files
    features = _.map(files, function(f) {
        var feature;

        try {
            feature = parser.parse(
                new Gherkin.TokenScanner(fs.readFileSync(f, 'utf8')),
                new Gherkin.TokenMatcher());
        } catch (e) {
            console.warn("Could not read or parse `"+f+"`: " + e);
            return;
        }

        if (options.exclusion_tag) {
            // Don't include this feature in the report
            if (_.findWhere(feature.tags, { name: options.exclusion_tag })) {
                return;
            }

            // Filter excluded scenarios
            feature.scenarioDefinitions = feature.scenarioDefinitions.filter(function(scenario) {
                return _.findWhere(scenario.tags, { name: options.exclusion_tag }) === undefined;
            });
        }

        // Split multi-line descriptions into a neat array
        if (feature.description && feature.description.length) {
            feature.descriptionLines = feature.description.split("\n")
                .map(function(line) { return line.trim(); });
        }

        return feature;
    });

    // Get rid of all the undefined (i.e. excluded) features
    features = _.reject(features, function(feature) {
        return feature === undefined;
    });

    switch (options.format) {
        case "markdown":
            var template = Handlebars.compile(
                '## {{{name}}}\n' +
                '{{#if descriptionLines}}{{#each descriptionLines}}> {{{this}}}\n{{/each}}{{/if}}\n' +
                '{{#each scenarioDefinitions}}- {{{name}}}\n{{/each}}');

            var markdown = _.map(features, function(feature) {
                return template(feature);
            }).join("\n\n");

            if (options.destination) {
                fs.writeFileSync(options.destination, markdown);
            } else {
                return markdown;
            }

            break;
        case "word":
            if (!options.destination) {
                throw new Error("Must provide a destination to store Word output");
            }

            var docx = OfficeClippy.docx,
                doc = docx.create(),
                exporter = OfficeClippy.exporter,
                output = fs.createWriteStream(options.destination);

            _.each(features, function(feature) {
                doc.addParagraph(docx.createParagraph(feature.name).heading1());
                if (feature.description) {
                    // Strip newlines
                    var desc = feature.description.replace(/(\r\n|\n|\r)/gm,"").trim();
                    var descText = docx.createText(desc);
                    var descPara = docx.createParagraph();
                    descText.italic();
                    descPara.addText(descText);
                    doc.addParagraph(descPara);
                }
                _.each(feature.scenarioDefinitions, function(scenario) {
                    doc.addParagraph(docx.createParagraph(scenario.name).bullet());
                });
            });

            exporter.local(output, doc);
            return output;
            break;
        default:
            return features;
    }

};