// Require models
const models = require('./../../models/index');

module.exports = {
	pattern: /where am i/i,
	exec: async function(message, user){
		return new Promise(function(resolve, reject) {
			//Fetch all locations from user
			models.User.findOne({user_id: user.user_id}, "location", function(err, user){
				if(!user){
					// This should not happen, as we're capturing this case in a previous state already, see "bot.js(52)"
				}else{
					var response = {
					    "attachments": [
					        {
					            "title": "Search for runaway continues",
					            "text": "As the search for a local vandal in Flanders continues, local spies reported spotting a shady individual at the following location:\n```" + user.location.address + "```\n ",
					            "footer": "Sneaky Earl Enterprises",
					            "footer_icon": "https://slack-files2.s3-us-west-2.amazonaws.com/avatars/2018-05-10/360767394912_20ddf9c8466bea4c62be_96.png",
					            "color": ""
					        }
					    ]
					};
					resolve(response);
				}
			});
  		});
	}
};