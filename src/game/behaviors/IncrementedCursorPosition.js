var Enums = require('../Enums');
var Window = require('../Window');
var Movement = require('./Movement');
var KeyHandler = require('./KeyHandler');
var robot = require('robotjs');
		
var LastIncrementActionTimeout = null;

function MouseWithIncrementKeyDown(R, key) {
	if (LastIncrementActionTimeout === null) {
		Movement.setRadius(R);
		var angle = Movement.getAngle();
		robot.moveMouse(Window.basePosition.x + R * Math.cos(angle), Window.basePosition.y + R * Math.sin(angle));

		LastIncrementActionTimeout = setTimeout(function () {
			KeyHandler.handle(key, "down");
			LastIncrementActionTimeout = null;
		}, Enums.GLOBAL_INTERVAL * 1.5);
	}
}

function MouseWithIncrementKeyUp(key) {
	KeyHandler.handle(key, "up");
	Movement.setRadius(null);
}

module.exports = {
	mouseWithIncrementKeyDown: MouseWithIncrementKeyDown,
	mouseWithIncrementKeyUp: MouseWithIncrementKeyUp
};