const mongoose = require('mongoose');

const User = mongoose.model('User', {
	token: String,
	user_id: String,
	team_id: String,
	location: Object, // Contains {address: "...", _id: reference_to_location_Id}
	last_active: Date
});

module.exports = User;