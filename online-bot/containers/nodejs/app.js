//Temp token = xoxp-349187893970-349776230930-352199970112-f3ba68112c6e5a262f75b998421c696d

const { WebClient } = require('@slack/client');
const mongoose = require('mongoose');
const models = require('./models/index');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');

const mongo_connection_string = 'mongodb://mongodb/earl';

//const privateKey = fs.readFileSync('./config/cert/keys/0000_key-certbot.pem', 'utf8');
//const certificate = fs.readFileSync('./config/cert/csr/0000_csr-certbot.pem', 'utf8');

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
		// If token is known, update 'last_active'-field, else add this user to db
		if(u !== null){
			user = u;
		}else{
			//Gotta create one.
			const new_user = new models.User({token: req.body.token, last_active: new Date()});
			new_user.save().then(function(err, u){
				user = u;
			});
		}
	});

	// Great. Now post the statusmessage to Slack with this token
	updateSlackStatus(req.body.token, req.body.status);

	// Send "ok", or nah
	res.status(200).send("ok");
});

// Temp fix for validating certificate
app.use('/', express.static('cert'));

// Start server
var httpServer = http.createServer(app);
//var httpsServer = https.createServer({key: privateKey, cert: certificate}, app);

httpServer.listen(3000);
//httpsServer.listen(8443);

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