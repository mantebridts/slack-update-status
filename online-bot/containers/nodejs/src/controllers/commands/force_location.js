// Require models
const models = require('./../../models/index');

module.exports = {
	pattern: /^@([^)]+)*/i, // ex: "@Kontich"
	exec: async function(message, user){
		return new Promise(function(resolve, reject) {

			//Fetch location from db
			models.Location.findOne({name: message[1], user_id: user.user_id}, "_id name status", function(err, location){
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
	}
};