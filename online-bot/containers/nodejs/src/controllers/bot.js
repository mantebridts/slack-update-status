// Online dependencies
const { WebClient, RTMClient } = require('@slack/client');

// Local dependencies
const config = require('./../config/config');
const models = require('./../models/index');
const commands = require("./commands/index");

const bot = {
	// Add RTM object to bot
	rtm : null,
	webclient: null,

	// Start bot and log startup
	boot: function() {
		this.rtm = new RTMClient(config.bot.access_token);
		this.webclient = new WebClient(config.bot.access_token);
		this.rtm.start();

		this.listen();
	},

	// Continiously listen to input
	listen: function() {
		_log("Bot", "Bot started listening");
		this.rtm.on('message', (message) => {
			// For structure of `event`, see https://api.slack.com/events/message

			// Skip messages that are from a bot or my own user ID
			if ((message.subtype && message.subtype === 'bot_message') || (!message.subtype && message.user === this.rtm.activeUserId)) {
				return;
			}

			// Skip messages not in direct message that are not directed to my own user ID
			if (message.channel.charAt(0) !== "D" && message.text.indexOf("<@" + this.rtm.activeUserId + ">") == -1){
				return;
			}

			// Skip messages that (if set) are not from my developer
			console.log(process.env.USER_ID);
			if (process.env.USER_ID !== undefined && message.user !== process.env.USER_ID){
				return;
			}

			// Log the message
			_log("Bot", `(channel:${message.channel}) ${message.user} says: ${message.text}`);

			var _this = this;
			if (message.user !== undefined && message.text !== undefined) {
				this.processInput(message).then(function(output) {
					_this.respond(output.channel, output.reply);
				}).catch(function (error) {
					_log("Bot", "An error occurred: " + error + "", {type: "error", title: ""});
				});
			}
		});
	},

	processInput: async function(message) {
		return new Promise(function(resolve, reject) {
			// Default message
			var output = {
					channel: message.channel,
					reply: {
						attachments: [
							{
								"fallback": "",
								"title": "Commands I listen to\n\n",
								"fields": [
									{
										"title": "Command",
										"value": "`add location`\n\n\n\n\n\n\n\n\n`list locations`\n\n `where am I`\n\n",
										"short": true
									},
									{
										"title": "Explanation",
										"value": "name-of-location;regex-for-location;status-text;name-of-status-emoji-without’:'\n\n\n lists your locations\n\n returns last known location\n\n",
										"short": true
									}
								]
							}
						]
					}
				}

			// Check if user is already registered.
			models.User.findOne({user_id: message.user}, "user_id", function(err, user) {
				if (user !== null) {
					// Good, we know this user, start working
					// Match input against all known commands
					var matched = false;
					Object.keys(commands).forEach(function(command) {
						var matches = message.text.match(commands[command].pattern);
						if(matches != null){
							//Pattern matched, execute it
							matched = true;
							commands[command].exec(matches, user).then(function(reply) {
								output.reply = reply;
								resolve(output);
							}).catch(function(error) {
								//Just to make sure this is an error :)
								output.reply = error;
								resolve(output);
							});
						}
					});

					//By now no response was ready, so let's just.. say gibberish
					if (!matched) {
						resolve(output);
					}
				} else {
					//Ask user to authorize Bot
					output = {
						channel: message.channel,
						reply: {
							text: "Hi stranger, I don't know you at all... Maybe add this app to?"
						}
					};
					resolve(output);
				}
			})
		})
	},

	respond: function(channelId, message) {
		//Respond to message
		this.webclient.chat.postMessage({
			channel: channelId,
			text: message.text,
			attachments: message.attachments
		}).then((res) => {
			// Our bot responded, yay!
		})
		.catch(function(error){
		  	_log("Respond", error);
		});
	}
};

module.exports = bot;