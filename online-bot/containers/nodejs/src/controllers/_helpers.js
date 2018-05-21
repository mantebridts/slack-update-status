const { WebClient, RTMClient } = require('@slack/client');
const chalk = require('chalk');
const fs = require('fs');
var stream = null, logFilename = null;

//Local dependancies
const models = require('./../models/index');
const config = require("./../config/config");

// Log some stuff

/*
How to create a good log:

    _log(scope, message, slack);

Explanation:
    scope: string
    message: string
    slack: false | {
        title: string
        type: string ("danger" | "success" | "info")
    }
*/

global._log = function(scope, message, slack){
	var slack = typeof slack  !== 'undefined' ?  slack  : false;
	function _prefix(n) {return n<10 ? "0"+n : n}
	var date = new Date();

	//Log even in console
	console.log(chalk.gray("[" + scope + "] - " + _prefix(date.getHours()) + ":" + _prefix(date.getMinutes()) + ":" + _prefix(date.getSeconds()) + " ") + message);

	//Post to Slack #earl-development if necessary, can be either false or an object
	if(slack !== false){
		var attachment = {
            "title": slack.title,
            "text": message,
            "footer": "Sneaky Earl Enterprises",
            "footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
            "color": ""
        };
		switch(slack.type){
			case "danger":
				attachment.color = "#d40201";
				break;
			case "success":
				attachment.color = "#50af66";
				break;
			case "info":
			default:
				attachment.color = "";
				break;
		}
		//Post to channel
		const webclient = new WebClient(config.bot.access_token);
		webclient.chat.postMessage({channel: "CANEXF8RL", text: "", attachments: [attachment] }).then((res) => {
			//Yay
		})
		.catch(function(error){
			//FML
		});
	}

	//Write to log-file
	//Does the logfile exist, and is it from today? If not, create it
	var d = new Date();
	if(stream == null || logFilename == null || (d > new Date(new Date(logFilename).getTime()+1000*60*60*24))){
		logFilename = parseInt(d.getMonth()) + 1;
		logFilename = d.getFullYear() + "-" + logFilename + "-" + d.getDate();
		stream = fs.createWriteStream("logs/" + logFilename + ".log.txt", {flags: 'a'});
	}
	stream.write(("[" + scope + "] - " + _prefix(date.getHours()) + ":" + _prefix(date.getMinutes()) + ":" + _prefix(date.getSeconds()) + " ") + message + "\n");
}

//Update a slack-status
global._updateSlackStatus = function(token, status){
	const web = new WebClient(token);
	web.users.profile.set({profile: status} ).then((res) => {
	//Yay
	})
	.catch(function(error){
	  	if(error.data.error == 'profile_status_set_failed_not_valid_emoji'){
	  		_updateSlackStatus(token, {status_text: "Wrong emoji provided!", status_emoji: ":question:"})
	  	}
	});
}

// Run period task to clear the status of people who didn't send an update in the last 15min
setInterval(clearStatuses, 1000*60*10);

//Helper functions
function clearStatuses(){
	models.User.find({last_active: { $lte: new Date() - 15*60*1000 }, location: { $ne: {address: "", id: ""}}}, function(err, users){
		if(users){
			// Loop over these users, and clear their statuses
			for (var i = 0; i< users.length; i++){
				//Update field in db
				models.User.findOneAndUpdate({_id: users[i].id}, {location: { address: "", id: ""}}, function(err, user){
					//Do nothing
				})
				_updateSlackStatus(users[i].token, {status_text: "", status_emoji: ""});
			}
		}
	});
}