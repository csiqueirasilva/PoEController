var winston = require('winston');
var fs = require('fs');
var UserSettings = require('../menu/UserSettings');
var Window = require('./Window');

var logFile = UserSettings.DATA_PATH + '/output.log';

var logger = null;
var error = false;

try {
	
	fs.writeFileSync(logFile, "");

	logger = winston.createLogger({
		level: 'info',
		format: winston.format.combine(
			winston.format.splat(),
			winston.format.simple()
		),
		transports: [
			new winston.transports.File({ filename: logFile })
		]
	});

} catch (e) {
	error = e;
}

Window.quitIf(logger === null || error, "Could not create log file: " + error);

module.exports = logger;