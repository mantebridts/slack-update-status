// Require models
const models = require('./../../models/index');

module.exports = {
	pattern: /add location: ([^)]+)*/i, // ex: "add location: Kontich;regex_voor_kontich;@ Cronos HQ;cronos"
	exec: async function(message, user){
		return new Promise(function(resolve, reject) {
			var body = message[1].split(";");

			//Does a location with this name already exist?
			models.Location.findOne({name: body[0], user_id: user.user_id}, "_id", function(err, location){
				if(location){
					var response = {
					    "attachments": [
					        {
					            "title": "Error: 400",
					            "text": "A location with this name already exists..",
					            "footer": "Sneaky Earl Enterprises",
					            "footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
					            "color": "#d40201"
					        }
					    ]
					};
					reject(response);
				}else{
					const location = new models.Location({user_id: user.user_id, name: body[0], regex: [body[1]], status: {'status_text': body[2], 'status_emoji': ":" + body[3] + ":"}});
					location.save().then(function(l){
						if(l){
							var response = {
							    "attachments": [
							        {
							            "title": "Location added",
							            "text": "I added " + l['name'] + " to your locations!",
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
						}else{
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
				}
			});
  		});
	}
};