// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');
const readLastLine = require('read-last-line');

var getLogs = new Command("get-logs", true);

getLogs.addStep(/(?:([\d]+) )?logs(?: from (.*))?/i, null, async function(message, user){
	return new Promise(function(resolve, reject) {
		//Match it again
		matches = message.text.match(/(?:([\d]+) )?logs(?: from (.*))?/i);
		
		var amountOfLogs = matches[1], fromDate = matches[2], logFilename = null;
		if(fromDate == undefined){
			var d = new Date();
			logFilename = parseInt(d.getMonth()) + 1;
			logFilename = d.getFullYear() + "-" + logFilename + "-" + d.getDate();
		}else{
			logFilename = fromDate;
		}

		readLastLine.read("logs/" + logFilename + ".log.txt", amountOfLogs || 1000000).then(function (lines) {
			var response = {
				"attachments": [
					{
						"title": "Last " + (amountOfLogs || "all") + " logs from " + logFilename,
						"text": "```" + lines + "```",
						"footer": "Sneaky Earl Enterprises",
						"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png"
					}
				]
			};
			resolve(response);
		}).catch(function (err) {
			var response = {
				"attachments": [
					{
						"title": "Error with log-file",
						"text": err.message,
						"footer": "Sneaky Earl Enterprises",
						"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
						"color": "#d40201"
					}
				]
			};
			reject(response);
		});
	});
});

module.exports = getLogs;