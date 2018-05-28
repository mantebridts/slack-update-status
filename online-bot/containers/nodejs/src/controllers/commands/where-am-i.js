// Require local dependancies
const Command = require('./../../classes/Command');
const models = require('./../../models/index');

var whereAmI = new Command("where-am-i", true);

whereAmI.addStep(/^where am i/i, null, async function(message, user){
	return new Promise(function(resolve, reject) {
		//Fetch location from db
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
});

module.exports = whereAmI;