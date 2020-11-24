var electron = require('electron');
var app = electron.app;
var fs = require('fs');

if(app === undefined) {
	app = electron.remote.app;
}

var dir = app.getPath('appData') + '\\PoeController';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
	if(!fs.existsSync(dir)) {
		Window.quit('Could not create folder: ' + dir);
	}
}

const configFilePath = dir + "/user-settings.json";

function setInputData(data) {
	if(data instanceof Object) {
		$('#select-input-method').val(data.input).change();
		$('#button-key-up select').val(data.q).change();
		$('#button-shoulder-left select').val(data.w).change();
		$('#button-key-left select').val(data.e).change();
		$('#button-shoulder-right select').val(data.r).change();
		$('#button-key-right select').val(data.right).change();
		$('#button-key-down select').val(data.middle).change();
	}
}

function getInputData() {
	var inputMethod = $('#select-input-method').val();
	var qBehavior = $('#button-key-up select').val();
	var wBehavior = $('#button-shoulder-left select').val();
	var eBehavior = $('#button-key-left select').val();
	var rBehavior = $('#button-shoulder-right select').val();
	var rightBehavior = $('#button-key-right select').val();
	var middleBehavior = $('#button-key-down select').val();
	
	return {
		input: inputMethod,
		q: qBehavior,
		w: wBehavior,
		e: eBehavior,
		r: rBehavior,
		right: rightBehavior,
		middle: middleBehavior
	};
}

function persistUserSettings (cb) {
	
	var data = loadedSettings;
	
	console.log('persisting user settings:');
	console.log(data);
	
	fs.writeFile(configFilePath, JSON.stringify(data, null, 2), function(err) {
	
		if(err) {
			return console.log(err);
		}

		console.log("Persisted user settings file to disk.");
		
		if(typeof cb === "function") {
			cb();
		}
	}); 
}

function loadUserSettings(cb) {

	var readData = fs.readFileSync('config_ref.json');
	
	if(!fs.existsSync(configFilePath)) {
		fs.writeFileSync(configFilePath, readData);
	}
	
	let data = fs.readFileSync(configFilePath);	

	var settingsUser = JSON.parse(data);
	var settings = JSON.parse(readData);

	for(var key in settingsUser) {
		settings[key] = settingsUser[key];
	}
	
	if(settings && settings.debug) {
		console.log('loaded user settings:');
		console.log(settings);
	}
	
	if(typeof window !== 'undefined') {
		setInputData(settings.inputFunctions);
	}
	
	console.log("Read user settings file from disk.");
	
	if(typeof cb === "function") {
		cb();
	}
	
	return settings;
}

let loadedSettings = loadUserSettings();

module.exports = {
	Save: persistUserSettings,
	Load: loadUserSettings,
	Settings: loadedSettings,
	DATA_PATH: dir
};