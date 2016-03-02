/* global Function */

/* global modules */

var Mode = require('./Mode');

var GameModeARPG = require('./modes/ARPG');
var GameModeDebug = require('./modes/Debug');
var GameModeInventory = require('./modes/Inventory');
var GameModeOptionsMenu = require('./modes/OptionsMenu');
var GameModePassiveSkillTree = require('./modes/PassiveSkillTree');
var GameModeWorldMap = require('./modes/WorldMap');

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

var SignatureDetectionWorker = new Worker('src/game/SignatureDetectionWorker.js');

var DETECTION_INTERVAL_MS = 750;

var mainModesSignatures = null;
var inventorySignatures = null;

function loadAllSignatureFiles () {
	mainModesSignatures = ReadSignatureFile(Window.resolution  + "signatures.json");
	inventorySignatures = ReadSignatureFile(Window.resolution + "inventory-signatures.json");
	SignatureDetectionWorker.postMessage({cmd: "load-signatures-file", data: mainModesSignatures});
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

	Logger.info('message received');
	Logger.info(cmd);
	Logger.info(data);

	switch (cmd) {
		case 'detect-sub':
			Mode.subSection(data);
			break;
		case 'detect':
			Mode.change(data);
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
			Mode.solveInput(LastInputData);
		}

	}, Enums.GLOBAL_INTERVAL);
}

function InitGame() {
	DetectPollingInterval = setInterval(function () {
		SignatureDetectionWorker.postMessage({cmd: 'detect', data: {CURRENT_GAME_MODE: Mode.getCurrent(), isBlockedGameMode: Mode.isBlocked()}});
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

function GetModeById(id) {
	var mode = null;
	switch (id) {
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
	return mode;
}

function SetModeById(id) {
	var mode = GetModeById(id);
	Mode.set(mode);
}

function Init() {
	if (DEBUG_MODE) {
		showAllDevTools();
		SetModeById(GAME_MODE.DEBUG);
		StartControllerListener();
		PollGamepadEvents();
	} else {
		SetModeById(GAME_MODE.ARPG);
	}
}

module.exports = {
	DETECTION_INTERVAL_MS: DETECTION_INTERVAL_MS,
	init: Init,
	loadSignatures: loadAllSignatureFiles,
	inventorySignatures: inventorySignatures,
	signatureDetectionWorker: SignatureDetectionWorker,
	start: StartControllerListener,
	finish: RemoveControllerListener
};