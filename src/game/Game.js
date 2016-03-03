/* global Function */

/* global modules */

module.exports = {};

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

var SignatureDetection = require('./SignatureDetection');

var RightThumbstickMouseInterval = null;

function PollGamepadEvents() {
	RightThumbstickMouseInterval = setInterval(function () {

		if (LastInputData !== null) {
			Input.rightThumbstick(LastInputData);
			Mode.solveInput(LastInputData);
		}

	}, Enums.GLOBAL_INTERVAL);
}

var LastInputData = null;

function ControllerListener(data) {
	LastInputData = data;
}

var cbInitGame = null;

function StartControllerListener(callbackInitGame) {
	Controller.addDataListener(ControllerListener);

	if (!DEBUG_MODE) {
		SignatureDetection.init(GAME_MODE.ARPG);
		
		SignatureDetection.startDetection();

		PollGamepadEvents();

		exec("start steam://rungameid/238960", function (error, stdout, stderr) {
			console.log(stdout);

			if (error) {
				return console.error(stderr);
			}
		});

		if (typeof callbackInitGame === "function") {
			callbackInitGame();
		}
	}
}

function RemoveControllerListener() {
	Controller.removeDataListener(ControllerListener);
	SignatureDetection.stopDetection();
	clearInterval(RightThumbstickMouseInterval);
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

function ChangeModeById(id) {
	var mode = GetModeById(id);
	Mode.change(mode);
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

module.exports.init = Init;
module.exports.start = StartControllerListener;
module.exports.finish = RemoveControllerListener;
module.exports.changeById = ChangeModeById;