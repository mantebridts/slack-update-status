// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');

var forceLocation = new Command("force-location");

forceLocation.addStep(/^force/i, {text: "Okay, where would you like to appear?"}, async function(message, user){
	return new Promise(function(resolve, reject) {
		//Fetch location from db
		models.Location.findOne({name: message.text, user_id: user.user_id}, "_id name status", function(err, location){
			if(!location){
				reject("No location with this name found.. :cry:");
			}else{
            	models.User.findOneAndUpdate({user_id: user.user_id}, {location: { address: "(Forced) " + location.name, _id: location._id}, last_active: new Date()}, function(err, u){
					resolve("Location forced to " + location.name);
					_updateSlackStatus(u.token, location.status);
            	});
			}
		});
	});
});

module.exports = forceLocation;