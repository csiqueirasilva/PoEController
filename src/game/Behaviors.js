var behaviors = {};

module.exports = {};

module.exports.functions = behaviors;

module.exports.exported = {
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
	]
};

var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;

if(BrowserWindow !== undefined) {

	var KeyHandler = require('./behaviors/KeyHandler');
	var Window = require('./Window');
	var IncrementedCursorPosition = require('./behaviors/IncrementedCursorPosition');
	
	var robot = require('robotjs');

	behaviors['arpg.nothing'] = function (args, key) {
		KeyHandler.handle(key, "down");
	};

	behaviors['ARPG.MouseNeutral'] = function (args, key) {
		robot.moveMouse(Window.basePosition.x, Window.basePosition.y);
		KeyHandler.handle(key, "down");
	};

	behaviors['arpg.MouseLastAngleLow.KeyDown'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyDown(Window.height * 0.1, key);
	};

	behaviors['arpg.MouseLastAngleLow.KeyUp'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyUp(key);
	};

	behaviors['arpg.MouseLastAngleMid.KeyDown'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyDown(Window.height * 0.225, key);
	};

	behaviors['arpg.MouseLastAngleMid.KeyUp'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyUp(key);
	};

	behaviors['arpg.MouseLastAngleHigh.KeyDown'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyDown(Window.height * 0.35, key);
	};

	behaviors['arpg.MouseLastAngleHigh.KeyUp'] = function (args, key) {
		IncrementedCursorPosition.mouseWithIncrementKeyUp(key);
	};

}