const mongoose = require('mongoose');

const User = mongoose.model('User', {
	token: String,
	user_id: String,
	team_id: String,
	location: {
		address: String,
		_id: mongoose.Schema.Types.ObjectId
	},
	last_active: Date,
	flow: {
		name: String,
		step: Number
	}
});

module.exports = User;