const mongoose = require('mongoose');

const Location = mongoose.model('Location', {
	user_id: String,
	regex: String,
	status: Object
});

module.exports = Location;