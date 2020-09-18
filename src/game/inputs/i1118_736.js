var KEYS = require('../Enums').KEYS;
var Input = require('../Input');
var emitter = Input.emitter;
var Settings = require('../../menu/UserSettings').Settings;

var LEFT_THUMBSTICK_THRESHOLD = 0.16;
var RIGHT_THUMBSTICK_THRESHOLD = 0.06;
var MAX_INPUT_THUMBSTICK = 128;

function LeftStick(data) {
	Input.moveStickL(data[1], data[3],
		MAX_INPUT_THUMBSTICK,
		LEFT_THUMBSTICK_THRESHOLD);
}

function RightStick(data) {
	Input.moveStickR(data[5], data[7],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD);
}

let pressed = {};
var dpad = 0;
var r3l3 = 0;

function handleInput(data) {
	var ret = null;
	
	LeftStick(data);
	RightStick(data);
	
	if((data[10] & 0b00001000) && !pressed[KEYS.KEY_UP]) { // is 8 Y 
		pressed[KEYS.KEY_UP] = true;
		emitter.emit('keydown', KEYS.KEY_UP);
	} else if(pressed[KEYS.KEY_UP] && !(data[10] & 0b00001000)) { // not 8 B
		pressed[KEYS.KEY_UP] = false;
		emitter.emit('keyup', KEYS.KEY_UP);
	}
	
	if((data[10] & 0b00000010) && !pressed[KEYS.KEY_RIGHT]) { // is 2 B
		pressed[KEYS.KEY_RIGHT] = true;
		emitter.emit('keydown', KEYS.KEY_RIGHT);
	} else if(pressed[KEYS.KEY_RIGHT] && !(data[10] & 0b00000010)) { // not 2 B
		pressed[KEYS.KEY_RIGHT] = false;
		emitter.emit('keyup', KEYS.KEY_RIGHT);
	}
	
	if((data[10] & 0b00000001) && !pressed[KEYS.KEY_DOWN]) { // is 1 A
		pressed[KEYS.KEY_DOWN] = true;
		emitter.emit('keydown', KEYS.KEY_DOWN);
	} else if(pressed[KEYS.KEY_DOWN] && !(data[10] & 0b00000001)) { // not 1 A
		pressed[KEYS.KEY_DOWN] = false;
		emitter.emit('keyup', KEYS.KEY_DOWN);
	}
	
	if((data[10] & 0b00000100) && !pressed[KEYS.KEY_LEFT]) { // is 4 X
		pressed[KEYS.KEY_LEFT] = true;
		emitter.emit('keydown', KEYS.KEY_LEFT);
	} else if(pressed[KEYS.KEY_LEFT] && !(data[10] & 0b00000100)) { // not 4 X
		pressed[KEYS.KEY_LEFT] = false;
		emitter.emit('keyup', KEYS.KEY_LEFT);
	}
	
	// check dpad
	
	dpad = data[11] & 0b111100; // mask to get pov hat bits; could shift to get rid of zeros but did not
	
	// KEYS.DPAD_UPLEFT
	if(dpad == 0b100000) { // is 32 d-left + d-up
		if(!pressed[KEYS.DPAD_LEFT]) {
			pressed[KEYS.DPAD_LEFT] = true;
			emitter.emit('keydown', KEYS.DPAD_LEFT);
		}
		
		if(!pressed[KEYS.DPAD_UP]) {
			pressed[KEYS.DPAD_UP] = true;
			emitter.emit('keydown', KEYS.DPAD_UP);
		}
	} else if(dpad != 0b100000) { // not 32 d-left + d-up
		if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b011100) && (dpad !== 0b011000)) { // not 28 d-left, not 24 d-left + d-down
			pressed[KEYS.DPAD_LEFT] = false;
			emitter.emit('keyup', KEYS.DPAD_LEFT);
		}
		
		if(pressed[KEYS.DPAD_UP] && (dpad !== 0b001000) && (dpad !== 0b000100)) { // not 8 d-right + d-up, not 4 d-up
			pressed[KEYS.DPAD_UP] = false;
			emitter.emit('keyup', KEYS.DPAD_UP);
		}
	}
	
	// KEYS.DPAD_DOWNLEFT
	if(dpad === 0b011000) { // is 24 d-left + d-down
		if(!pressed[KEYS.DPAD_LEFT]) {
			pressed[KEYS.DPAD_LEFT] = true;
			emitter.emit('keydown', KEYS.DPAD_LEFT);
		}
		
		if(!pressed[KEYS.DPAD_DOWN]) {
			pressed[KEYS.DPAD_DOWN] = true;
			emitter.emit('keydown', KEYS.DPAD_DOWN);
		}
	} else if(dpad !== 0b011000) { // not 24 d-left + d-down
		if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b011100) && (dpad !== 0b100000)) { // not 28 d-left, not 32 d-left + d-up
			pressed[KEYS.DPAD_LEFT] = false;
			emitter.emit('keyup', KEYS.DPAD_LEFT);
		}
		
		if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b010100) && (dpad !== 0b010000)) { // not 20 d-down, not 16 d-down + d-right
			pressed[KEYS.DPAD_DOWN] = false;
			emitter.emit('keyup', KEYS.DPAD_DOWN);
		}
	}
	
	// KEYS.DPAD_RIGHTDOWN
	if(dpad === 0b010000) { // is 16 d-down + d-right
		if(!pressed[KEYS.DPAD_RIGHT]) {
			pressed[KEYS.DPAD_RIGHT] = true;
			emitter.emit('keydown', KEYS.DPAD_RIGHT);
		}
		
		if(!pressed[KEYS.DPAD_DOWN]) {
			pressed[KEYS.DPAD_DOWN] = true;
			emitter.emit('keydown', KEYS.DPAD_DOWN);
		}
	} else if(dpad !== 0b010000) { // not 16 d-down + d-right
		if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b001000) && (dpad !== 0b001100)) { // not 8 d-right + d-up, not 12 d-right
			pressed[KEYS.DPAD_RIGHT] = false;
			emitter.emit('keyup', KEYS.DPAD_RIGHT);
		}
		
		if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b010100) && (dpad !== 0b011000)) { // not 20 d-down, not 24 d-left + d-down
			pressed[KEYS.DPAD_DOWN] = false;
			emitter.emit('keyup', KEYS.DPAD_DOWN);
		}
	}
	
	// KEYS.DPAD_UPRIGHT
	if(dpad === 0b001000) { // is 8 d-right + d-up
		if(!pressed[KEYS.DPAD_RIGHT]) {
			pressed[KEYS.DPAD_RIGHT] = true;
			emitter.emit('keydown', KEYS.DPAD_RIGHT);
		}
		
		if(!pressed[KEYS.DPAD_UP]) {
			pressed[KEYS.DPAD_UP] = true;
			emitter.emit('keydown', KEYS.DPAD_UP);
		}
	} else if(dpad !== 0b001000) { // not 8 d-right + d-up
		if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b010000) && (dpad !== 0b001100)) { // not 16 d-right + d-down, not 12 d-right
			pressed[KEYS.DPAD_RIGHT] = false;
			emitter.emit('keyup', KEYS.DPAD_RIGHT);
		}
		
		if(pressed[KEYS.DPAD_UP] && (dpad !== 0b100000) && (dpad !== 0b000100)) { // not 32 d-left + d-up, not 4 d-up
			pressed[KEYS.DPAD_UP] = false;
			emitter.emit('keyup', KEYS.DPAD_UP);
		}
	}
	
	if((dpad == 0b011100) && !pressed[KEYS.DPAD_LEFT]) { // is 28 d-left
		pressed[KEYS.DPAD_LEFT] = true;
		emitter.emit('keydown', KEYS.DPAD_LEFT);
	} else if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b011100) && (dpad !== 0b011000) && (dpad !== 0b100000)) { // not 28 d-left, not 24 d-left + d-down, not 32 d-left + d-up
		pressed[KEYS.DPAD_LEFT] = false;
		emitter.emit('keyup', KEYS.DPAD_LEFT);
	}
	
	if((dpad == 0b001100) && !pressed[KEYS.DPAD_RIGHT]) { // is 12 d-right
		pressed[KEYS.DPAD_RIGHT] = true;
		emitter.emit('keydown', KEYS.DPAD_RIGHT);
	} else if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b001100) && (dpad !== 0b010000) && (dpad !== 0b001000)) { // not 12 d-right, not 16 d-down + d-right, not 8 d-right + d-up
		pressed[KEYS.DPAD_RIGHT] = false;
		emitter.emit('keyup', KEYS.DPAD_RIGHT);
	}
	
	if((dpad == 0b010100) && !pressed[KEYS.DPAD_DOWN]) { // is 20 d-down
		pressed[KEYS.DPAD_DOWN] = true;
		emitter.emit('keydown', KEYS.DPAD_DOWN);
	} else if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b010100) && (dpad !== 0b010000) && (dpad !== 0b011000)) { // not 20 d-up, not 16 d-down + d-right, not 24 d-left + d-down
		pressed[KEYS.DPAD_DOWN] = false;
		emitter.emit('keyup', KEYS.DPAD_DOWN);
	}
	
	if((dpad == 0b000100) && !pressed[KEYS.DPAD_UP]) { // is 4 d-up
		pressed[KEYS.DPAD_UP] = true;
		emitter.emit('keydown', KEYS.DPAD_UP);
	} else if(pressed[KEYS.DPAD_UP] && (dpad !== 0b000100) && (dpad !== 0b001000) && (dpad !== 0b100000)) { // not 4 d-up, not 8 d-right + d-up, not 32 d-left + d-up
		pressed[KEYS.DPAD_UP] = false;
		emitter.emit('keyup', KEYS.DPAD_UP);
	}
	
	// end of dpad
	
	if((data[10] & 0b01000000) && !pressed[KEYS.KEY_SELECT]) { // is 64 select
		pressed[KEYS.KEY_SELECT] = true;
		emitter.emit('keydown', KEYS.KEY_SELECT);
	} else if(pressed[KEYS.KEY_SELECT] && !(data[10] & 0b01000000)) { // not 64 select
		pressed[KEYS.KEY_SELECT] = false;
		emitter.emit('keyup', KEYS.KEY_SELECT);
	}
	
	if((data[10] & 0b10000000) && !pressed[KEYS.KEY_START]) { // is 128 start
		pressed[KEYS.KEY_START] = true;
		emitter.emit('keydown', KEYS.KEY_START);
	} else if(pressed[KEYS.KEY_START] && !(data[10] & 0b10000000)) { // not 128 start
		pressed[KEYS.KEY_START] = false;
		emitter.emit('keyup', KEYS.KEY_START);
	}
	
	r3l3 = data[11] & 0b11; // mask to get only 2 last bits
	
	if((r3l3 & 0b10) && !pressed[KEYS.R3]) { // is 2 r3
		pressed[KEYS.R3] = true;
		emitter.emit('keydown', KEYS.R3);
	} else if(pressed[KEYS.R3] && !(r3l3 & 0b10)) { // not 2 r3
		pressed[KEYS.R3] = false;
		emitter.emit('keyup', KEYS.R3);
	}
	
	if((r3l3 & 0b01) && !pressed[KEYS.L3]) { // is 1 l3
		pressed[KEYS.L3] = true;
		emitter.emit('keydown', KEYS.L3);
	} else if(pressed[KEYS.L3] && !(r3l3 & 0b01)) { // not 1 l3
		pressed[KEYS.L3] = false;
		emitter.emit('keyup', KEYS.L3);
	}
	
	/* proposed solution for L2 and R2 */
	
	if((data[9] < 128) && !pressed[KEYS.KEY_SHOULDER_RIGHT2]) { // is shoulder trigger right
		pressed[KEYS.KEY_SHOULDER_RIGHT2] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_RIGHT2);
	} else if(pressed[KEYS.KEY_SHOULDER_RIGHT2] && (data[9] >= 128)) { // not shoulder trigger right
		pressed[KEYS.KEY_SHOULDER_RIGHT2] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_RIGHT2);
	}
	
	if((data[9] > 128) && !pressed[KEYS.KEY_SHOULDER_LEFT2]) { // is shoulder trigger right
		pressed[KEYS.KEY_SHOULDER_LEFT2] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_LEFT2);
	} else if(pressed[KEYS.KEY_SHOULDER_LEFT2] && (data[9] <= 128)) { // not shoulder trigger right
		pressed[KEYS.KEY_SHOULDER_LEFT2] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_LEFT2);
	}
	
	// Shoulder buttons
	if((data[10] & 0b00100000) && !pressed[KEYS.KEY_SHOULDER_RIGHT]) {
		pressed[KEYS.KEY_SHOULDER_RIGHT] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_RIGHT);
	} else if(pressed[KEYS.KEY_SHOULDER_RIGHT] && !(data[10] & 0b00100000)) {
		pressed[KEYS.KEY_SHOULDER_RIGHT] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_RIGHT);
	}
	
	if((data[10] & 0b00010000) && !pressed[KEYS.KEY_SHOULDER_LEFT]) {
		pressed[KEYS.KEY_SHOULDER_LEFT] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_LEFT);
	} else if(pressed[KEYS.KEY_SHOULDER_LEFT] && !(data[10] & 0b00010000)) {
		pressed[KEYS.KEY_SHOULDER_LEFT] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_LEFT);
	}
	
}

module.exports = {
	handleInput: handleInput
};
