var winston = require('winston');
var fs = require('fs');

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

module.exports = null;