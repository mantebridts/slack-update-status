const { WebClient, RTMClient } = require('@slack/client');

//Local dependancies
const models = require('./../models/index');

// Log some stuff
global._log = function(scope, message){
	function _prefix(n) {return n<10 ? "0"+n : n}
	var date = new Date();
	console.log("# ------ " + scope + " ------ #");
	console.log(_prefix(date.getHours()) + ":" + _prefix(date.getMinutes()) + ":" + _prefix(date.getSeconds()) + " --> " + message);
	console.log(" ");
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
	//Something's off, function not supported in Mongoose, write workaround
	/*models.User.findAndModify({ query: {last_active: { $lte: new Date() - 15*60*1000 }}, update: {location: {}}, new: true}, function(err, users){
		if(users){
			// Loop over these users, and clear their statuses
			for (var i = 0; i< users.length; i++){
				_updateSlackStatus(users[i].token, {status_text: "", status_emoji: ""});
			}
		}
	});*/
}