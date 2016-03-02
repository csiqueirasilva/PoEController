/* global Function */

/* global modules */

var DEBUG_MODE = require('./Enums').DEBUG_MODE;
var Logger = require('./Logger');
var Window = require('./Window');
var Input = require('./Input');
var Worker = require('workerjs');
var exec = require('child_process').exec;
var fs = require('fs');
var Enums = require('./Enums');
var GAME_MODE = Enums.GAME_MODE;
var Controller = require('./Controller');

var GameModeARPG = require('./modes/ARPG');
var GameModeDebug = require('./modes/Debug');
var GameModeInventory = require('./modes/Inventory');
var GameModeOptionsMenu = require('./modes/OptionsMenu');
var GameModePassiveSkillTree = require('./modes/PassiveSkillTree');
var GameModeWorldMap = require('./modes/WorldMap');

var SignatureDetectionWorker = new Worker('src/game/SignatureDetectionWorker.js');

var DETECTION_INTERVAL_MS = 750;

var mainModesSignatures = null;
var inventorySignatures = null;

function loadAllSignatureFiles () {
	mainModesSignatures = ReadSignatureFile(Window.resolution  + "signatures.json");
	inventorySignatures = ReadSignatureFile(Window.resolution + "inventory-signatures.json");
}

function ReadSignatureFile(filename) {

	var ret = null;
	
	var filepath = "signatures/" + (filename || "signatures.json");
	
	try {
		ret = fs.readFileSync(filepath, 'utf8');
		ret = JSON.parse(ret);
		Logger.info('Read signature file ' + filepath + ' from disk');
	} catch (e) {
		SignatureNotFound(filepath);
	}

	return ret;
}

function SignatureNotFound(filename) {

	if (!DEBUG_MODE) {
		Window.quit('Signature file ' + filename + ' not found. Could not start the application.');
	} else {
		Logger.warn('Signature file ' + filename + ' not found.');
	}

}

SignatureDetectionWorker.onmessage = function (event) {
	var cmd = event.data.cmd;
	var data = event.data.data;

	switch (cmd) {
		case 'detect-sub':
			console.log('detect-sub', IndexOf(GAME_MODE, data));
			if (typeof GAME_MODE_OBJECT.SubSection === "function") {
				GAME_MODE_OBJECT.SubSection(data);
			}
			break;
		case 'detect':
			ChangeGameMode(data);
			break;
		case 'init':
			InitGame();
			break;
		case 'signature-not-found':
			SignatureNotFound(data);
	}
};

var DetectPollingInterval = null;
var RightThumbstickMouseInterval = null;

function PollGamepadEvents() {
	RightThumbstickMouseInterval = setInterval(function () {

		if (LastInputData !== null) {
			Input.rightThumbstick(LastInputData);
			GAME_MODE_OBJECT.resolveInput(LastInputData);
		}

	}, Enums.GLOBAL_INTERVAL);
}

function InitGame() {
	DetectPollingInterval = setInterval(function () {
		SignatureDetectionWorker.postMessage({cmd: 'detect', data: {CURRENT_GAME_MODE: CURRENT_GAME_MODE, isBlockedGameMode: IsBlockedGameMode()}});
	}, DETECTION_INTERVAL_MS);

	PollGamepadEvents();

	exec("start steam://rungameid/238960", function (error, stdout, stderr) {
		console.log(stdout);

		if (error) {
			return console.error(stderr);
		}
	});

	if (typeof cbInitGame === "function") {
		cbInitGame();
	}
}

function IsBlockedGameMode() {
	return CURRENT_GAME_MODE !== null && CURRENT_GAME_MODE < 1000;
}

var LastInputData = null;

function ControllerListener(data) {
	LastInputData = data;
}

var cbInitGame = null;

function StartControllerListener(callbackInitGame) {
	Controller.addDataListener(ControllerListener);
	cbInitGame = callbackInitGame;
	if (!DEBUG_MODE) {
		SignatureDetectionWorker.postMessage({cmd: 'init', data: {defaultGameMode: GAME_MODE.ARPG}});
	}
}

function RemoveControllerListener() {
	Controller.removeDataListener(ControllerListener);
	clearInterval(DetectPollingInterval);
	clearInterval(RightThumbstickMouseInterval);
	DetectPollingInterval = null;
	RightThumbstickMouseInterval = null;
	LastInputData = null;
}

var CURRENT_GAME_MODE = null;
var GAME_MODE_OBJECT = null;

function Init() {
	if (DEBUG_MODE) {
		showAllDevTools();
		CURRENT_GAME_MODE = GAME_MODE.DEBUG;
		GAME_MODE_OBJECT = GameModeDebug;
		StartControllerListener();
		PollGamepadEvents();
	} else {
		CURRENT_GAME_MODE = GAME_MODE.ARPG;
		GAME_MODE_OBJECT = GameModeARPG;
	}
}

var ChangeGameModeUpdateUICallback = null;

function ChangeGameMode(NewGameMode) {

	var oldGameMode = CURRENT_GAME_MODE;

	if (oldGameMode !== NewGameMode) {

		//console.log(IndexOf(GAME_MODE, oldGameMode) + " to " + IndexOf(GAME_MODE, NewGameMode));

		if (GAME_MODE_OBJECT && typeof GAME_MODE_OBJECT.leaveArea === "function") {
			GAME_MODE_OBJECT.leaveArea();
		}

		var mode = null;

		switch (NewGameMode) {
			case GAME_MODE.DEBUG:
				mode = GameModeDebug;
				break;
			case GAME_MODE.INVENTORY:
				mode = GameModeInventory;
				break;
			case GAME_MODE.OPTIONS_MENU:
				mode = GameModeOptionsMenu;
				break;
			case GAME_MODE.PASSIVE_SKILL_TREE:
				mode = GameModePassiveSkillTree;
				break;
			case GAME_MODE.WORLD_MAP:
				mode = GameModeWorldMap;
				break;
			default:
				mode = GameModeARPG;
		}

		CURRENT_GAME_MODE = NewGameMode;

		GAME_MODE_OBJECT = mode;

		if (oldGameMode !== CURRENT_GAME_MODE && typeof mode.enterArea === "function") {
			mode.enterArea();
		}

		UpdateUI(CURRENT_GAME_MODE);
	}
}

function setGameModeUpdateCallback(cb) {
	ChangeGameModeUpdateUICallback = cb;
}

function UpdateUI(mode) {
	if(typeof ChangeGameModeUpdateUICallback === "function") {
		ChangeGameModeUpdateUICallback(mode);
	}
}

module.exports = {
	DETECTION_INTERVAL_MS: DETECTION_INTERVAL_MS,
	setGameModeUpdateCallback: setGameModeUpdateCallback,
	init: Init,
	loadSignatures: loadAllSignatureFiles,
	inventorySignatures: inventorySignatures,
	updateUI: UpdateUI,
	signatureDetectionWorker: SignatureDetectionWorker,
	changeMode: ChangeGameMode,
	start: StartControllerListener,
	finish: RemoveControllerListener
};