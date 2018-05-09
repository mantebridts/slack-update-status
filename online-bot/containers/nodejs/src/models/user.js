const mongoose = require('mongoose');

const User = mongoose.model('User', {
	token: String,
	user_id: String,
	team_id: String,
	last_active: Date
});

module.exports = User;