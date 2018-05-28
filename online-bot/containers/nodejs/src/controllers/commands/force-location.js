// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');

var forceLocation = new Command("force-location");

forceLocation.addStep(/^force/i, {text: "Okay, waar wil je graag getoond worden?\n_(Antwoord met 'undo' op deze vraag om je geforceerde status weer te verwijderen)_"}, async function(message, user){
	return new Promise(function(resolve, reject) {
		if(message.text == "undo"){
        	models.User.findOneAndUpdate({user_id: user.user_id}, {location: null, last_active: new Date()}, function(err, u){
				resolve("Forced location verwijderd. Geef het even, en je bent weer ergens!");
        	});
		}else{		
			//Fetch location from db
			models.Location.findOne({name: message.text, user_id: user.user_id}, "_id name status", function(err, location){
				if(!location){
					reject("Geen locatie met deze naam gevonden.. :cry:");
				}else{
	            	models.User.findOneAndUpdate({user_id: user.user_id}, {location: { address: "(Forced) " + location.name, _id: location._id}, last_active: new Date()}, function(err, u){
						resolve("Locatie geforceerd naar " + location.name);
						_updateSlackStatus(u.token, location.status);
	            	});
				}
			});
		}
	});
});

module.exports = forceLocation;