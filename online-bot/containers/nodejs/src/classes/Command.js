// Local dependencies
const config = require('./../config/config');
const models = require('./../models/index');

class Command {
	constructor(name){
		this._name = name;
		this._steps = [];
	}

	// Name
	set name(name){
		this._name = name.toLowerCase();
	}
	get name(){
		return this._name;
	}

	// Question
	question(stepId){
		return this._steps[stepId].question;
	}

	// Steps
	addStep(pattern, question, callback){
		// If the question is just plain text, reform it to a question
		if(!(question instanceof Object)){
			question = {text: question};
		}
		this._steps.push({
			question: question,
			pattern: pattern,
			callback: callback
		});
	}

	getStep(stepId){
		return this._steps[stepId];
	}

	saveStep(stepId, user){
		var _this = this;
		return new Promise(function(resolve, reject) {
			if(stepId in _this._steps){
				models.User.findOneAndUpdate({_id: user._id}, {flow: { 'name': _this._name, 'step': stepId}}, function(err, u) {
					resolve(true);
				});
			}else{
				models.User.findOneAndUpdate({_id: user._id}, {flow: null}, function(err, u) {
					resolve(false);
				});
			}
		});
	}

	// Process answers
	processAnswer(stepId, message, user){
		if(stepId in this._steps){
			var activeStep = this._steps[stepId];

			return new Promise(function(resolve, reject) {
				activeStep.callback(message, user).then(function(reply) {
					// If it worked, return true or object {text: "..", attachments: []}
					if(!(reply instanceof Object) && reply !== true){
						reply = {text: reply};
					}
					resolve(reply);
				}).catch(function(repeatHelp) {
					// If it failed, return false or a reminder
					if(!(repeatHelp instanceof Object)){
						repeatHelp = {text: repeatHelp};
					}
					reject(repeatHelp);
				});
			});
		}else{
			//StepID not in steps
			return new Promise(function(resolve, reject) {
				models.User.findOneAndUpdate({_id: user._id}, {flow: null}, function(err, u) {
					resolve({text: "You went too far, let's go back", attachments: []});
				});
			});
		}
	}

	static clearSteps(user){
		return new Promise(function(resolve, reject) {
			models.User.findOneAndUpdate({_id: user._id}, {flow: null}, function(err, u) {
				resolve(true);
			});
		});
	}
}

module.exports = Command;