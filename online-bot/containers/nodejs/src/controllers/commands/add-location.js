// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');

var addLocation = new Command("add-location");

//name: body[0], regex: [body[1]], status: {'status_text': body[2], 'status_emoji': ":" + body[3] + ":"

addLocation.addStep(/^add location/i, "Super, let's start, hoe wil je de nieuwe locatie noemen?", async function(message, user){
	return new Promise(function(resolve, reject) {
		addLocation.data = null;

		//Does a location with this name already exist?
		models.Location.findOne({name: message.text, user_id: user.user_id}, "_id", function(err, location){
			if(location){
				var response = {
					"attachments": [
						{
							"title": "Error: 400",
							"text": "Er bestaat al een locatie met deze naam voor jou..",
							"footer": "Sneaky Earl Enterprises",
							"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
							"color": "#d40201"
						}
					]
				};
				reject(response);
			}else{
				addLocation.data = {
					"name": message.text
				}
				resolve(true);
			}
		});
	});
});
addLocation.addStep(null, "Perfect! Moeilijkere vraag nu: welke stukjes adres moeten er herkend worden als deze locatie? Je mag ze afscheiden met een ';'.\n_(Bv. `Gent;Dok Noord;Ghent`)_", async function(message, user){
	return new Promise(function(resolve, reject) {
		var regex = message.text.split(";");
		addLocation.addData({"regex": regex});
		resolve(true);
	});
});
addLocation.addStep(null, "Okay, welke statusmelding wil je tonen bij deze locatie?", async function(message, user){
	return new Promise(function(resolve, reject) {
		addLocation.addData({"status_text": message.text});
		resolve(true);
	});
});
addLocation.addStep(null, "Goed, laatste vraag: aan welke emoji had je gedacht voor deze status (zonder ':' graag)?", async function(message, user){
	return new Promise(function(resolve, reject) {
		addLocation.addData({"status_emoji": message.text});
		var data = addLocation.data;
		console.log(data);
		const location = new models.Location({user_id: user.user_id, name: data.name, regex: data.regex, status: {'status_text': data.status_text, 'status_emoji': ":" + data.status_emoji + ":"}});
		location.save().then(function(l){
			if(l){
				var response = {
					"attachments": [
						{
							"title": "Locatie toegevoegd",
							"text": "Locatie '" + l['name'] + "' is toegevoegd aan jouw lijst!",
							"footer": "Sneaky Earl Enterprises",
							"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
							"color": "",
							fields: [
								{
									title: "Matches",
									value: "`- " + l['regex'][0] + "`",
									short: true
								},
								{
									title: "Status",
									value: l.status.status_text + " " + l.status.status_emoji,
									short: true
								}
							]
						}
					]
				};
				resolve(response);
			} else {
				var response = {
					"attachments": [
						{
							"title": "Error: 0",
							"text": "Congrats, you broke me :skull_and_crossbones:",
							"footer": "Sneaky Earl Enterprises",
							"footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
							"color": "#d40201"
						}
					]
				};
				reject(response);
			}
		});
	});
});

module.exports = addLocation;