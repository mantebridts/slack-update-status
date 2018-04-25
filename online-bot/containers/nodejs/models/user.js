const mongoose = require('mongoose');

const User = mongoose.model('User', {
	token: String,
	last_active: Date
});

module.exports = User;