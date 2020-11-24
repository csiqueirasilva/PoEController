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
const { spawn, execFile } = require("child_process");

var RightThumbstickMouseInterval = null;

var forwardEvents = false;

if(Settings.useXInputBin) {
	let execPath = 'bin/xinput.exe';
	let args = [];
	
	Input = require('./inputs/xinput');
	
	const proc = spawn(execPath, args);
	const stream = proc.stdout;
	
	stream.on("data", chunk => {
		//console.log(chunk);
		
		if(forwardEvents) {
			Input.handleInput(chunk);
		}
	});
	
	Window.send('menuWindow', 'display-window-title', 'menuWindow');

} else {
	var successController = Controller.load();

	if(successController) {
		Input = require('./inputs/i' + successController.vid + '_' + successController.pid);
	}
	
	function ControllerListener(data) {
		//console.log(data);
		
		if(forwardEvents) {
			Input.handleInput(data);
		}
	}

	Controller.addDataListener(ControllerListener);
}

function StartControllerListener() {
	forwardEvents = true;

	if (!DEBUG_MODE) {
		if(Settings.steamGame) {
			shell.openExternal("steam://rungameid/238960");
		} else {
			var cwd = Settings.gamePath.substring(0, Settings.gamePath.lastIndexOf("\\"));
			console.log('game working dir: ' + cwd);
			child_process.execFile(Settings.gamePath, {
				cwd: cwd
			});
		}
	}
}

function RemoveControllerListener() {
	forwardEvents = false;
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