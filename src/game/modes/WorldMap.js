var Enums = require('../Enums');
var KEYS = Enums.KEYS;
var GAME_MODE = Enums.GAME_MODE;
var robot = require('robotjs');
var Window = require('../Window');
var Input = require('../Input');

var BehaviorOfExile = {
	'left': [],
	'right': [],
	'ARPG.Fixed.EscapeAndReturn': [null, 'ARPG.Fixed.EscapeAndReturn']
};

var KeysOfExile = {};

KeysOfExile[KEYS.KEY_DOWN] = 'left';
KeysOfExile[KEYS.SHOULDER_KEY_LEFT] = 'control';
KeysOfExile[KEYS.KEY_START] = 'ARPG.Fixed.EscapeAndReturn';

var DPADOfExile = {};

var InputKeys = {};

var InputDPAD = {};

var limitX = Window.width * 0.34;

function WorldMapIfLeftThumbstick(x, y) {

	var pos = robot.getMousePos();
	var mouseSpeed = 3;
	x = mouseSpeed * Math.sign(x) * Math.pow(x, 2);
	y = mouseSpeed * Math.sign(y) * Math.pow(y, 2);

	var finalX = pos.x + x * mouseSpeed;

	if (finalX > limitX) {
		finalX = limitX;
	}

	robot.moveMouse(finalX, pos.y + y * mouseSpeed);
}

function ResolveInput(data) {

	var buttons = data[10];

	for (var i = 128; i >= 1; i = i / 2) {
		pressed = buttons - i >= 0;
		Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
		buttons = buttons >= i ? buttons - i : buttons;
	}

	Input.leftThumbstickMouse(data, WorldMapIfLeftThumbstick);
}

function EnterArea() {
	robot.moveMouse(limitX / 2, Window.height * 0.5);
}

function LeaveArea() {
	Input.clearHeld(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
}

module.exports = {
	enterArea: EnterArea,
	resolveInput: ResolveInput,
	leaveArea: LeaveArea,
	id: GAME_MODE.WORLD_MAP
};