// Require models
const models = require('./../../models/index');

module.exports = {
	pattern: /list locations/i, // ex: "list locations"
	exec: async function(message, user){
		return new Promise(function(resolve, reject) {
			//Fetch all locations from user
			models.Location.find({user_id: user.user_id}, "name regex status", function(err, locations){
				if(locations.length == 0){
					var response = {
					    "attachments": [
					        {
					            "title": "Error: 404",
					            "text": "No registered locations found :cry:",
					            "footer": "Sneaky Earl Enterprises",
					            "footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
					            "color": "#d40201"
					        }
					    ]
					};
					reject(response);
				}else{
					var response = {
						"text": "A gorgeous list of your locations :sparkles:",
					    "attachments": []
					};
					for(var i=0;i < locations.length;i++){
						var attachment = {
							"title": locations[i]['name'], 
							"callback_id": "location.delete." + locations[i]._id,
            				"attachment_type": "default",
							"fields": [
								{
									title: "Matches",
									value: "",
									short: true
								},
								{
									title: "Status",
									value: "'" + locations[i].status.status_text + " " + locations[i].status.status_emoji + "'",
									short: true
								}
							],
							"actions": [
				                {
				                    "name": "delete",
				                    "text": "Delete location",
				                    "style": "danger",
				                    "type": "button",
				                    "value": "true",
				                    "confirm": {
				                        "title": "Are you sure?",
				                        "text": "I mean, really sure?",
				                        "ok_text": "Yes",
				                        "dismiss_text": "No"
				                    }
				                }
				            ]
						};
						for(var j=0; j < locations[i]['regex'].length; j++){
							attachment.fields[0]['value'] += "`- " + locations[i]['regex'][j] + "`\n";
						}

						response.attachments.push(attachment);
					}	
					response.attachments.push({
						"text": "",
			            "footer": "Sneaky Earl Enterprises",
			            "footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
			        });
					resolve(response);
				}
			});
  		});
	}
};