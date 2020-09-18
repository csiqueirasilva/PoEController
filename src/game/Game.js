module.exports = {};

var GameModeARPG = require('./modes/ARPG');

var DEBUG_MODE = require('./Enums').DEBUG_MODE;
var Window = require('./Window');
var Input = null;
var child_process = require('child_process');
var fs = require('fs');
var Enums = require('./Enums');
var GAME_MODE = Enums.GAME_MODE;
var Controller = require('./Controller');
var Settings = require('../menu/UserSettings').Settings;
var shell = require('electron').shell;

var successController = Controller.load();

if(successController) {
	Input = require('./inputs/i' + successController.vid + '_' + successController.pid);
}

var RightThumbstickMouseInterval = null;

var LastInputData = null;

function ControllerListener(data) {
	Input.handleInput(data);
}

function StartControllerListener() {
	Controller.addDataListener(ControllerListener);

	if (!DEBUG_MODE) {
		if(Settings.steamGame) {
			shell.openExternal("steam://rungameid/238960");
		} else {
			var cwd = Settings.gamePath.substring(0, Settings.gamePath.lastIndexOf("\\"));
			console.log('game working dir: ' + cwd);
			child_process.execFileSync(Settings.gamePath, {
				cwd: cwd
			});
		}
	}
}

function RemoveControllerListener() {
	Controller.removeDataListener(ControllerListener);
	clearInterval(RightThumbstickMouseInterval);
	RightThumbstickMouseInterval = null;
	LastInputData = null;
}

var ipcMain = require('electron').ipcMain;

ipcMain.on('game-start', (ev, data, inputMethod, arpgHelp) => {
	var behaviorsArr = [];
	for(var k in data) {
		behaviorsArr[parseInt(k)] = data[k];
	}
	GameModeARPG.setBehavior(behaviorsArr);
	StartControllerListener();
	Window.send('Overlay', 'game-start', inputMethod, arpgHelp);
	Window.send('menuWindow', 'game-start', true);
});

ipcMain.on('game-finish', () => {
	Window.send('Overlay', 'overlay-hide', true);
	RemoveControllerListener();
});

module.exports.start = StartControllerListener;
module.exports.finish = RemoveControllerListener;