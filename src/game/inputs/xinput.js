var KEYS = require('../Enums').KEYS;
var Input = require('../Input');
var emitter = Input.emitter;
var Settings = require('../../menu/UserSettings').Settings;

var LEFT_THUMBSTICK_THRESHOLD = Settings.leftStickDeadzone;
var RIGHT_THUMBSTICK_THRESHOLD = Settings.rightStickDeadzone;
var MAX_INPUT_THUMBSTICK = 128;

function LeftStick(data) {
	Input.moveStickL(data[1], 0xFF - data[2],
		MAX_INPUT_THUMBSTICK,
		LEFT_THUMBSTICK_THRESHOLD);
}

function RightStick(data) {
	Input.moveStickR(data[3], 0xFF - data[4],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD);
}

let pressed = {};
var dpad = 0;
var r3l3 = 0;

var mappings = [];

function addMapping(keyId, bitmask, idx) {
	var mapping = {
		keyId: keyId,
		bitmask: bitmask,
		idx: idx
	};
	mappings.push(mapping);
}

addMapping(KEYS.KEY_UP, 0x80, 7);
addMapping(KEYS.KEY_LEFT, 0x40, 7);
addMapping(KEYS.KEY_DOWN, 0x10, 7);
addMapping(KEYS.KEY_RIGHT, 0x20, 7);

addMapping(KEYS.KEY_SHOULDER_LEFT, 0x01, 7);
addMapping(KEYS.KEY_SHOULDER_RIGHT, 0x02, 7);
addMapping(KEYS.KEY_SHOULDER_LEFT2, 0x08, 7);
addMapping(KEYS.KEY_SHOULDER_RIGHT2, 0x04, 7);

addMapping(KEYS.DPAD_UP, 0x01, 8);
addMapping(KEYS.DPAD_LEFT, 0x04, 8);
addMapping(KEYS.DPAD_DOWN, 0x02, 8);
addMapping(KEYS.DPAD_RIGHT, 0x08, 8);

addMapping(KEYS.L3, 0x40, 8);
addMapping(KEYS.R3, 0x80, 8);
addMapping(KEYS.KEY_SELECT, 0x20, 8);
addMapping(KEYS.KEY_START, 0x10, 8);

function checkMappings(data) {
	mappings.forEach((el) => {
		if((data[el.idx] & el.bitmask) && !pressed[el.keyId]) {
			pressed[el.keyId] = true;
			emitter.emit('keydown', el.keyId);
		} else if(pressed[el.keyId] && !(data[el.idx] & el.bitmask)) {
			pressed[el.keyId] = false;
			emitter.emit('keyup', el.keyId);
		}
	});
}

function handleInput(data) {
	var ret = null;
	LeftStick(data);
	RightStick(data);
	checkMappings(data);
}

module.exports = {
	handleInput: handleInput
};
