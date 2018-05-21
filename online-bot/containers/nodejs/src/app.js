const { WebClient, RTMClient } = require('@slack/client');
const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
var path = require('path');
var querystring = require('querystring');

const mongo_connection_string = 'mongodb://mongodb/earl';

//Require all global helpers
require("./controllers/_helpers");

const config = require('./config/config'); 
const bot = require('./controllers/bot');
const models = require('./models/index');

// Connect to MongoDB
mongoose.connect(mongo_connection_string);

// Start express
var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Start server
var httpServer = http.createServer(app);
httpServer.listen(3000);

if(process.env.NODE_ENV == "prod"){
	const privateKey = fs.readFileSync('./config/cert/live/api.nightknight.be/privkey.pem', 'utf8');
	const certificate = fs.readFileSync('./config/cert/live/api.nightknight.be/fullchain.pem', 'utf8');
	var httpsServer = https.createServer({key: privateKey, cert: certificate}, app);
	httpsServer.listen(8443);
}

//Start Slack-bot Earl
bot.boot();

//Routes

// Capture Post
app.post('/location', function(req, res){
	// Get user ID
	models.User.findOne({token: req.body.token}, "user_id token", function(err, user){
		if(user !== null){
			//Continue with user, find matching location for this address
			models.Location.find({user_id: user.user_id}, "_id name regex status", function(err, locations){
				if(err || locations.length == 0){
					_log("Cronjob", "Locations of user #" + user.user_id + " could not be found:```" + err + "```", {type: "error", title: "Location gathering failed"});
				}
				//Loop over locations and match regexes
				var current_location = false;
				for(var i=0; i < locations.length; i++){
					var location = locations[i];
					if(location.name == "Default" && !current_location){
						current_location = location;
					}else{
						for(var j=0; j < location.regex.length; j++){
							var matches = req.body.address.match(location.regex[j]);
							if(matches !== null){
								//We have a match!
								current_location = location;
							}
						}
					}
				}
				//Update the status of this user
				//If by here the user had no matches, the default location will be used
				_updateSlackStatus(user.token, current_location.status);

				//Update last location of user
				models.User.findOneAndUpdate({user_id: user.user_id}, {last_active: new Date(), location: { "address": req.body.address, "_id": current_location._id}}, function(err, u){
					//Doesn't really matter..
					if(err || u == null){
						_log("Cronjob", "User #" + user.user_id + " could not update location:\n```Location:\n" + req.body.address + "\n" + current_location.name + "```\n```Error:\n" + err + "```", {type: "error", title: "Cronjob failed"});
					}
				});

				// Send "ok", or nah
				res.status(200).send("ok");
			});
		}else{
			res.status(404).send({ message: "User / token combination not found"});
		}
	});
});

//Captures button-responses from Slack
app.post("/api", function(req, res){
	//Interesting parts
	var payload = JSON.parse(req.body.payload);
	var data = {
		"token": payload.token,
		"callback_id": payload.callback_id,
		"user_id": payload.user.id,
		"original_message": payload.original_message,
		"team_id": payload.team.id
	};

	// 1. Does the token matches what we know of Slack? (Is this request from Slack?)
	if(config.verification_token == data.token){
		// 1.1 Split callback_id, find action, target and id
		var callback = data.callback_id.split("."), target = callback[0], action = callback[1], id = callback[2];

		// 1.2 Remove location
		switch(action){
			case "delete":
				switch(target){
					case "location":
						models.Location.findOne({_id: id, user_id: data.user_id}).remove(function(err, location){
							//Replace original_message attachment with response and send it back
							console.log(err);
							console.log(location);
							for(var i = 0; i < data.original_message.attachments.length; i++){
								if(data.original_message.attachments[i].callback_id == data.callback_id){
									//It's this one, check if the location even existed (might be an old message)
									if(location.n <= 0){
										data.original_message.attachments[i] = {
											"title": "Error: 404",
											"text": "That's odd. No location with this name found.. :confused:",
											"color": "#d40201"
										};
									}else{
										data.original_message.attachments[i] = {
											"title": "Yes, that's gone!",
											"text": "Location " + data.original_message.attachments[i].title + " removed! :boom:",
											"color": "#50af66"
										};
									}
									//Remove actions and fallback
									delete data.original_message.attachments[i].callback_id;
									delete data.original_message.attachments[i].actions;
								}
							}
							console.log(data.original_message);
							res.status(200).send(data.original_message);
						});
						break;
					default:
						res.status(400).send("Bad request");
						break;
				}
				break;
			default:
				res.status(400).send("Bad request");
				break;
		}
	}else{
		res.status(401).send("Not authorized");
	}
});

// Load page
app.get("/", function(req, res){
	var response = "";
	fs.readFile(path.join(__dirname + '/pages/index.html'), 'utf8', function(err, contents){
		if(err){
			res.status(400).send({message: "An error occured", error: err});
		}

		response = contents;
		response = response.replace("{(REDIRECT_URI)}", process.env.BASE_URL);
		res.status(200).send(response);
	})
});

// Callback page
app.get("/callback", function(req, res){
	var temp_code = req.query.code;

	//Perform GET-request for user.
	if(temp_code !== undefined){
		var parameters = {
			client_id: config.client_id,
			client_secret: config.client_secret,
			code: temp_code,
			redirect_uri: process.env.BASE_URL + "/callback"
		};

		var options	= {
			host: 'slack.com',
			port: 443,
			path: '/api/oauth.access?' + querystring.stringify(parameters),
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};

		var port = options.port == 443 ? https : http;
		var request = port.request(options, function(response){
			var output = '';
			response.setEncoding('utf8');

			response.on('data', function (chunk) {
				output += chunk;
			});

			response.on('end', function() {
				//Parse response as object
				var obj = JSON.parse(output);

				//Did Slack return an error?
				if(obj.ok){
					//Does this user exist yet?
					models.User.findOneAndUpdate({token: obj.access_token}, {token: obj.access_token, user_id: obj.user_id, team_id: obj.team_id, location: {}, last_active: new Date()}, function(err, u){
						// If token is known, update all fields, else add them to the db
						if(u !== null){
							//Exists
							res.status(200).send("User got updated in db, your token is " + obj.access_token);
						}else{
							const new_user = new models.User({
									token: obj.access_token,
									user_id: obj.user_id,
									team_id: obj.team_id,
									location: {},
									last_active: new Date()
								});


							new_user.save(function (err, user) {
								if (err){
									res.status(200).send("error saving user");
								}

								//Create a default location for this user
								const default_location = new models.Location({
									user_id: user.user_id,
									name: "Default",
									regex: [],
									status: {
										"status_text": "In a meeting",
										"status_emoji": ":calendar:"
									}
								}).save(function (err, location) {
									if (err){
										res.status(200).send("error saving default location");
									}

									_log("Setup", "Added a new user (#" + user.user_id + ") with a new default location.", {title: "New user added", type: ""});
								})

								res.status(200).send("User got added to db, your token is " + obj.access_token);

							});
						}
					});
				}else{
					//Respond with error for development
					res.status(200).send(obj);
				}
			});
		});

		request.on('error', function(err) {
			console.log(err);
		});

		request.end();
	}else{
		res.status(200).send("Error");
	}
});
