// Log some stuff
global._log = function(scope, message){
	function _prefix(n) {return n<10 ? "0"+n : n}
	var date = new Date();
	console.log("# ------ " + scope + " ------ #");
	console.log(_prefix(date.getHours()) + ":" + _prefix(date.getMinutes()) + ":" + _prefix(date.getSeconds()) + " --> " + message);
	console.log(" ");
}