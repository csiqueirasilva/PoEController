var winston = require('winston');
var fs = require('fs');
var Window = require('./Window');

var logFile = 'output.log';

var logger = null;

try {
	
	fs.writeFileSync(logFile, "");

	logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({
				handleExceptions: true,
				json: false
			}),
			new (winston.transports.File)({
				handleExceptions: true,
				json: false,
				filename: 'output.log'
			})
		],
		exitOnError: false
	});

} catch (e) {
}

Window.quitIf(logger === null, "Could not create log file.");

module.exports = logger;