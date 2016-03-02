var Enums = require('./game/Enums');
var KEYS = Enums.KEYS;
var GAME_MODE = Enums.GAME_MODE;
var Game = require('./game/Game');
var robot = require('robotjs');
var Window = require('./game/Window');
var Input = require('./game/Input');
var behaviors = require('./game/Behaviors');

var BehaviorOfExile = {
	'left': [],
	'right': [],
	'PassiveSkillTree.ScrollDown': ["PassiveSkillTree.ScrollDown"],
	'PassiveSkillTree.ScrollUp': ["PassiveSkillTree.ScrollUp"],
	'ARPG.FetchLoot': ["ARPG.Fixed.FetchLootHold", "ARPG.Fixed.FetchLootRelease"],
	'ARPG.Fixed.EscapeAndReturn': [null, 'ARPG.Fixed.EscapeAndReturn']
};

var KeysOfExile = {
	1: 'left',
	16: 'PassiveSkillTree.ScrollDown',
	32: 'PassiveSkillTree.ScrollUp',
	64: 'ARPG.FetchLoot',
	128: 'ARPG.Fixed.EscapeAndReturn'
};

var DPADOfExile = {};

var InputKeys = {};

var InputDPAD = {};

behaviors['PassiveSkillTree.ScrollDown'] = function () {};

behaviors['PassiveSkillTree.ScrollUp'] = function () {};

function ResolveInput(data) {

	//console.log(robot.getMousePos());

	var buttons = data[10];

	for (var i = 128; i >= 1; i = i / 2) {
		pressed = buttons - i >= 0;
		Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
		buttons = buttons >= i ? buttons - i : buttons;
	}

	Input.leftThumbstickMouse(data);
}

function EnterArea() {
}

function LeaveArea() {
	Input.clearHeld(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
}

module.exports = {
	enterArea: EnterArea,
	resolveInput: ResolveInput,
	leaveArea: LeaveArea
};