// Online dependencies
const { WebClient, RTMClient } = require('@slack/client');

// Local dependencies
const config = require('./../config/config');
const models = require('./../models/index');
const commands = require("./commands/index");

const bot = {
	//Add RTM object to bot
	rtm : null,

	//Start bot and log startup
	boot: function(){
		this.rtm = new RTMClient(config.bot.access_token);
		this.rtm.start();
		
		this.listen();
	},

	//Continiously listen to input
	listen: function(){
		_log("Bot", "Bot started listening");
		this.rtm.on('message', (message) => {
  			// For structure of `event`, see https://api.slack.com/events/message

			// Skip messages that are from a bot or my own user ID
			if ( (message.subtype && message.subtype === 'bot_message') || (!message.subtype && message.user === this.rtm.activeUserId) ) {
				return;
			}

			// Log the message
			_log("Bot", `(channel:${message.channel}) ${message.user} says: ${message.text}`);
			var _this = this;
			this.processInput(message).then(function(output){
				_this.respond(output.channel, output.reply);
			}).catch(function(error){
				console.log(error);
			});
		});
	},

	processInput: async function(message){
		return new Promise(function(resolve, reject){
			var output = {
				channel: message.channel, 
				reply: "Didn't quite catch that.."
			};

			//Check if user is already registered.
			models.User.findOne({user_id: message.user}, "user_id", function(err, user){
				if(user !== null){
					//Good, we know this user, start working

					//Match input against known commands
					Object.keys(commands).forEach(function(command) {
						if(message.text.match(commands[command].pattern)){
							//Pattern matched, execute it
							output.reply = commands[command].exec(message.text);
						}
					});
				}else{
					//Ask user to authorize Bot
					output = {
						channel: message.channel, 
						reply: "Hi stranger, I don't know you at all.."
					};
				}
				
				resolve(output);
			});
		})
	},

	respond: function(channelId, message){
  		//Respond to message
		this.rtm.sendMessage(message, channelId)
  		.then((res) => {
    		// `res` contains information about the posted message
  		}).catch(console.error);
	}
};

module.exports = bot;