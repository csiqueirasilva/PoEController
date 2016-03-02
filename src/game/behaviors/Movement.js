var basePosition = require('./game/Input').basePosition;
var Window = require('./game/Window');
	
var globalMoveAngle = 0;
var globalMoveRadius = null;

function move(cb) {
	var R;
	var aspectFix;

	if (globalMoveRadius === null) {
		R = Window.height * 0.0908;
		aspectFix = 1;
	} else {
		R = globalMoveRadius;
		aspectFix = Window.aspect;
	}

	robot.moveMouse(basePosition.x + R * Math.cos(globalMoveAngle) * aspectFix, basePosition.y + R * Math.sin(globalMoveAngle));
	if(cb instanceof Function) {
		cb();
	}
}

function stop(cb) {
	robot.mouseToggle("up");
	if(cb instanceof Function) {
		cb();
	}
}

module.exports = {
	setAngle: function (a) {
		globalMoveAngle = a;
	},
	getAngle: function () {
		return globalMoveAngle;
	},
	setRadius: function (r) {
		globalMoveRadius = r;
	},
	getRadius: function () {
		return globalMoveRadius;
	},
	move: move,
	stop: stop
};