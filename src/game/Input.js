module.exports = {};

const events = require('events');
const eventEmitter = new events.EventEmitter();

var robot = require('robotjs');
var KEYS = require('./Enums').KEYS;
var KeyHandler = require('./behaviors/KeyHandler');
var FunctionLibrary = require('./FunctionLibrary');
var ARPG = require('./modes/ARPG');
var Movement = require('./behaviors/Movement');
var Settings = require('../menu/UserSettings').Settings;

robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

function MoveThumbstickRight(DataX, DataY, Max, Threshold) {
	var x = (DataX - Max) / Max;
	var y = (DataY - Max) / Max;

	if (Math.abs(x) > Threshold || Math.abs(y) > Threshold) {
		var pos = robot.getMousePos();
		var mouseSpeed = 3;
		x = mouseSpeed * Math.sign(x) * Math.pow(x, 2);
		y = mouseSpeed * Math.sign(y) * Math.pow(y, 2);
		robot.moveMouse(pos.x + x * mouseSpeed, pos.y + y * mouseSpeed);
	}
}

function MoveThumbstickLeft(DataX, DataY, Max, Threshold) {
	var x = (DataX - Max) / Max;
	var y = (DataY - Max) / Max;

	if (Math.abs(x) > Threshold || Math.abs(y) > Threshold) {
		var angle = Math.atan2(y, x);
		Movement.setAngle(angle);
		Movement.move(startMovementCallback);
	} else if (moving) {
		Movement.stop(stopMovementCallback);
	}
}

var moving = false;

function stopMovementCallback() {
	moving = false;
}

function startMovementCallback() {
	if (!moving) {
		moving = true;
		setTimeout(function () {
			robot.mouseToggle("down");
		}, 20);
	}
}

eventEmitter.on('keydown', function(key) {
	
	if(Settings.debug) {
		console.log('keydown: ' + FunctionLibrary.indexOf(KEYS, key));
	}
	
	switch(key) {
		case KEYS.KEY_UP:
		case KEYS.KEY_DOWN:
		case KEYS.KEY_LEFT:
		case KEYS.KEY_RIGHT:
		case KEYS.KEY_SHOULDER_LEFT:
		case KEYS.KEY_SHOULDER_RIGHT: 
		/* use configured behavior; keydown */
			var fn = ARPG.behaviors[key];
			
			if(ARPG.functions[fn[0]] instanceof Function) {
				ARPG.functions[fn[0]](null, ARPG.keys[key]);
			}
		break;
		case KEYS.DPAD_UP:
		case KEYS.DPAD_RIGHT:
		case KEYS.DPAD_DOWN:
		case KEYS.DPAD_LEFT:
		case KEYS.L3: 
			var k = ARPG.keys[key];
			KeyHandler.handle(k, 'down');
		break;
		case KEYS.R3:
			KeyHandler.handle('control', 'down');
		break;
		case KEYS.KEY_SHOULDER_LEFT2:
			KeyHandler.handle('escape', 'down');
		break;		
		case KEYS.KEY_SHOULDER_RIGHT2:
			KeyHandler.handle('left', 'down');
		break;		
		case KEYS.KEY_SELECT:
			ARPG.functions['ARPG.Fixed.FetchLootHold']();
		break;
		case KEYS.KEY_START:
			KeyHandler.handle('i', 'down');
	}
	
});

eventEmitter.on('keyup', function(key) {
	
	if(Settings.debug) {
		console.log('keyup: ' + FunctionLibrary.indexOf(KEYS, key));
	}
	
	switch(key) {
		case KEYS.KEY_UP:
		case KEYS.KEY_DOWN:
		case KEYS.KEY_LEFT:
		case KEYS.KEY_RIGHT:
		case KEYS.KEY_SHOULDER_LEFT:
		case KEYS.KEY_SHOULDER_RIGHT: 
		/* use configured behavior; keydown */
			var fn = ARPG.behaviors[key];
			if(ARPG.functions[fn[1]] instanceof Function) {
				ARPG.functions[fn[1]](null, ARPG.keys[key]);
			} else {
				KeyHandler.handle(ARPG.keys[key], 'up');
			}
		break;
		case KEYS.DPAD_UP:
		case KEYS.DPAD_RIGHT:
		case KEYS.DPAD_DOWN:
		case KEYS.DPAD_LEFT:
		case KEYS.L3: 
			var k = ARPG.keys[key];
			KeyHandler.handle(k, 'up');
		break;
		case KEYS.R3:
			KeyHandler.handle('control', 'up');
		break;
		case KEYS.KEY_SHOULDER_LEFT2:
			KeyHandler.handle('escape', 'up');
		break;		
		case KEYS.KEY_SHOULDER_RIGHT2:
			KeyHandler.handle('left', 'up');
		break;
		case KEYS.KEY_SELECT:
			ARPG.functions['ARPG.Fixed.FetchLootRelease']();
		break;
		case KEYS.KEY_START:
			KeyHandler.handle('i', 'up');
	}
	
});

module.exports.emitter = eventEmitter;
module.exports.moveStickL = MoveThumbstickLeft;
module.exports.moveStickR = MoveThumbstickRight;