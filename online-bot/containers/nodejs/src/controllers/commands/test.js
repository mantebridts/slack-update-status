//Require Command-class
const Command = require('./../../classes/Command');

var test = new Command("test");

//Require user to say "start steps" to start
test.addStep(/^start/i, {text: "Please type 'continue' to proceed"}, async function(message, user){
	return new Promise(function(resolve, reject) {
		if(message.text == "continue"){
			resolve("Goed bezig!");
		}else{
			reject("Try again");
		}
	});
});

//User needs to answer with "continue", or 
test.addStep(null, "What's your superpower?", async function(message, user){
	return new Promise(function(resolve, reject) {
		if(message.text == "sterk"){
			resolve("Good work!");
		}else{
			reject("No no no");
		}
	});
});

module.exports = test;