module.exports = {};

var behaviors = require('../Behaviors').functions;

behaviors['ARPG.Fixed.OptionsMenu'] = function () {
	robot.keyTap("i");
};

behaviors['ARPG.Fixed.FetchLootHold'] = function () {
	robot.keyToggle('F', 'down');
	robot.moveMouse(Window.basePosition.x, Window.basePosition.y);
};

behaviors['ARPG.Fixed.FetchLootRelease'] = function () {
	robot.keyToggle('F', 'up');
};

behaviors["ARPG.Fixed.EscapeAndReturn"] = function () {
	robot.keyTap("escape");
};

var robot = require('robotjs');
var Input = require('../Input');
var Movement = require('../behaviors/Movement');
var KEYS = require('../Enums').KEYS;
var Enums = require('../Enums');
var GAME_MODE = Enums.GAME_MODE;
var Window = require('../Window');

var BehaviorOfExile = {};
var KeysOfExile = {};

KeysOfExile[KEYS.L3] = '5';
KeysOfExile[KEYS.R3] = 'control';
KeysOfExile[KEYS.DPAD_UP] = '4';
KeysOfExile[KEYS.DPAD_RIGHT] = '3';
KeysOfExile[KEYS.DPAD_DOWN] = '2';
KeysOfExile[KEYS.DPAD_LEFT] = '1';

KeysOfExile[KEYS.KEY_DOWN] = 'w';
KeysOfExile[KEYS.KEY_RIGHT] = 'e';
KeysOfExile[KEYS.KEY_LEFT] = 'q';
KeysOfExile[KEYS.KEY_UP] = 'r';
KeysOfExile[KEYS.KEY_SHOULDER_LEFT] = 'middle';
KeysOfExile[KEYS.KEY_SHOULDER_LEFT2] = 'escape';
KeysOfExile[KEYS.KEY_SHOULDER_RIGHT] = 'right';
KeysOfExile[KEYS.KEY_SHOULDER_RIGHT2] = 'left';

KeysOfExile[KEYS.KEY_SELECT] = 'ARPG.Fixed.FetchLoot';
KeysOfExile[KEYS.KEY_START] = 'ARPG.Fixed.OptionsMenu';

for (var key in KeysOfExile) {
	BehaviorOfExile[KeysOfExile[key]] = [];
}

BehaviorOfExile['ARPG.Fixed.OptionsMenu'][0] = null;
BehaviorOfExile['ARPG.Fixed.OptionsMenu'][1] = 'ARPG.Fixed.OptionsMenu';

BehaviorOfExile['ARPG.Fixed.FetchLoot'][0] = "ARPG.Fixed.FetchLootHold";
BehaviorOfExile['ARPG.Fixed.FetchLoot'][1] = "ARPG.Fixed.FetchLootRelease";

function SetBehaviorFunction(idx, fnc) {
	var matchKeyDown = fnc.match(/.KeyDown$/g);

	BehaviorOfExile[idx] = [];

	if (matchKeyDown !== null) {
		BehaviorOfExile[idx][0] = fnc;
		BehaviorOfExile[idx][1] = fnc.replace(/.KeyDown$/g, '.KeyUp');
	} else {
		BehaviorOfExile[idx][0] = fnc;
	}
	
}

function SetBehavior(inputArgs) {
	for (var key in inputArgs) {
		SetBehaviorFunction(parseInt(key), inputArgs[key]);
	}
}

module.exports.keys = KeysOfExile;
module.exports.behaviors = BehaviorOfExile;
module.exports.functions = behaviors;
module.exports.setBehavior = SetBehavior;
module.exports.id = GAME_MODE.ARPG;