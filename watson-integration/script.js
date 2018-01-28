'use strict';

var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
var childProcess = require('child_process');
var fs = require('fs');

var personality_insights = new PersonalityInsightsV3({
  username:  "c0c5871c-ad6a-43ff-8719-4d4ea28087ac",
  password: "2q1fliPGme4V",
  version_date: '2016-10-19'
});

// Running keylogger script to get the user input

function runScript(scriptPath, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
    var invoked = false;

    var process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

}



// Call to function to run script
runScript('./keylogger/keylogger_testing.js', function (err) {
    if (err) throw err;
    console.log('finished running keylogger_testing.js');
});

// End of keylogger run and data is available to be manipulated

/*
 * English example:
 *   'text' parameter contains the input text.
 */

var file = fs.readFileSync("/var/log/keystroke.log", "utf8");
console.log(file);

// Sanity Check with test data
personality_insights.profile(
  {
    content: 'The use of this video is allowed under failr dealing as it is for educational purposes. Education is one of the allowable uses for any work that is protected by the copyright laws in Canada. Since the group is presenting this work to a small groupand does not plan on any further distribution and revenue generation, the use is considered fair dealing. Since there is no cash or cash value of the prize, the purpose of this video is non-commercial and thus the group can use the video under user rights. The group must give proper credit to the original source of the video in order to be compliant of the copyright laws of Canadian Law.',
    content_type: 'text/plain',
    consumption_preferences: true
  },
  function(err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      //console.log(JSON.stringify(response, null, 2));
      console.log("Success!");
    }
  }
);

/*
 * CSV output example:
 * https://console.bluemix.net/docs/services/personality-insights/output-csv.html#outputCSV
 */
personality_insights
  .profile_csv({
    content: file,
    content_type: 'text/plain',
    csv_headers: true
  })
  .pipe(fs.createWriteStream('./insight_output.csv'));