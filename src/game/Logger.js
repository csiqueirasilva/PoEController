var winston = require('winston');
var fs = require('fs');
var Window = require('./Window');

var logFile = 'output.log';

var logger = null;
var error = false;

try {
	
	fs.writeFileSync(logFile, "");

	logger = winston.createLogger({
		level: 'info',
		format: winston.format.json(),
		transports: [
			new winston.transports.Console(),
			new winston.transports.File({ filename: logFile })
		]
	});

} catch (e) {
	error = e;
}

Window.quitIf(logger === null || error, "Could not create log file: " + error);

module.exports = logger;