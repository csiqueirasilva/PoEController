var KEYS = require('../Enums').KEYS;
var Input = require('../Input');
var emitter = Input.emitter;
var Settings = require('../../menu/UserSettings').Settings;

var LEFT_THUMBSTICK_THRESHOLD = 0.16;
var RIGHT_THUMBSTICK_THRESHOLD = 0.06;
var MAX_INPUT_THUMBSTICK = 128;

function LeftStick(data) {
	Input.moveStickL(data[1], data[2],
		MAX_INPUT_THUMBSTICK,
		LEFT_THUMBSTICK_THRESHOLD);
}

function RightStick(data) {
	Input.moveStickR(data[3], data[4],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD);
}

let pressed = {};
var dpad = 0;

function handleInput(data) {
	var ret = null;

	if(Settings.bluetooth) {
		data = data.slice(2);
	}
	
	LeftStick(data);
	RightStick(data);
	
	if(!(data[5] ^ 0b10001000 && data[5] ^ 0b10000000) && !pressed[KEYS.KEY_UP]) {
		pressed[KEYS.KEY_UP] = true;
		emitter.emit('keydown', KEYS.KEY_UP);
	} else if(pressed[KEYS.KEY_UP] && !(data[5] & 0b10000000)) {
		pressed[KEYS.KEY_UP] = false;
		emitter.emit('keyup', KEYS.KEY_UP);
	}
	
	if(!(data[5] ^ 0b01001000 && data[5] ^ 0b01000000) && !pressed[KEYS.KEY_RIGHT]) {
		pressed[KEYS.KEY_RIGHT] = true;
		emitter.emit('keydown', KEYS.KEY_RIGHT);
	} else if(pressed[KEYS.KEY_RIGHT] && !(data[5] & 0b01000000)) {
		pressed[KEYS.KEY_RIGHT] = false;
		emitter.emit('keyup', KEYS.KEY_RIGHT);
	}
	
	if(!(data[5] ^ 0b00101000 && data[5] ^ 0b01000000) && !pressed[KEYS.KEY_DOWN]) {
		pressed[KEYS.KEY_DOWN] = true;
		emitter.emit('keydown', KEYS.KEY_DOWN);
	} else if(pressed[KEYS.KEY_DOWN] && !(data[5] & 0b00100000)) {
		pressed[KEYS.KEY_DOWN] = false;
		emitter.emit('keyup', KEYS.KEY_DOWN);
	}
	
	if(!(data[5] ^ 0b00011000 && data[5] ^ 0b00010000) && !pressed[KEYS.KEY_LEFT]) {
		pressed[KEYS.KEY_LEFT] = true;
		emitter.emit('keydown', KEYS.KEY_LEFT);
	} else if(pressed[KEYS.KEY_LEFT] && !(data[5] & 0b00010000)) {
		pressed[KEYS.KEY_LEFT] = false;
		emitter.emit('keyup', KEYS.KEY_LEFT);
	}
	
	// check dpad
	
	dpad = data[5] & 0b00001111;
	
	// KEYS.DPAD_UPLEFT
	if(dpad == 0b0111) {
		if(!pressed[KEYS.DPAD_LEFT]) {
			pressed[KEYS.DPAD_LEFT] = true;
			emitter.emit('keydown', KEYS.DPAD_LEFT);
		}
		
		if(!pressed[KEYS.DPAD_UP]) {
			pressed[KEYS.DPAD_UP] = true;
			emitter.emit('keydown', KEYS.DPAD_UP);
		}
	} else if(dpad != 0b0111) {
		if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b0110) && (dpad !== 0b0101)) {
			pressed[KEYS.DPAD_LEFT] = false;
			emitter.emit('keyup', KEYS.DPAD_LEFT);
		}
		
		if(pressed[KEYS.DPAD_UP] && (dpad !== 0b0000) && (dpad !== 0b0001)) {
			pressed[KEYS.DPAD_UP] = false;
			emitter.emit('keyup', KEYS.DPAD_UP);
		}
	}
	
	// KEYS.DPAD_DOWNLEFT
	if(dpad === 0b0101) {
		if(!pressed[KEYS.DPAD_LEFT]) {
			pressed[KEYS.DPAD_LEFT] = true;
			emitter.emit('keydown', KEYS.DPAD_LEFT);
		}
		
		if(!pressed[KEYS.DPAD_DOWN]) {
			pressed[KEYS.DPAD_DOWN] = true;
			emitter.emit('keydown', KEYS.DPAD_DOWN);
		}
	} else if(dpad !== 0b0101) {
		if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b0111) && (dpad !== 0b0110)) {
			pressed[KEYS.DPAD_LEFT] = false;
			emitter.emit('keyup', KEYS.DPAD_LEFT);
		}
		
		if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b0100) && (dpad !== 0b0011)) {
			pressed[KEYS.DPAD_DOWN] = false;
			emitter.emit('keyup', KEYS.DPAD_DOWN);
		}
	}
	
	// KEYS.DPAD_RIGHTDOWN
	if(dpad === 0b0011) {
		if(!pressed[KEYS.DPAD_RIGHT]) {
			pressed[KEYS.DPAD_RIGHT] = true;
			emitter.emit('keydown', KEYS.DPAD_RIGHT);
		}
		
		if(!pressed[KEYS.DPAD_DOWN]) {
			pressed[KEYS.DPAD_DOWN] = true;
			emitter.emit('keydown', KEYS.DPAD_DOWN);
		}
	} else if(dpad !== 0b0011) {
		if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b0010) && (dpad !== 0b0001)) {
			pressed[KEYS.DPAD_RIGHT] = false;
			emitter.emit('keyup', KEYS.DPAD_RIGHT);
		}
		
		if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b0100) && (dpad !== 0b0101)) {
			pressed[KEYS.DPAD_DOWN] = false;
			emitter.emit('keyup', KEYS.DPAD_DOWN);
		}
	}
	
	// KEYS.DPAD_UPRIGHT
	if(dpad === 0b0001) {
		if(!pressed[KEYS.DPAD_RIGHT]) {
			pressed[KEYS.DPAD_RIGHT] = true;
			emitter.emit('keydown', KEYS.DPAD_RIGHT);
		}
		
		if(!pressed[KEYS.DPAD_UP]) {
			pressed[KEYS.DPAD_UP] = true;
			emitter.emit('keydown', KEYS.DPAD_UP);
		}
	} else if(dpad !== 0b0001) {
		if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b0010) && (dpad !== 0b0011)) {
			pressed[KEYS.DPAD_RIGHT] = false;
			emitter.emit('keyup', KEYS.DPAD_RIGHT);
		}
		
		if(pressed[KEYS.DPAD_UP] && (dpad !== 0b0000) && (dpad !== 0b0111)) {
			pressed[KEYS.DPAD_UP] = false;
			emitter.emit('keyup', KEYS.DPAD_UP);
		}
	}
	
	if((dpad == 0b0110) && !pressed[KEYS.DPAD_LEFT]) {
		pressed[KEYS.DPAD_LEFT] = true;
		emitter.emit('keydown', KEYS.DPAD_LEFT);
	} else if(pressed[KEYS.DPAD_LEFT] && (dpad !== 0b0111) && (dpad !== 0b0110) && (dpad !== 0b0101)) {
		pressed[KEYS.DPAD_LEFT] = false;
		emitter.emit('keyup', KEYS.DPAD_LEFT);
	}
	
	if((dpad == 0b0010) && !pressed[KEYS.DPAD_RIGHT]) {
		pressed[KEYS.DPAD_RIGHT] = true;
		emitter.emit('keydown', KEYS.DPAD_RIGHT);
	} else if(pressed[KEYS.DPAD_RIGHT] && (dpad !== 0b0010) && (dpad !== 0b0001) && (dpad !== 0b0011)) {
		pressed[KEYS.DPAD_RIGHT] = false;
		emitter.emit('keyup', KEYS.DPAD_RIGHT);
	}
	
	if((dpad == 0b0100) && !pressed[KEYS.DPAD_DOWN]) {
		pressed[KEYS.DPAD_DOWN] = true;
		emitter.emit('keydown', KEYS.DPAD_DOWN);
	} else if(pressed[KEYS.DPAD_DOWN] && (dpad !== 0b0100) && (dpad !== 0b0101) && (dpad !== 0b0011)) {
		pressed[KEYS.DPAD_DOWN] = false;
		emitter.emit('keyup', KEYS.DPAD_DOWN);
	}
	
	if((dpad == 0b0000) && !pressed[KEYS.DPAD_UP]) {
		pressed[KEYS.DPAD_UP] = true;
		emitter.emit('keydown', KEYS.DPAD_UP);
	} else if(pressed[KEYS.DPAD_UP] && (dpad !== 0b0000) && (dpad !== 0b0001) && (dpad !== 0b0111)) {
		pressed[KEYS.DPAD_UP] = false;
		emitter.emit('keyup', KEYS.DPAD_UP);
	}
	
	// end of dpad
	
	if((data[6] & 0b00010000) && !pressed[KEYS.KEY_SELECT]) {
		pressed[KEYS.KEY_SELECT] = true;
		emitter.emit('keydown', KEYS.KEY_SELECT);
	} else if(pressed[KEYS.KEY_SELECT] && !(data[6] & 0b00010000)) {
		pressed[KEYS.KEY_SELECT] = false;
		emitter.emit('keyup', KEYS.KEY_SELECT);
	}
	
	if((data[6] & 0b00100000) && !pressed[KEYS.KEY_START]) {
		pressed[KEYS.KEY_START] = true;
		emitter.emit('keydown', KEYS.KEY_START);
	} else if(pressed[KEYS.KEY_START] && !(data[6] & 0b00100000)) {
		pressed[KEYS.KEY_START] = false;
		emitter.emit('keyup', KEYS.KEY_START);
	}
	
	if((data[6] & 0b10000000) && !pressed[KEYS.R3]) {
		pressed[KEYS.R3] = true;
		emitter.emit('keydown', KEYS.R3);
	} else if(pressed[KEYS.R3] && !(data[6] & 0b10000000)) {
		pressed[KEYS.R3] = false;
		emitter.emit('keyup', KEYS.R3);
	}
	
	if((data[6] & 0b01000000) && !pressed[KEYS.L3]) {
		pressed[KEYS.L3] = true;
		emitter.emit('keydown', KEYS.L3);
	} else if(pressed[KEYS.L3] && !(data[6] & 0b01000000)) {
		pressed[KEYS.L3] = false;
		emitter.emit('keyup', KEYS.L3);
	}
	
	if((data[6] & 0b00001000) && !pressed[KEYS.KEY_SHOULDER_RIGHT2]) {
		pressed[KEYS.KEY_SHOULDER_RIGHT2] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_RIGHT2);
	} else if(pressed[KEYS.KEY_SHOULDER_RIGHT2] && !(data[6] & 0b00001000)) {
		pressed[KEYS.KEY_SHOULDER_RIGHT2] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_RIGHT2);
	}
	
	if((data[6] & 0b00000100) && !pressed[KEYS.KEY_SHOULDER_LEFT2]) {
		pressed[KEYS.KEY_SHOULDER_LEFT2] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_LEFT2);
	} else if(pressed[KEYS.KEY_SHOULDER_LEFT2] && !(data[6] & 0b00000100)) {
		pressed[KEYS.KEY_SHOULDER_LEFT2] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_LEFT2);
	}
	
	if((data[6] & 0b00000010) && !pressed[KEYS.KEY_SHOULDER_RIGHT]) {
		pressed[KEYS.KEY_SHOULDER_RIGHT] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_RIGHT);
	} else if(pressed[KEYS.KEY_SHOULDER_RIGHT] && !(data[6] & 0b00000010)) {
		pressed[KEYS.KEY_SHOULDER_RIGHT] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_RIGHT);
	}
	
	if((data[6] & 0b00000001) && !pressed[KEYS.KEY_SHOULDER_LEFT]) {
		pressed[KEYS.KEY_SHOULDER_LEFT] = true;
		emitter.emit('keydown', KEYS.KEY_SHOULDER_LEFT);
	} else if(pressed[KEYS.KEY_SHOULDER_LEFT] && !(data[6] & 0b00000001)) {
		pressed[KEYS.KEY_SHOULDER_LEFT] = false;
		emitter.emit('keyup', KEYS.KEY_SHOULDER_LEFT);
	}
}

module.exports = {
	handleInput: handleInput
};