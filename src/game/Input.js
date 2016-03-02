var robot = require('robotjs');
var Window = require('./game/Window');
var KEYS = require('./game/Enums').KEYS;
var behaviors = require('./game/Behaviors').functions;
var Movement = require('./game/behaviors/Movement');
var MAX_INPUT_THUMBSTICK = require('./game/Enums').MAX_INPUT_THUMBSTICK;

var InputInterval = 15;
var RepeatActionInterval = 90;

robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

var basePosition = {
	x: Window.width / 2,
	y: Window.height * 0.44
};

function IsMouseInput(Key) {
	return Key === "left" || Key === "right" || Key === "middle";
}

function ActionKey(Key, Action) {
	if (IsMouseInput(Key)) {
		robot.mouseToggle(Action, Key);
	} else if (Key.match(/\./) === null) {
		robot.keyToggle(Key, Action);
	}
}

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
		var ref = IndexOf(KeysOfExile, key);
		if (ref === -1) {
			ref = IndexOf(DPADOfExile, key);
			if (InputDPAD[ref]) {
				ActionKeyUp(key, BehaviorOfExile);
			}
		} else if (InputKeys[ref]) {
			ActionKeyUp(key, BehaviorOfExile);
		}
	}
}

function ActionKeyUp(key, behaviorReference) {
	ActionKey(key, "up");

	var behavior = behaviorReference[key];
	if (behavior instanceof Array && behavior.length > 1 && behaviors[behavior[1]] instanceof Function) {
		behaviors[behavior[1]](behavior, key);
	}
}

var ActionRepeatTimestamps = {};

function ActivateKey(keys, reference, behaviorReference, index, pressed, skipKeyUp) {
	var timestamp = new Date().getTime();

	if (keys[index]) {

		var behavior = behaviorReference[keys[index]];

		var behaviorIndex = null;

		if (behavior instanceof Array && behavior.length > 0 && behaviors[behavior[0]] instanceof Function) {
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

var MoveThumbstick = (function () {

	var Function = function (DataX, DataY, Max, Threshold, IfCallback, ElseCallback) {
		var x = (DataX - Max) / Max;
		var y = (DataY - Max) / Max;

		if (Math.abs(x) > Threshold || Math.abs(y) > Threshold) {
			IfCallback(x, y);
		} else {
			ElseCallback();
		}

	};

	return Function;

})();

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

var LastIncrementActionTimeout = null;

function MouseWithIncrementKeyDown(R, key) {
	if (LastIncrementActionTimeout === null) {
		Movement.setRadius(R);
		var angle = Movement.getAngle();
		robot.moveMouse(basePosition.x + R * Math.cos(angle), basePosition.y + R * Math.sin(angle));

		LastIncrementActionTimeout = setTimeout(function () {
			ActionKey(key, "down");
			LastIncrementActionTimeout = null;
		}, InputInterval * 1.5);
	}
}

function MouseWithIncrementKeyUp() {
	Movement.setRadius(null);
}

function LeftThumbstickMouse(data, cb) {
	
	// resolve left thumb axis
	MoveThumbstick(data[1], data[3],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD,
		cb,
		RightThumbElseCallback);
		
}

modules.export = {
	basePosition: basePosition,
	mouseWithIncrementKeyDown: MouseWithIncrementKeyDown,
	mouseWithIncrementKeyUp: MouseWithIncrementKeyUp,
	activateKey: ActivateKey,
	actionKey: ActionKey,
	resetInputArrays: ResetInputArrays,
	leftThumbstickMouse: LeftThumbstickMouse
};