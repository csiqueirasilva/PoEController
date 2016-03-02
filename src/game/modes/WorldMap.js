var Enums = require('./game/Enums');
var KEYS = Enums.KEYS;
var robot = require('robotjs');
var GAME_MODE = Enums.GAME_MODE;
var Game = require('./game/Game');
var Window = require('./game/Window');
var Input = require('./game/Input');

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

	// resolve left thumb axis
	MoveThumbstick(data[1], data[3],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD,
		WorldMapIfLeftThumbstick,
		RightThumbElseCallback);
}

function EnterArea() {
	robot.moveMouse(limitX / 2, Window.height * 0.5);
}

function LeaveArea() {
	ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
}

module.exports = {
	enterArea: EnterArea,
	resolveInput: ResolveInput,
	leaveArea: LeaveArea
};