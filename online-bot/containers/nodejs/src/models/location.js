const mongoose = require('mongoose');

const Location = mongoose.model('Location', {
	user_id: String,
	name: String,
	regex: Array, // ex: ["Kontich", "Gent"]
	status: Object // ex: {status_text: "...", status_emoji: "..."}
});

module.exports = Location;