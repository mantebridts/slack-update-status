module.exports = {
	pattern: /repeat /i,
	exec: function(message){
		return "I repeat: " + message;
	}
};