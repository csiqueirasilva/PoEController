module.exports = {};

var behaviors = require('../Behaviors').functions;

behaviors["OptionsMenu.Down"] = function () {
	CURSOR_INDEX = (CURSOR_INDEX + 1) % CURSOR_TOTAL;
	robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION + CURSOR_INDEX * CURSOR_Y_INCREMENT);
};

behaviors["OptionsMenu.Up"] = function () {
	CURSOR_INDEX = (CURSOR_INDEX - 1 + CURSOR_TOTAL) % CURSOR_TOTAL;
	robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION + CURSOR_INDEX * CURSOR_Y_INCREMENT);
};

behaviors["OptionsMenu.Cancel"] = function () {
	robot.keyTap('escape');
	Mode.change(ARPG);
};

behaviors["OptionsMenu.Confirm"] = function () {
	robot.mouseClick("left");
	if (CURSOR_INDEX === 0) {
		Mode.change(Inventory);
	} else if (CURSOR_INDEX === 2) {
		Mode.change(PassiveSkillTree);
	} else {
		Mode.change(ARPG);
	}
};

var Enums = require('../Enums');
var KEYS = Enums.KEYS;
var GAME_MODE = Enums.GAME_MODE;
var Mode = require('../Mode');
var PassiveSkillTree = require('./PassiveSkillTree');
var ARPG = require('./ARPG');
var Inventory = require('./Inventory');
var robot = require('robotjs');
var Window = require('../Window');
var Input = require('../Input');
var Logger = require('../Logger');

var KeysOfExile = {};

var DPADOfExile = {};

function SetOptionKeys() {
	KeysOfExile[KEYS.KEY_DOWN] = "OptionsMenu.Confirm";
	KeysOfExile[KEYS.KEY_RIGHT] = "OptionsMenu.Cancel";
	KeysOfExile[KEYS.KEY_START] = "OptionsMenu.Cancel";

	DPADOfExile[KEYS.DPAD_UP] = "OptionsMenu.Up";
	DPADOfExile[KEYS.DPAD_DOWN] = "OptionsMenu.Down";

	BehaviorOfExile = {
		"OptionsMenu.Up": ["OptionsMenu.Up"],
		"OptionsMenu.Down": ["OptionsMenu.Down"],
		"OptionsMenu.Cancel": [null, "OptionsMenu.Cancel"],
		"OptionsMenu.Confirm": [null, "OptionsMenu.Confirm"]
	};
}

var BehaviorOfExile = {};

var InputDPAD = {};

var InputKeys = {};

var CURSOR_INDEX = 0;
var CURSOR_TOTAL = 9;
var CURSOR_X_POSITION = parseInt(Window.width * 0.14);
var CURSOR_Y_POSITION = parseInt(Window.height * 0.61945);
var CURSOR_Y_INCREMENT = parseInt(Window.height * 0.0346);

var CURSOR_X_INITIAL = CURSOR_X_POSITION;
var CURSOR_Y_INITIAL = parseInt(Window.height * 0.9287);

function ResolveInput(data) {
	if (!blockInputs) {
		var buttons = data[10];

		for (var i = 128; i >= 1; i = i / 2) {
			var pressed = buttons - i >= 0;
			Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}

		// solve dpad
		Input.dpad(data[11], DPADOfExile, InputDPAD, BehaviorOfExile, true);
	}
}

var blockInputs = true;

function EnterArea() {
	
	Logger.info('entering menu');
	
	robot.moveMouse(CURSOR_X_INITIAL, CURSOR_Y_INITIAL);

	setTimeout(function () {

		robot.mouseClick("left");

		setTimeout(function () {

			CURSOR_INDEX = 0;
			robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION);

			SetOptionKeys();

			setTimeout(function () {
				blockInputs = false;
			}, 100);

		}, 100);

	}, 120);
}

function LeaveArea() {
	BehaviorOfExile = {};
	KeysOfExile = {};
	DPADOfExile = {};
	blockInputs = true;
}

module.exports.resolveInput = ResolveInput;
module.exports.enterArea = EnterArea;
module.exports.leaveArea = LeaveArea;
module.exports.id = GAME_MODE.OPTIONS_MENU;