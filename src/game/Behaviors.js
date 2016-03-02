var robot = require('robotjs');
var AttackInPlace = require('./behaviors/AttackInPlace');
var Input = require('./Input');
var Window = require('./Window');

var behaviors = {};

behaviors['arpg.nothing'] = function (args, key) {
	Input.actionKey(key, "down");
};

behaviors['ARPG.MouseNeutral'] = function (args, key) {
	robot.moveMouse(Input.basePosition.x, Input.basePosition.y);
	Input.actionKey(key, "down");
};

behaviors['arpg.ShiftMouseLastAngleLow.KeyDown'] = function (args, key) {
	AttackInPlace.setAttackInPlace();
	behaviors['arpg.MouseLastAngleLow.KeyDown'](args, key);
};

behaviors['arpg.ShiftMouseLastAngleLow.KeyUp'] = function (args, key) {
	AttackInPlace.clearAttackInPlace();
	behaviors['arpg.MouseLastAngleLow.KeyUp'](args, key);
};

behaviors['arpg.ShiftMouseLastAngleMid.KeyDown'] = function (args, key) {
	AttackInPlace.setAttackInPlace();
	behaviors['arpg.MouseLastAngleMid.KeyDown'](args, key);
};

behaviors['arpg.ShiftMouseLastAngleMid.KeyUp'] = function (args, key) {
	AttackInPlace.clearAttackInPlace();
	behaviors['arpg.MouseLastAngleMid.KeyUp'](args, key);
};

behaviors['arpg.ShiftMouseLastAngleHigh.KeyDown'] = function (args, key) {
	AttackInPlace.setAttackInPlace();
	behaviors['arpg.MouseLastAngleHigh.KeyDown'](args, key);
};

behaviors['arpg.ShiftMouseLastAngleHigh.KeyUp'] = function (args, key) {
	AttackInPlace.clearAttackInPlace();
	behaviors['arpg.MouseLastAngleHigh.KeyUp'](args, key);
};

behaviors['arpg.MouseLastAngleLow.KeyDown'] = function (args, key) {
	Input.mouseWithIncrementKeyDown(Window.height * 0.1, key);
};

behaviors['arpg.MouseLastAngleLow.KeyUp'] = function (args, key) {
	Input.mouseWithIncrementKeyUp();
};

behaviors['arpg.MouseLastAngleMid.KeyDown'] = function (args, key) {
	Input.mouseWithIncrementKeyDown(Window.height * 0.225, key);
};

behaviors['arpg.MouseLastAngleMid.KeyUp'] = function (args, key) {
	Input.mouseWithIncrementKeyUp();
};

behaviors['arpg.MouseLastAngleHigh.KeyDown'] = function (args, key) {
	Input.mouseWithIncrementKeyDown(Window.height * 0.35, key);
};

behaviors['arpg.MouseLastAngleHigh.KeyUp'] = function (args, key) {
	Input.mouseWithIncrementKeyUp();
};

var exported = {
	"Simple": [
		{
			name: "Just press",
			key: "arpg.nothing",
			help: "Just press the key. Use the last mouse cursor position for some abilities. Good for generic ranged attacks."
		},
		{
			name: "Center mouse and press",
			key: "ARPG.MouseNeutral",
			help: "Move the mouse to the center position and press the key. Good for melee attacks (use game client's aim bot)."
		}
	],
	"Increment": [
		{
			name: "Small increment to cursor position",
			key: "arpg.MouseLastAngleLow.KeyDown",
			help: "Use a small increment to the cursor position last angle before pressing the button. Good for totems and traps"
		},
		{
			name: "Medium increment to cursor position",
			key: "arpg.MouseLastAngleMid.KeyDown",
			help: "Use a medium increment to the cursor position last angle before pressing the button. Good for totems, traps and skills like leap slam"
		},
		{
			name: "High increment to cursor position",
			key: "arpg.MouseLastAngleHigh.KeyDown",
			help: "Use a high increment to the cursor position last angle before pressing the button. Good for totems, traps and skills like leap slam"
		}
	],
	"Holding position": [
		{
			name: "(H. Position) Small increment to cursor position",
			key: "arpg.ShiftMouseLastAngleLow.KeyDown",
			help: "Use a small increment to the cursor position last angle before pressing the button and while holding attack in place. Good for ranged attacks and spells"
		},
		{
			name: "(H. Position) Medium increment to cursor position",
			key: "arpg.ShiftMouseLastAngleMid.KeyDown",
			help: "Use a medium increment to the cursor position last angle before pressing the button and while holding attack in place. Good for ranged attacks and spells"
		},
		{
			name: "(H. Position) High increment to cursor position",
			key: "arpg.ShiftMouseLastAngleHigh.KeyDown",
			help: "Use a high increment to the cursor position last angle before pressing the button and while holding attack in place. Good for ranged attacks and spells"
		}
	]
};

module.exports = {
	functions: behaviors,
	exported: exported
};