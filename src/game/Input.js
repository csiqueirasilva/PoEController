module.exports = {};

var robot = require('robotjs');
var KEYS = require('./Enums').KEYS;
var behaviors = require('./Behaviors').functions;
var KeyHandler = require('./behaviors/KeyHandler');
var FunctionLibrary = require('./FunctionLibrary');
var MAX_INPUT_THUMBSTICK = require('./Enums').MAX_INPUT_THUMBSTICK;

var RepeatActionInterval = 90;

robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

function ResolveDpadInput(data, DpadMapping, InputMapping, BehaviorMapping, skipKeyUp) {

	var buttons = parseInt(data / 4) * 4;

	switch (buttons) {
		case KEYS.DPAD_UP:

			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, KEYS.DPAD_UP, true, skipKeyUp);
			for (var i = 12; i <= 28; i = i + 8) {
				ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
			}

			break;
		case KEYS.DPAD_RIGHT:

			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, KEYS.DPAD_RIGHT, true, skipKeyUp);
			for (var i = 4; i <= 28; i = i + 8) {
				if (i !== 12) {
					ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
				}
			}

			break;
		case KEYS.DPAD_DOWN:

			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, KEYS.DPAD_DOWN, true, skipKeyUp);
			for (var i = 4; i <= 28; i = i + 8) {
				if (i !== 20) {
					ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
				}
			}

			break;
		case KEYS.DPAD_LEFT:

			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, KEYS.DPAD_LEFT, true, skipKeyUp);
			for (var i = 4; i <= 20; i = i + 8) {
				ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
			}

			break;
		default:

		for (var i = 4; i <= 28; i = i + 8) {
			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
		}

	}
}

function ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile) {
	robot.mouseToggle("up");

	for (var key in BehaviorOfExile) {
		var ref = FunctionLibrary.indexOf(KeysOfExile, key);
		if (ref === -1) {
			ref = FunctionLibrary.indexOf(DPADOfExile, key);
			if (InputDPAD[ref]) {
				ActionKeyUp(key, BehaviorOfExile);
			}
		} else if (InputKeys[ref]) {
			ActionKeyUp(key, BehaviorOfExile);
		}
	}
}

function ActionKeyUp(key, behaviorReference) {
	KeyHandler.handle(key, "up");

	var behavior = behaviorReference[key];
	if (behavior instanceof Array && behavior.length > 1 && typeof behaviors[behavior[1]] === "function") {
		behaviors[behavior[1]](behavior, key);
	}
}

var ActionRepeatTimestamps = {};

function ActivateKey(keys, reference, behaviorReference, index, pressed, skipKeyUp) {
	var timestamp = new Date().getTime();

	if (keys[index]) {

		var behavior = behaviorReference[keys[index]];

		var behaviorIndex = null;

		if (behavior instanceof Array && behavior.length > 0 && typeof behaviors[behavior[0]] === "function") {
			behaviorIndex = behavior[0];
		} else if (!(behavior instanceof Array) || !behaviors[behavior[0]]) {
			behaviorIndex = "arpg.nothing";
		}

		if (reference[index] && !pressed) {
			reference[index] = false;
			delete ActionRepeatTimestamps[behaviorIndex];
			if (!skipKeyUp) {
				ActionKeyUp(keys[index], behaviorReference);
			}
		} else if (!reference[index] && pressed) {
			reference[index] = true;
			ActionRepeatTimestamps[behaviorIndex] = timestamp;
			behaviors[behaviorIndex](behavior, keys[index]);
		} else if (behaviorIndex.charAt(0) === behaviorIndex.charAt(0).toUpperCase()) /* Repeatable Action */ {
			if (ActionRepeatTimestamps[behaviorIndex] && (timestamp - ActionRepeatTimestamps[behaviorIndex]) > RepeatActionInterval) {
				ActionRepeatTimestamps[behaviorIndex] = timestamp;
				//console.log(behaviorIndex);
				behaviors[behaviorIndex](behavior, keys[index]);
			}
		}
	}
}

function ResetInputArrays(Keys, Dpad) {
	delete ActionRepeatTimestamps;
	ActionRepeatTimestamps = {};

	for (var i = 1; i <= 128; i = i * 2) {
		Keys[i] = false;
	}

	for (var i = 4; i <= 28; i = i + 8) {
		Dpad[i] = false;
	}
}

function MoveThumbstick(DataX, DataY, Max, Threshold, IfCallback, ElseCallback) {
	var x = (DataX - Max) / Max;
	var y = (DataY - Max) / Max;

	if (Math.abs(x) > Threshold || Math.abs(y) > Threshold) {
		IfCallback(x, y);
	} else {
		ElseCallback();
	}
};

var RIGHT_THUMBSTICK_THRESHOLD = 0.16;

function RightThumbIfCallback(x, y) {
	var pos = robot.getMousePos();
	var mouseSpeed = 3;
	x = mouseSpeed * Math.sign(x) * Math.pow(x, 2);
	y = mouseSpeed * Math.sign(y) * Math.pow(y, 2);
	robot.moveMouse(pos.x + x * mouseSpeed, pos.y + y * mouseSpeed);
}

function RightThumbElseCallback() {
}

function LeftThumbstickMouse(data, cbIf, cbElse) {
	// resolve left thumb axis
	MoveThumbstick(data[1], data[3],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD,
		cbIf || RightThumbIfCallback,
		cbElse || RightThumbElseCallback);
}

function RightThumbstickMouse(data) {
	MoveThumbstick(data[5], data[7],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD,
		RightThumbIfCallback,
		RightThumbElseCallback);
}

module.exports.activateKey = ActivateKey;
module.exports.resetInputArrays = ResetInputArrays;
module.exports.leftThumbstickMouse = LeftThumbstickMouse;
module.exports.clearHeld = ClearHeldInput;
module.exports.rightThumbstick = RightThumbstickMouse;
module.exports.moveStick = MoveThumbstick;
module.exports.dpad = ResolveDpadInput;