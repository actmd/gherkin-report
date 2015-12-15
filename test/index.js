'use strict';
var fs = require('fs');
var crypto = require('crypto');
var assert = require('assert');
var gherkin_report = require('../');

var feature_files = ['test/fixtures/mrn.feature', 'test/fixtures/patientSummary.feature', 'test/fixtures/skip.feature'],
    temp_word_filename;

before(function() {
    temp_word_filename = "test-" + crypto.randomBytes(4).readUInt32LE(0) + ".docx";
});

after(function() {
    // remove the temp word file if it exists
    fs.unlinkSync(temp_word_filename);
});

it("returns an array of parsed features by default", function() {
    var result = gherkin_report(feature_files);
    assert(result.length == 3);
    assert(result[0].name == "Medical Record Numbers");
    assert(result[1].name == "Team Patient Summary");
    assert(result[2].name == "Exclude This");
});

it("excludes features matching the exclusion tag", function() {
    var result = gherkin_report(feature_files, { exclusion_tag: "@excludeFromReport" });
    assert(result.length == 2);
});

it("excludes scenarios matching the exclusion tag", function() {
    var unfiltered_result = gherkin_report(feature_files);
    assert(unfiltered_result[0].scenarioDefinitions.length == 3);
    var filtered_result = gherkin_report(feature_files, { exclusion_tag: "@excludeFromReport" });
    assert(filtered_result[0].scenarioDefinitions.length == 2);
});

it("splits multi-line feature descriptions into a neat array", function() {
    var result = gherkin_report(feature_files);
    assert(result[1].description == '  This is the feature description.\n  Second line of description.');
    // Split into two array elements
    assert(result[1].descriptionLines.length == 2);
    // Each line has its whitespace trimmed
    assert(!result[1].descriptionLines[0].startsWith(" "));
    assert(!result[1].descriptionLines[1].startsWith(" "));
});

it("can return features in markdown format", function() {
    var expected = fs.readFileSync('test/expected/report.md', 'utf8'),
        result = gherkin_report(feature_files, { format: "markdown" });
    assert(expected == result);
});

it("can return features in Microsoft Word format", function(done) {
    var stats = fs.statSync('test/expected/report.docx', 'utf8'),
        output = gherkin_report(feature_files, { format: "word", destination: temp_word_filename });
    output.on('close', function () {
        // generated file is exactly same size as expected file
        assert(output.bytesWritten == stats.size);
        done();
    });
});
