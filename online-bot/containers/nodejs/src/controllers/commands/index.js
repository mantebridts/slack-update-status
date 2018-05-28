const fs = require('fs');

//Require all commands
var commands = [];
try {
	fs.readdirSync("./src/controllers/commands").forEach(command => {
		if(command.indexOf(".DS_Store") == -1 && command.indexOf("index") === -1 && command.indexOf(".") !== -1){
			commands[command.replace(".js", "")] = require("./" + command);
		}
	});
} catch (err) {
	_log("development", "# ------ You have an error in the command-files ------ #", false);
	console.log(err);
}

//Just a list of all models to export
module.exports = commands;