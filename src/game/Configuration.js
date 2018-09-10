var fs = require('fs');
var Window = require('./Window');
var dir = process.env['APPDATA'] + '\\PoeController';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
	if(!fs.existsSync(dir)) {
		Window.quit('Could not create folder: ' + dir);
	}
}

module.exports = {
	DATA_PATH: dir
};