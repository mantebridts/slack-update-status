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

const privateKey = fs.readFileSync('./config/cert/live/api.nightknight.be/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./config/cert/live/api.nightknight.be/fullchain.pem', 'utf8');

const config = require('./config/config'); 
const bot = require('./controllers/bot');
const models = require('./models/index');

// Connect to MongoDB
mongoose.connect(mongo_connection_string);

// Start express
var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Capture Post
app.post('/location', function(req, res){
	var user = null;
	models.User.findOneAndUpdate({token: req.body.token}, { last_active: new Date()}, function(err, u){
		// If token is known, update 'last_active'-field, else throw error, cause this user shouldn't exist
		if(u !== null){
			// Great. Now post the statusmessage to Slack with this token
			updateSlackStatus(req.body.token, req.body.status);

			// Send "ok", or nah
			res.status(200).send("ok");
		}else{
			res.status(404).send({ message: "User / token combination not found"});
		}
	});
});

// Load page
app.get("/", function(req, res){
	res.sendFile(path.join(__dirname + '/pages/index.html'));
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
			redirect_uri: "http://localhost/callback"
		};

		var options = {
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
	            console.log(obj);

	            //Did Slack return an error?
	            if(obj.ok){

	            	//Does this user exist yet?
	            	models.User.findOneAndUpdate({token: obj.access_token}, {token: obj.access_token, user_id: obj.user_id, team_id: obj.team_id, last_active: new Date()}, function(err, u){
						// If token is known, update all fields, else add them to the db
						if(u !== null){
							//Exists
							res.status(200).send("User got updated in db");
						}else{
							const new_user = new models.User({token: obj.access_token, user_id: obj.user_id, team_id: obj.team_id, last_active: new Date()});
							new_user.save().then(function(err, u){
								res.status(200).send("User got added to db");
							});
						}
					});
	            
					//Post new message to #general
					const web = new WebClient(config.bot.access_token);
					web.chat.postMessage({channel: "#general", text: "User got added to db!"})
				  	.then((res) => {
					    if(!res.ok){
					    	//It's an error
					    	console.log(res);
					    }
					  })
				  	.catch(function(error){
					  	console.log("# ------ ERROR ------ #");
					  	console.log(error);
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
		res.status(200).send("Working");
	}
});

// Start server
var httpServer = http.createServer(app);
var httpsServer = https.createServer({key: privateKey, cert: certificate}, app);

httpServer.listen(3000);
httpsServer.listen(8443);

//Start Slack-bot Earl
bot.boot();

// Run period task to clear the status of people who didn't send an update in the last 15min
setInterval(clearStatuses, 1000*60*1);


//Helper functions
function updateSlackStatus(token, status){
	const web = new WebClient(token);
	web.users.profile.set({profile: status} )
	  .then((res) => {
	    //Yay
	  })
	  .catch(function(error){
	  	if(error.data.error == 'profile_status_set_failed_not_valid_emoji'){
	  		updateSlackStatus(token, {status_text: "Wrong emoji provided!", status_emoji: ":question:"})
	  	}
	  });
}

function clearStatuses(){
	models.User.find({last_active: { $lte: new Date() - 15*60*1000 }}, function(err, users){
		if(users){
			// Loop over these users, and clear their statuses
			for (var i = 0; i< users.length; i++){
				updateSlackStatus(users[i].token, {status_text: "", status_emoji: ""});
			}
		}
	});
}