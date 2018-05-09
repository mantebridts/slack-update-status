//Require all necessary models
const User = require("./user");
const Location = require("./location");

//Just a list of all models to export
module.exports = {
	"User": User,
	"Location": Location
}