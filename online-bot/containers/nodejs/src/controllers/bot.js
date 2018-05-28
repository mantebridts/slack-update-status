// Online dependencies
const { WebClient, RTMClient } = require('@slack/client');

// Local dependencies
const config = require('./../config/config');
const models = require('./../models/index');
const commands = require("./commands/index");
const Command = require("./../classes/Command");

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
		var _this = this;
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
			models.User.findOne({user_id: message.user}, "user_id flow", function(err, user) {
				if (user !== null) {
					// Good, we know this user, start working

					// Did user abort the flow?
					if(message.text.toLowerCase() == "stop"){
						Command.clearSteps(user);	
						output.reply = {text: "Okay okay, we'll stop here"};
						resolve(output);
					}else{
						// No? Great.
						/*
						 * 1. Gebruiker stuurt commando naar Earl
						 * 2. Zit gebruiker reeds in een flow?
						 -> Nee
						 * 		3. Check commando met alle eerste stappen van commando's
						 * 		4a. Indien iets gevonden, sla stap op in db en antwoordt met eerste vraag
						 * 		4b. Indien niets gevonden, print lijst met mogelijke commando's
						 -> Ja
						 *		3. Check of antwoord volstaat door callback van stap in commando uit te voeren
						 * 		4a. Indien oké, antwoordt met eventuele feedback, ga naar volgende stap, en stel die vraag
						 * 		4b. Indien niet oké, print herhaling, of stel zelf herhaling op
						 * 5. Indien flow gedaan is, reset naar 'null'
						 */

						if(user.flow == "null"){
							//Loop over first step of all commands, this only happens when a user is out of a flow
							var matches = null;
							Object.keys(commands).forEach(function(key){
								var command = commands[key];
								if(matches == null){
									matches = message.text.match(command.getStep(0).pattern);
									//There's a match for the first command, ask the question and update the flow
									if (matches != null){
										if(command.needsNoAnswer){
											command.processAnswer(0, message, user).then(function(validation){
												// Response is sufficient for command, proceed to next step
												if(validation){
													// If the response is an object, respond first
													if(validation instanceof Object){
														_this.respond(output.channel, validation);
													}
												}
											}).catch(function(repeatHelp){
												// Reply from user was rejected, ask the question again
												output.reply = repeatHelp ? repeatHelp : {text: "Better try again, I didn't catch that.\n_(Or, if you want to quit, say 'stop')_"};
												resolve(output);
											});
										}else{
											//Save state to db
											var stepId = 0;
											command.saveStep(stepId, user);
											output.reply = command.question(stepId);
											resolve(output);
										}
									}
								}
							});

							//If nothing worked, give the user just a help-response
							if(matches == null){
								resolve(output);
							}
						}else{
							/*
							 * Happens more often, in this case, the user has an active flow, and answered a question
							*/
							commands[user.flow.name].processAnswer(user.flow.step, message, user).then(function(validation){
								// Response is sufficient for command, proceed to next step
								if(validation){
									// If the response is an object, respond first
									if(validation instanceof Object){
										_this.respond(output.channel, validation);
									}

									//Save the next step to db, and ask that question
									var stepId = user.flow.step+1;
									commands[user.flow.name].saveStep(stepId, user).then(function(response){
										output.reply = commands[user.flow.name].question(stepId);
										resolve(output);
									})
								}
							}).catch(function(repeatHelp){
								// Reply from user was rejected, ask the question again
								output.reply = repeatHelp ? repeatHelp : {text: "Better try again, I didn't catch that.\n_(Or, if you want to quit, say 'stop')_"};
								resolve(output);
							});
						}
					}
				} else {
					//Ask user to authorize Bot
					output.reply = {
						text: "Hi stranger, I don't know you at all... Maybe add this app to?"
					};
					resolve(output);
				}
			})
		})
	},

	respond: function(channelId, message) {
		//Respond to message
		if(message.text == undefined){
			console.log(message);
		}
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