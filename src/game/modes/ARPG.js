module.exports = {};

var behaviors = require('../Behaviors').functions;

behaviors['ARPG.Fixed.OptionsMenu'] = function () {
	// check if possible to open menu (eg: if esc menu is not open)
	var color = robot.getPixelColor(parseInt(Window.width * 0.1421875), parseInt(Window.height * 0.89351851852));
	if (color > "777777") {
		Mode.change(OptionsMenu);
	}
};

behaviors['ARPG.Fixed.FetchLootHold'] = function () {
	robot.keyToggle('alt', 'down');
	robot.moveMouse(Window.basePosition.x, Window.basePosition.y);
};

behaviors['ARPG.Fixed.FetchLootRelease'] = function () {
	robot.keyToggle('alt', 'up');
};

behaviors["ARPG.Fixed.EscapeAndReturn"] = function () {
	robot.keyTap("escape");
	Mode.change(module.exports);
};

var robot = require('robotjs');
var Input = require('../Input');
var Movement = require('../behaviors/Movement');
var AttackInPlace = require('../behaviors/AttackInPlace');
var MAX_INPUT_THUMBSTICK = require('../Enums').MAX_INPUT_THUMBSTICK;
var KEYS = require('../Enums').KEYS;
var SignatureDetection = require('../SignatureDetection');
var Enums = require('../Enums');
var GAME_MODE = Enums.GAME_MODE;
var OptionsMenu = require('./OptionsMenu');
var Mode = require('../Mode');
var Window = require('../Window');
var Logger = require('../Logger');

var BehaviorOfExile = {};
var KeysOfExile = {};
var DPADOfExile = {};

DPADOfExile[KEYS.L3] = '5';
DPADOfExile[KEYS.R3] = 'control';
DPADOfExile[KEYS.DPAD_UP] = '4';
DPADOfExile[KEYS.DPAD_RIGHT] = '3';
DPADOfExile[KEYS.DPAD_DOWN] = '2';
DPADOfExile[KEYS.DPAD_LEFT] = '1';

KeysOfExile[KEYS.KEY_DOWN] = 'w';
KeysOfExile[KEYS.KEY_RIGHT] = 'e';
KeysOfExile[KEYS.KEY_LEFT] = 'q';
KeysOfExile[KEYS.KEY_UP] = 'r';
KeysOfExile[KEYS.KEY_SHOULDER_LEFT] = 'middle';
KeysOfExile[KEYS.KEY_SHOULDER_RIGHT] = 'right';

KeysOfExile[KEYS.KEY_SELECT] = 'ARPG.Fixed.FetchLoot';
KeysOfExile[KEYS.KEY_START] = 'ARPG.Fixed.OptionsMenu';

for (var key in DPADOfExile) {
	BehaviorOfExile[DPADOfExile[key]] = [];
}

for (var key in KeysOfExile) {
	BehaviorOfExile[KeysOfExile[key]] = [];
}

BehaviorOfExile['ARPG.Fixed.OptionsMenu'][0] = null;
BehaviorOfExile['ARPG.Fixed.OptionsMenu'][1] = 'ARPG.Fixed.OptionsMenu';

BehaviorOfExile['ARPG.Fixed.FetchLoot'][0] = "ARPG.Fixed.FetchLootHold";
BehaviorOfExile['ARPG.Fixed.FetchLoot'][1] = "ARPG.Fixed.FetchLootRelease";

var InputKeys = {};
var InputDPAD = {};

var moving = false;
var lastTimeClick = 0;

var LEFT_THUMBSTICK_THRESHOLD = 0.25;

function stopMovementCallback() {
	moving = false;
}

function startMovementCallback() {
	if (!moving && !AttackInPlace.state()) {
		moving = true;
		setTimeout(function () {
			robot.mouseToggle("down");
		}, 20);
	}
}

function LeftThumbIfCallback(x, y) {
	var angle = Math.atan2(y, x);
	Movement.setAngle(angle);
	Movement.move(startMovementCallback);
}

function LeftThumbElseCallback() {
	if (moving) {
		Movement.stop(stopMovementCallback);
	}
}

var LastTimestampStart = 0;

var StartBlockInterval = 750;

function ResolveDataInput(data) {

	var CurrentTimestampStart = new Date().getTime();

	// resolve buttons

	var buttons = data[10];

	// check start first
	var pressed = buttons - KEYS.KEY_START >= 0;
	Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, KEYS.KEY_START, pressed);

	if (pressed) {

		// unpress other buttons
		for (var i = 64; i >= 1; i = i / 2) {
			Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, false);
		}

		// clear l3 and r3
		Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 2, false);
		Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 1, false);

		// clear dpad
		Input.dpad(0, DPADOfExile, InputDPAD, BehaviorOfExile);

		LastTimestampStart = CurrentTimestampStart;

	} else if (CurrentTimestampStart - LastTimestampStart > StartBlockInterval) {

		for (var i = 64; i >= 1; i = i / 2) {
			var pressed = buttons - i >= 0;
			Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}

		// resolve left thumb axis

		Input.moveStick(data[1], data[3],
			MAX_INPUT_THUMBSTICK,
			LEFT_THUMBSTICK_THRESHOLD,
			LeftThumbIfCallback,
			LeftThumbElseCallback);

		// resolve r3 and l3

		buttons = data[11] % 4;

		if (DPADOfExile[buttons]) /* Cases 1 or 2 */ {
			Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, buttons, true);
			if (buttons === 1) {
				Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 2, false);
			} else {
				Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 1, false);
			}
		} else {
			Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 2, false);
			Input.activateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 1, false);
		}

		// resolve dpad

		Input.dpad(data[11], DPADOfExile, InputDPAD, BehaviorOfExile);

		var timestamp = new Date().getTime();

		if (data[9] < 128 && timestamp - lastTimeClick > 500) {

			robot.keyToggle("alt", "down");

			setTimeout(function () {

				robot.mouseClick("left");

				setTimeout(function () {
					robot.keyToggle("alt", "up");
				}, 22);

			}, 50);

			lastTimeClick = timestamp;
		} else if (data[9] > 128 && timestamp - lastTimeClick > 500) {
			robot.keyTap("escape");
			lastTimeClick = timestamp;
		}

	}
}

function EnterArea() {
	SignatureDetection.clearLastSig();
	robot.moveMouse(Window.basePosition.x, Window.basePosition.y);
}

function LeaveArea() {
	Input.clearHeld(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
}

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
		SetBehaviorFunction(KeysOfExile[key], inputArgs[key]);
	}
}

module.exports.enterArea = EnterArea;
module.exports.resolveInput = ResolveDataInput;
module.exports.leaveArea = LeaveArea;
module.exports.setBehavior = SetBehavior;
module.exports.id = GAME_MODE.ARPG;