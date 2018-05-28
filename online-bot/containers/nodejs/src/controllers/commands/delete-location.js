// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');

var deleteLocation = new Command("delete-location");

//Require user to say "start steps" to start
deleteLocation.addStep(/^delete/i, {text: "Sure, what location would you like to delete?"}, async function(message, user){
	return new Promise(function(resolve, reject) {
		//Does a location with this name exist?
		models.Location.findOne({name: message.text, user_id: user.user_id}).remove(function(err, location){
			if(location.n <= 0){
				var response = {
					"attachments": [{
							"title": "Error: 404",
							"text": "No location with this name found.. :cry:",
							"footer": "Sneaky Earl Enterprises",
							"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
							"color": "#d40201"
						}]
				};
				reject(response);
			}else{
				var response = {
					"attachments": [{
							"title": "Yes, that's gone!",
							"text": "Location '" + message.text + "' removed! :boom:",
							"footer": "Sneaky Earl Enterprises",
							"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
							"color": "#50af66"
						}]
				};
				resolve(response);
			}
		});
	});
});


module.exports = deleteLocation;