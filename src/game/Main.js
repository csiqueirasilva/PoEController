var DETECTION_INTERVAL_MS = 750;
var RepeatActionInterval = 90;
var InputInterval = 15;
var DEBUG_MODE = false;

var GAME_MODE = {
	DEBUG: 0,
	OPTIONS_MENU: 3,
	
	ARPG: 1001,
	INVENTORY: 1002,
	WORLD_MAP: 1003,
	PASSIVE_SKILL_TREE: 1004,
	CHARACTER_SCREEN: 1005,
	STASH: 1006,
	SELL: 1007,
	NPC_DIALOG: 1008,
	LOGIN_SCREEN: 1009,
	CHARACTER_SELECTION: 1010,
	CHARACTER_CREATION: 1011,
	CHARACTER_CREATION_CLASS: 1012,
	REWARD_SCREEN: 1013,
	CRAFT_SCREEN: 1014,
	DIVINATION_CARD_SCREEN: 1015
};

var KEYS = {
	L3: 1,
	R3: 2,
	DPAD_UP: 4,
	DPAD_RIGHT: 12,
	DPAD_DOWN: 20,
	DPAD_LEFT: 28,
	KEY_UP: 8,
	KEY_DOWN: 1,
	KEY_LEFT: 4,
	KEY_RIGHT: 2,
	KEY_SHOULDER_LEFT: 16,
	KEY_SHOULDER_RIGHT: 32,
	KEY_SELECT: 64,
	KEY_START: 128
};

var fs = require('fs');
var robot = require("robotjs");
var xbox = require('xbox-controller-node');
var Worker = require('workerjs');
var exec = require('child_process').exec;
var fork = require('child_process').fork;

robot.setMouseDelay(0);
robot.setKeyboardDelay(0);

var w = robot.getScreenSize().width;
var h = robot.getScreenSize().height;

var fileResolutionPrefix = w + 'x' + h;

console.log('using screen resolution: ' + fileResolutionPrefix);

var halfScreenDiagonal = Math.sqrt(w * w + h * h) / 2;

var BasePosition = {
	x: w / 2,
	y: h * 0.44
};

function IndexOf(o, value) {
	
	for(var key in o) {
		if(o[key] === value) {
			return key;
		}
	}
	
	return -1;
}

function IsMouseInput(Key) {
	return Key === "left" || Key === "right" || Key === "middle";
}

function ActionKey(Key, Action) {
	if(IsMouseInput(Key)) {
		robot.mouseToggle(Action, Key);
	} else if(Key.match(/\w+\.\w+/) === null) {
		robot.keyToggle(Key, Action);
	}
}

function IsAltKeyDown() {
	return InputKeys[64];
}

function IsInsideScreen(x, y) {
	return x >= 0 && x <= w && y >= 0 && y <= h;
}

function ChangeGameMode(NewGameMode) {

	var oldGameMode = CURRENT_GAME_MODE;

	if(oldGameMode !== NewGameMode) {

		//console.log(IndexOf(GAME_MODE, oldGameMode) + " to " + IndexOf(GAME_MODE, NewGameMode));
	
		if(GAME_MODE_OBJECT && GAME_MODE_OBJECT.LeaveArea instanceof Function) {
			GAME_MODE_OBJECT.LeaveArea();
		}
		
		var mode = null;
		
		switch(NewGameMode) {
			case GAME_MODE.DEBUG:
				mode = GAME_MODE_DEBUG;
				break;
			case GAME_MODE.INVENTORY:
				mode = GAME_MODE_INVENTORY;
				break;
			case GAME_MODE.OPTIONS_MENU:
				mode = GAME_MODE_OPTIONS_MENU;
				break;
			case GAME_MODE.PASSIVE_SKILL_TREE:
				mode = GAME_MODE_PASSIVE_SKILL_TREE;
				break;
			case GAME_MODE.WORLD_MAP:
				mode = GAME_MODE_WORLD_MAP;
				break;
			default:
				mode = GAME_MODE_ARPG;
		}
		
		CURRENT_GAME_MODE = NewGameMode;

		GAME_MODE_OBJECT = mode;
		
		if(oldGameMode !== CURRENT_GAME_MODE && mode.EnterArea instanceof Function) {
			mode.EnterArea();
		}
	
	}
	
}

function ResolveDpadInput (data, DpadMapping, InputMapping, BehaviorMapping, skipKeyUp) {

	var	buttons = parseInt(data / 4) * 4;

	switch(buttons) {
		case 4:
			
			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, 4, true, skipKeyUp);
			for(var i = 12; i <= 28; i = i + 8) {
				ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
			}
			
		break;
		case 12:
			
			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, 12, true, skipKeyUp);
			for(var i = 4; i <= 28; i = i + 8) {
				if(i != 12) {
					ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
				}
			}		
			
		break;
		case 20:
		
			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, 20, true, skipKeyUp);
			for(var i = 4; i <= 28; i = i + 8) {
				if(i != 20) {
					ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
				}
			}
		
		break;
		case 28:
		
			ActivateKey(DpadMapping, InputMapping, BehaviorMapping, 28, true, skipKeyUp);
			for(var i = 4; i <= 20; i = i + 8) {
				ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
			}
			
		break;
		default:
		
			for(var i = 4; i <= 28; i = i + 8) {
				ActivateKey(DpadMapping, InputMapping, BehaviorMapping, i, false, skipKeyUp);
			}

	}
}

function ClearHeldInput (KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile) {
	for(var key in BehaviorOfExile) {
		var ref = IndexOf(KeysOfExile, key);
		if(ref === -1) {
			ref = IndexOf(DPADOfExile, key);
			if(InputDPAD[ref]) {
				ActionKeyUp(key, BehaviorOfExile);
			}
		} else if(InputKeys[ref]) {
			ActionKeyUp(key, BehaviorOfExile);
		}
	}
}

function ActionKeyUp (key, behaviorReference) {
	ActionKey(key, "up");

	var behavior = behaviorReference[key];				
	if(behavior instanceof Array && behavior.length > 1 && DefaultBehaviours[behavior[1]] instanceof Function) {
		DefaultBehaviours[behavior[1]](behavior, key);
	}
}

var ActionRepeatTimestamps = {};

function ActivateKey(keys, reference, behaviorReference, index, pressed, skipKeyUp) {
	var timestamp = new Date().getTime();
	
	if(keys[index]) {

		var behavior = behaviorReference[keys[index]];

		var behaviorIndex = null;
		
		if(behavior instanceof Array && behavior.length > 0 && DefaultBehaviours[behavior[0]] instanceof Function) {
			behaviorIndex = behavior[0];
		} else if(!(behavior instanceof Array) || !DefaultBehaviours[behavior[0]]) {
			behaviorIndex = "nothing";
		}
	
		if(reference[index] && !pressed) {
			reference[index] = false;
			delete ActionRepeatTimestamps[behaviorIndex];
			if(!skipKeyUp) {
				ActionKeyUp(keys[index], behaviorReference);
			}
		} else if(!reference[index] && pressed) {
			reference[index] = true;
			ActionRepeatTimestamps[behaviorIndex] = timestamp;
			DefaultBehaviours[behaviorIndex](behavior, keys[index]);
		} else if(behaviorIndex.charAt(0) === behaviorIndex.charAt(0).toUpperCase()) /* Repeatable Action */ {
			if (ActionRepeatTimestamps[behaviorIndex] && (timestamp - ActionRepeatTimestamps[behaviorIndex]) > RepeatActionInterval) {
				ActionRepeatTimestamps[behaviorIndex] = timestamp;
				//console.log(behaviorIndex);
				DefaultBehaviours[behaviorIndex](behavior, keys[index]);
			}
		} 
	}
}

function ResetInputArrays (Keys, Dpad) {
	delete ActionRepeatTimestamps;
	ActionRepeatTimestamps = {};
	
	for(var i = 1; i <= 128; i = i * 2) {
		Keys[i] = false;
	}
	
	for(var i = 4; i <= 28; i = i + 8) {
		Dpad[i] = false;
	}
}

function IsBlockedGameMode() {
	return CURRENT_GAME_MODE != null && CURRENT_GAME_MODE < 1000;
}

var SignatureDetectionWorker = new Worker('src/game/SignatureDetectionWorker.js');

SignatureDetectionWorker.onmessage = function(event) {
	var cmd = event.data.cmd;
	var data = event.data.data;
	
	switch(cmd) {
		case 'detect-sub':
			console.log('detect-sub', IndexOf(GAME_MODE, data));
			if(GAME_MODE_OBJECT.SubSection instanceof Function) {
				GAME_MODE_OBJECT.SubSection(data);
			}
			break;
		case 'detect':
			ChangeGameMode(data);
			break;
		case 'init':
			InitGame();
	}
};

var DetectPollingInterval = null;
var RightThumbstickMouseInterval = null;

function PollGamepadEvents() {
	RightThumbstickMouseInterval = setInterval(function() {
		
		if(LastInputData !== null) {
			// resolve right thumb axis
			MoveThumbstick(LastInputData[5], LastInputData[7], 
				MAX_INPUT_THUMBSTICK, 
				RIGHT_THUMBSTICK_THRESHOLD,
				RightThumbIfCallback,
				RightThumbElseCallback);
			
			GAME_MODE_OBJECT.ResolveInput(LastInputData);
		}
		
	}, InputInterval);
}

function InitGame() {
	DetectPollingInterval = setInterval(function() {
		SignatureDetectionWorker.postMessage({cmd: 'detect', data: {CURRENT_GAME_MODE: CURRENT_GAME_MODE, isBlockedGameMode: IsBlockedGameMode()}});
	}, DETECTION_INTERVAL_MS);
	
	PollGamepadEvents();
		
	exec("start steam://rungameid/238960", function(error, stdout, stderr) {
		console.log(stdout);
		if(error) {
			return console.error(stderr);
		}
	});
}

/* SKILL BEHAVIOR BEFORE USING */

var DefaultBehaviours = {};

DefaultBehaviours["Inventory.Quit"] = function () {
	robot.keyTap("escape");
	ChangeGameMode(GAME_MODE.ARPG);
};
	
DefaultBehaviours['ARPG.FetchLootHold'] = function () {
	robot.keyToggle('alt', 'down');
	robot.moveMouse(BasePosition.x, BasePosition.y);
};

DefaultBehaviours['ARPG.FetchLootRelease'] = function () {
	robot.keyToggle('alt', 'up');
};

DefaultBehaviours.nothing = function (args, key) {
	ActionKey(key, "down");
}

DefaultBehaviours.MouseNeutral = function (args, key) {
	robot.moveMouse(BasePosition.x, BasePosition.y);
	ActionKey(key, "down");
}

/* END OF SKILL BEHAVIOR BEFORE USING */

/* GAME MODES */

var GAME_MODE_OPTIONS_MENU = (function() {

	DefaultBehaviours["OptionsMenu.Down"] = function () {
		CURSOR_INDEX = (CURSOR_INDEX + 1) % CURSOR_TOTAL;
		robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION + CURSOR_INDEX * CURSOR_Y_INCREMENT);
	};
	
	DefaultBehaviours["OptionsMenu.Up"] = function () {
		CURSOR_INDEX = (CURSOR_INDEX - 1 + CURSOR_TOTAL) % CURSOR_TOTAL;
		robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION + CURSOR_INDEX * CURSOR_Y_INCREMENT);
	};
	
	DefaultBehaviours["OptionsMenu.Cancel"] = function () {
		robot.keyTap('escape');
		ChangeGameMode(GAME_MODE.ARPG);
	};

	DefaultBehaviours["OptionsMenu.Confirm"] = function () {
		robot.mouseClick("left");
		if(CURSOR_INDEX === 0) {
			ChangeGameMode(GAME_MODE.INVENTORY);
		} else if (CURSOR_INDEX === 2) {
			ChangeGameMode(GAME_MODE.PASSIVE_SKILL_TREE);
		} else {
			ChangeGameMode(GAME_MODE.ARPG);
		}
	};
	
	var KeysOfExile = {};
	
	KeysOfExile[KEYS.KEY_DOWN] = "OptionsMenu.Confirm";
	KeysOfExile[KEYS.KEY_RIGHT] = "OptionsMenu.Cancel";
	KeysOfExile[KEYS.KEY_START] = "OptionsMenu.Cancel";
		
	var DPADOfExile = {};
	
	DPADOfExile = {};
	
	DPADOfExile[KEYS.DPAD_UP] = "OptionsMenu.Up";
	DPADOfExile[KEYS.DPAD_DOWN] = "OptionsMenu.Down";
	
	var BehaviorOfExile = {
		"OptionsMenu.Up": ["OptionsMenu.Up"],
		"OptionsMenu.Down": ["OptionsMenu.Down"],
		"OptionsMenu.Cancel": [null, "OptionsMenu.Cancel"],
		"OptionsMenu.Confirm": [null, "OptionsMenu.Confirm"]
	};
	
	var InputDPAD = {};
	
	var InputKeys = {};

	var CURSOR_INDEX = 0;
	var CURSOR_TOTAL = 9;
	var CURSOR_X_POSITION = parseInt(w * 0.14);
	var CURSOR_Y_POSITION = parseInt(h * 0.61945);
	var CURSOR_Y_INCREMENT = parseInt(h * 0.0346);
	
	var CURSOR_X_INITIAL = CURSOR_X_POSITION;
	var CURSOR_Y_INITIAL = parseInt(h * 0.9287);
	
	function ResolveInput(data) {
		
		var buttons = data[10];
		
		for(var i = 128; i >= 1; i = i / 2) {
			var pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}
		
		// solve dpad
		ResolveDpadInput(data[11], DPADOfExile, InputDPAD, BehaviorOfExile, true);
	}
	
	function EnterArea() {
		robot.mouseToggle("up");
		
		robot.moveMouse(CURSOR_X_INITIAL, CURSOR_Y_INITIAL);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				CURSOR_INDEX = 0;
				robot.moveMouse(CURSOR_X_POSITION, CURSOR_Y_POSITION);
			}, 30);
		}, 30);
		
	}
	
	return {
		ResolveInput: ResolveInput,
		EnterArea: EnterArea
	};
})();

var GAME_MODE_INVENTORY = (function() {

	var SubSectionSignatures = null;
	var CurrentSubSection = null;
	var CURRENT_AREA = null;
		
	fs.readFile("signatures/" + fileResolutionPrefix + "inventory-signatures.json", 'utf8', function(err, data) {
		if(err) {
			return console.log(err);
		} else {
			SubSectionSignatures = JSON.parse(data);
			console.log("Read inventory signature file from disk.");
		}
	});
	
	var INVENTORY_AREA = {
		FLASKS_AREA: 0,
		EQUIPMENT_AREA: 1,
		BAG_AREA: 2,
		GEMS_AREA: 3,
		EQUIPMENT_GEMS_AREA: 4,
		GENERAL: 5,
		REWARDS: 6,
		STASH: 7,
		SELL: 8,
		DIVINATION_CARD: 9,
		CRAFT: 10
	};
	
	var EquipmentIndexTable = {
		MAIN_HAND: 1,
		RING_L: 2,
		GLOVES: 3,
		BELT: 0,
		CHEST: 4,
		HELMET: 5,
		RING_R: 6,
		OFF_HAND: 7,
		BOOTS: 8,
		AMULET: 9
	};

	var EquipmentGraph = [];
	
	EquipmentGraph[EquipmentIndexTable.BELT] = {
		d: -1, /* Go to Flasks Area */
		l: EquipmentIndexTable.GLOVES,
		r: EquipmentIndexTable.BOOTS,
		u: EquipmentIndexTable.CHEST
	};

	EquipmentGraph[EquipmentIndexTable.MAIN_HAND] = {
		d: EquipmentIndexTable.GLOVES,
		r: EquipmentIndexTable.RING_L
	};

	EquipmentGraph[EquipmentIndexTable.OFF_HAND] = {
		d: EquipmentIndexTable.BOOTS,
		l: EquipmentIndexTable.RING_R
	};
	
	EquipmentGraph[EquipmentIndexTable.HELMET] = {
		d: EquipmentIndexTable.CHEST,
		r: EquipmentIndexTable.AMULET,
		l: EquipmentIndexTable.MAIN_HAND
	};	

	EquipmentGraph[EquipmentIndexTable.CHEST] = {
		d: EquipmentIndexTable.BELT,
		u: EquipmentIndexTable.HELMET,
		l: EquipmentIndexTable.RING_L,
		r: EquipmentIndexTable.RING_R
	};	
	
	EquipmentGraph[EquipmentIndexTable.RING_R] = {
		d: EquipmentIndexTable.BOOTS,
		u: EquipmentIndexTable.AMULET,
		l: EquipmentIndexTable.CHEST,
		r: EquipmentIndexTable.OFF_HAND
	};

	EquipmentGraph[EquipmentIndexTable.RING_L] = {
		d: EquipmentIndexTable.GLOVES,
		l: EquipmentIndexTable.MAIN_HAND,
		r: EquipmentIndexTable.CHEST
	};
	
	EquipmentGraph[EquipmentIndexTable.AMULET] = {
		d: EquipmentIndexTable.RING_R,
		l: EquipmentIndexTable.CHEST,
		r: EquipmentIndexTable.OFF_HAND,
	};
	
	EquipmentGraph[EquipmentIndexTable.GLOVES] = {
		d: -1,
		u: EquipmentIndexTable.RING_L,
		r: EquipmentIndexTable.BELT
	};

	EquipmentGraph[EquipmentIndexTable.BOOTS] = {
		d: -1,
		u: EquipmentIndexTable.RING_R,
		l: EquipmentIndexTable.BELT
	};
	
	var LeaveSubSectionDelay = 100;
	
	function LeaveCurrentSubSection(TargetArea) {
		setTimeout(function() {
			switch(TargetArea) {
				case INVENTORY_AREA.BAG_AREA:
					EnterBagArea();
					break;
				case INVENTORY_AREA.FLASKS_AREA:
					EnterFlasksArea();
					break;
				case INVENTORY_AREA.GEMS_AREA:
					EnterGemsArea();
					break;
				case INVENTORY_AREA.EQUIPMENT_AREA:
					EnterEquipmentArea();
			}
		}, LeaveSubSectionDelay);
	}
	
	function EnterCurrentSubSection() {
		switch(CurrentSubSection) {
			case GAME_MODE.REWARD_SCREEN:
				EnterRewardArea();
				break;
			case GAME_MODE.CRAFT_SCREEN:
				EnterCraftArea();
				break;
			case GAME_MODE.DIVINATION_CARD_SCREEN:
				EnterDivinationCardArea();
				break;
			case GAME_MODE.STASH:
				EnterStashArea();
				break;
			case GAME_MODE.SELL:
				EnterSellArea();
		}
	}
	
	function ChangeIntoSubSection(mode) {
		CurrentSubSection = mode;
	}

	DefaultBehaviours["RewardsArea.Up"] = function () {
		if(INVENTORY_INDEX >= 10) {
			INVENTORY_INDEX -= 10;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["RewardsArea.Down"] = function () {
		if(INVENTORY_INDEX < 50) {
			INVENTORY_INDEX += 10;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["RewardsArea.Left"] = function () {
		if(INVENTORY_INDEX % 10 !== 0) {
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["RewardsArea.Right"] = function () {
		if((INVENTORY_INDEX + 1) % 10 === 0) /* Goes Back to BagArea */ {
			LeaveCurrentSubSection(INVENTORY_AREA.BAG_AREA);
		} else {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["EquipmentArea.Up"] = function () {
		var pos = EquipmentGraph[INVENTORY_INDEX].u;
	
		if (pos !== undefined) {
			INVENTORY_INDEX = pos;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["EquipmentArea.Down"] = function () {
		var pos = EquipmentGraph[INVENTORY_INDEX].d;
	
		if(pos === -1) /* Change Area, Flasks */ {
			LeaveCurrentSubSection(INVENTORY_AREA.FLASKS_AREA);
		} else if (pos !== undefined) {
			INVENTORY_INDEX = pos;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}

	};
	
	DefaultBehaviours["EquipmentArea.Left"] = function () {
		var pos = EquipmentGraph[INVENTORY_INDEX].l;
	
		if (pos !== undefined) {
			INVENTORY_INDEX = pos;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["EquipmentArea.Right"] = function () {
		var pos = EquipmentGraph[INVENTORY_INDEX].r;
	
		if (pos !== undefined) {
			INVENTORY_INDEX = pos;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["FlasksArea.Up"] = function () {
		/* Change Area, Equipment */
		LeaveCurrentSubSection(INVENTORY_AREA.EQUIPMENT_AREA);
	};

	DefaultBehaviours["FlasksArea.Down"] = function () {
		LeaveCurrentSubSection(INVENTORY_AREA.BAG_AREA);
	};
	
	DefaultBehaviours["FlasksArea.Left"] = function () {
		if(INVENTORY_INDEX === 0) /* Change to SubSection, if open */ {
			EnterCurrentSubSection();
		} else {
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["FlasksArea.Right"] = function () {
		if(INVENTORY_INDEX < 4) {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["StashArea.Back"] = function () {
		var posX = w * 0.013;
		var posY = h * 0.132;
		
		robot.moveMouse(posX, posY);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
		
	};

	DefaultBehaviours["StashArea.Forward"] = function () {
		var posX = w * 0.320;
		var posY = h * 0.132;
		
		robot.moveMouse(posX, posY);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
	};

	DefaultBehaviours["StashArea.SelectTab"] = function () {
		
		var posX = w * 0.028;
		var posY = h * 0.132;
		
		robot.moveMouse(posX, posY);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
		
	};
	
	DefaultBehaviours["StashArea.Up"] = function () {
		if(INVENTORY_INDEX >= 12) {
			INVENTORY_INDEX -= 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["StashArea.Down"] = function () {
		if(INVENTORY_INDEX < 132) /* Change Area, Gems */ {
			INVENTORY_INDEX += 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["StashArea.Left"] = function () {
		if(INVENTORY_INDEX % 12 !== 0){
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["StashArea.Right"] = function () {
		if((INVENTORY_INDEX + 1) % 12 === 0) {
			LeaveCurrentSubSection(INVENTORY_AREA.BAG_AREA);
		} else {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["BagArea.Up"] = function () {
		if(INVENTORY_INDEX < 12) /* Change Area, Flasks */ {
			LeaveCurrentSubSection(INVENTORY_AREA.FLASKS_AREA);
		} else {
			INVENTORY_INDEX -= 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["BagArea.Down"] = function () {
		if(INVENTORY_INDEX >= 48) /* Change Area, Gems */ {
			
		} else {
			INVENTORY_INDEX += 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["BagArea.Left"] = function () {
		if(INVENTORY_INDEX % 12 === 0) /* Change to SubSection, if open */ {
			EnterCurrentSubSection();
		} else {
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["BagArea.Right"] = function () {
		if((INVENTORY_INDEX + 1) % 12 === 0) /* Does nothing (?) */ {
			
		} else {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["CraftArea.Up"] = function () {
		if(INVENTORY_INDEX === 7 || INVENTORY_INDEX === 8 || INVENTORY_INDEX === 9) {
			INVENTORY_INDEX -= 2;
		} else if (INVENTORY_INDEX === 5 || INVENTORY_INDEX === 6) {
			INVENTORY_INDEX = 0;
		} else if (INVENTORY_INDEX !== 0) {
			INVENTORY_INDEX--;
		}
		
		SET_AREA_POSITION(INVENTORY_INDEX);
	};

	DefaultBehaviours["CraftArea.Down"] = function () {
		if(INVENTORY_INDEX === 7 || INVENTORY_INDEX === 8 || INVENTORY_INDEX === 9) /* Goes to Confirm */ {
			INVENTORY_INDEX = 9;
		} else if (INVENTORY_INDEX === 5 || INVENTORY_INDEX === 6) {
			INVENTORY_INDEX += 2;
		} else {
			INVENTORY_INDEX++;
		}
		
		SET_AREA_POSITION(INVENTORY_INDEX);
	};
	
	DefaultBehaviours["CraftArea.Left"] = function () {
		if(INVENTORY_INDEX === 6 || INVENTORY_INDEX === 8) {
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["CraftArea.Right"] = function () {
		if(INVENTORY_INDEX !== 5 && INVENTORY_INDEX !== 7) {
			LeaveCurrentSubSection(INVENTORY_AREA.BAG_AREA);
		} else {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["CraftArea.ScrollUp"] = function () {
		var posX = w * 0.440;
		var posY = h * 0.171;

		robot.moveMouse(posX, posY);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
	};

	DefaultBehaviours["CraftArea.ScrollDown"] = function () {
		var posX = w * 0.440;
		var posY = h * 0.547;

		robot.moveMouse(posX, posY);
		
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
	};
	
	DefaultBehaviours["SellArea.Up"] = function () {
		if(INVENTORY_INDEX >= 12) {
			INVENTORY_INDEX -= 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["SellArea.Down"] = function () {
		if(INVENTORY_INDEX < 48) /* Change Area, Gems */ {
			INVENTORY_INDEX += 12;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["SellArea.Left"] = function () {
		if(INVENTORY_INDEX % 12 !== 0) /* Change to SubSection, if open */ {
			INVENTORY_INDEX--;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};
	
	DefaultBehaviours["SellArea.Right"] = function () {
		if((INVENTORY_INDEX + 1) % 12 === 0) /* Does nothing (?) */ {
			LeaveCurrentSubSection(INVENTORY_AREA.BAG_AREA);
		} else {
			INVENTORY_INDEX++;
			SET_AREA_POSITION(INVENTORY_INDEX);
		}
	};

	DefaultBehaviours["SellArea.Confirm"] = function () {
		var posX = w * 0.194;
		var posY = h * 0.758;
		
		robot.moveMouse(posX, posY);
	};

	DefaultBehaviours["SellArea.Cancel"] = function () {
		var posX = w * 0.456;
		var posY = h * 0.758;
		
		robot.moveMouse(posX, posY);
	};
	
	DefaultBehaviours["BagArea.CenterClick"] = function () {
		robot.moveMouse(BasePosition.x, BasePosition.y);
		setTimeout(function() {
			robot.mouseClick("left");
			setTimeout(function() {
				SET_AREA_POSITION(INVENTORY_INDEX);
			}, 24);
		}, 24);
	};

	var KeysOfExile = {};
	var DPADOfExile = {};
	
	for(var i in INVENTORY_AREA) {
		KeysOfExile[INVENTORY_AREA[i]] = {};
		DPADOfExile[INVENTORY_AREA[i]] = {};
		
		KeysOfExile[INVENTORY_AREA[i]][KEYS.KEY_DOWN] = "left";
		KeysOfExile[INVENTORY_AREA[i]][KEYS.KEY_RIGHT] = "right";
	}

	// sell area
	KeysOfExile[INVENTORY_AREA.CRAFT][KEYS.KEY_LEFT] = "CraftArea.ScrollDown";
	KeysOfExile[INVENTORY_AREA.CRAFT][KEYS.KEY_UP] = "CraftArea.ScrollUp";
	
	DPADOfExile[INVENTORY_AREA.CRAFT][KEYS.DPAD_UP] = "CraftArea.Up";
	DPADOfExile[INVENTORY_AREA.CRAFT][KEYS.DPAD_DOWN] = "CraftArea.Down";
	DPADOfExile[INVENTORY_AREA.CRAFT][KEYS.DPAD_LEFT] = "CraftArea.Left";
	DPADOfExile[INVENTORY_AREA.CRAFT][KEYS.DPAD_RIGHT] = "CraftArea.Right";
	
	// sell area
	KeysOfExile[INVENTORY_AREA.SELL][KEYS.KEY_UP] = "SellArea.Cancel";
	KeysOfExile[INVENTORY_AREA.SELL][KEYS.KEY_LEFT] = "SellArea.Confirm";
	
	DPADOfExile[INVENTORY_AREA.SELL][KEYS.DPAD_UP] = "SellArea.Up";
	DPADOfExile[INVENTORY_AREA.SELL][KEYS.DPAD_DOWN] = "SellArea.Down";
	DPADOfExile[INVENTORY_AREA.SELL][KEYS.DPAD_LEFT] = "SellArea.Left";
	DPADOfExile[INVENTORY_AREA.SELL][KEYS.DPAD_RIGHT] = "SellArea.Right";
	
	// bag area
	KeysOfExile[INVENTORY_AREA.BAG_AREA][KEYS.KEY_SHOULDER_LEFT] = "control";
	KeysOfExile[INVENTORY_AREA.BAG_AREA][KEYS.KEY_SHOULDER_RIGHT] = "shift";

	KeysOfExile[INVENTORY_AREA.BAG_AREA][KEYS.KEY_UP] = "BagArea.CenterClick";

	DPADOfExile[INVENTORY_AREA.BAG_AREA][KEYS.DPAD_UP] = "BagArea.Up";
	DPADOfExile[INVENTORY_AREA.BAG_AREA][KEYS.DPAD_DOWN] = "BagArea.Down";
	DPADOfExile[INVENTORY_AREA.BAG_AREA][KEYS.DPAD_LEFT] = "BagArea.Left";
	DPADOfExile[INVENTORY_AREA.BAG_AREA][KEYS.DPAD_RIGHT] = "BagArea.Right";
	
	// rewards
	
	DPADOfExile[INVENTORY_AREA.REWARDS][KEYS.DPAD_UP] = "RewardsArea.Up";
	DPADOfExile[INVENTORY_AREA.REWARDS][KEYS.DPAD_DOWN] = "RewardsArea.Down";
	DPADOfExile[INVENTORY_AREA.REWARDS][KEYS.DPAD_LEFT] = "RewardsArea.Left";
	DPADOfExile[INVENTORY_AREA.REWARDS][KEYS.DPAD_RIGHT] = "RewardsArea.Right";

	// stash

	KeysOfExile[INVENTORY_AREA.STASH][KEYS.KEY_SHOULDER_LEFT] = "control";
	KeysOfExile[INVENTORY_AREA.STASH][KEYS.KEY_SHOULDER_RIGHT] = "shift";

	KeysOfExile[INVENTORY_AREA.STASH][KEYS.KEY_LEFT] = "StashArea.Back";
	KeysOfExile[INVENTORY_AREA.STASH][KEYS.KEY_UP] = "StashArea.Forward";
	KeysOfExile[INVENTORY_AREA.STASH][KEYS.KEY_SELECT] = "StashArea.SelectTab";
	
	DPADOfExile[INVENTORY_AREA.STASH][KEYS.DPAD_UP] = "StashArea.Up";
	DPADOfExile[INVENTORY_AREA.STASH][KEYS.DPAD_DOWN] = "StashArea.Down";
	DPADOfExile[INVENTORY_AREA.STASH][KEYS.DPAD_LEFT] = "StashArea.Left";
	DPADOfExile[INVENTORY_AREA.STASH][KEYS.DPAD_RIGHT] = "StashArea.Right";
	
	// equipments

	DPADOfExile[INVENTORY_AREA.EQUIPMENT_AREA][KEYS.DPAD_UP] = "EquipmentArea.Up";
	DPADOfExile[INVENTORY_AREA.EQUIPMENT_AREA][KEYS.DPAD_DOWN] = "EquipmentArea.Down";
	DPADOfExile[INVENTORY_AREA.EQUIPMENT_AREA][KEYS.DPAD_LEFT] = "EquipmentArea.Left";
	DPADOfExile[INVENTORY_AREA.EQUIPMENT_AREA][KEYS.DPAD_RIGHT] = "EquipmentArea.Right";
	
	// flasks

	DPADOfExile[INVENTORY_AREA.FLASKS_AREA][KEYS.DPAD_UP] = "FlasksArea.Up";
	DPADOfExile[INVENTORY_AREA.FLASKS_AREA][KEYS.DPAD_DOWN] = "FlasksArea.Down";
	DPADOfExile[INVENTORY_AREA.FLASKS_AREA][KEYS.DPAD_LEFT] = "FlasksArea.Left";
	DPADOfExile[INVENTORY_AREA.FLASKS_AREA][KEYS.DPAD_RIGHT] = "FlasksArea.Right";

	// special case
	KeysOfExile[KEYS.KEY_START] = "Inventory.Quit";

	var BehaviorOfExile = {
		"left": [],
		"right": [],
		"BagArea.CenterClick": ["BagArea.CenterClick"],
		"shift": [],
		"control": [],
		"CraftArea.ScrollDown": ["CraftArea.ScrollDown"],
		"CraftArea.ScrollUp": ["CraftArea.ScrollUp"],
		"SellArea.Confirm": ["SellArea.Confirm"],
		"SellArea.Cancel": ["SellArea.Cancel"],
		"StashArea.Back": ["StashArea.Back"],
		"StashArea.Forward": ["StashArea.Forward"],
		"StashArea.SelectTab": ["StashArea.SelectTab"],
		"Inventory.Quit": [null, "Inventory.Quit"]
	};

	// Set all DPAD keys
	for(var key in DPADOfExile) {
		var dpadSetKeys = DPADOfExile[key];
		for(var inner in dpadSetKeys) {
			var v = dpadSetKeys[inner];
			BehaviorOfExile[v] = [v];
		}
	}
	
	var InputDPAD = {};
	var InputKeys = {};

	var INVENTORY_INDEX = null;
	
	var SET_AREA_POSITION = null;
	
	var SquareItemIcr = h * 0.0479;
	
	function SetEquipmentAreaPosition(Position) {
	
		var basePositionX = w;
		var basePositionY = h;
	
		switch(Position) {
			case EquipmentIndexTable.MAIN_HAND:
				basePositionX *= 0.719;
				basePositionY *= 0.301;
				break;
			case EquipmentIndexTable.RING_L:
				basePositionX *= 0.783;
				basePositionY *= 0.301;
				break;
			case EquipmentIndexTable.GLOVES:
				basePositionX *= 0.782;
				basePositionY *= 0.412;
				break;
			case EquipmentIndexTable.BELT:
				basePositionX *= 0.828;
				basePositionY *= 0.412;
				break;
			case EquipmentIndexTable.CHEST:
				basePositionX *= 0.826;
				basePositionY *= 0.350;
				break;
			case EquipmentIndexTable.HELMET:
				basePositionX *= 0.826;
				basePositionY *= 0.193;
				break;
			case EquipmentIndexTable.RING_R:
				basePositionX *= 0.891;
				basePositionY *= 0.301;
				break;
			case EquipmentIndexTable.OFF_HAND:
				basePositionX *= 0.933;
				basePositionY *= 0.301;
				break;
			case EquipmentIndexTable.BOOTS:
				basePositionX *= 0.916;
				basePositionY *= 0.412;
			break;
			case EquipmentIndexTable.AMULET:
				basePositionX *= 0.891;
				basePositionY *= 0.240;
		}
		
		robot.moveMouse(basePositionX, basePositionY);
	}
	
	function EnterEquipmentArea() {
		CURRENT_AREA = INVENTORY_AREA.EQUIPMENT_AREA;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetEquipmentAreaPosition;
		SetEquipmentAreaPosition(INVENTORY_INDEX);
	}
	
	function SetFlasksAreaPosition(Position) {
		var positionX = INVENTORY_INDEX;
		
		var basePositionX = w * 0.775;
		var basePositionY = h * 0.478;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY);
	}
	
	function EnterFlasksArea() {
		CURRENT_AREA = INVENTORY_AREA.FLASKS_AREA;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetFlasksAreaPosition;
		SetFlasksAreaPosition(INVENTORY_INDEX);
	}
	
	function SetRewardAreaPosition(Position) {
		var positionX = (INVENTORY_INDEX % 10);
		var positionY = parseInt(INVENTORY_INDEX / 10);
		
		var basePositionX = w * 0.202;
		var basePositionY = h * 0.3426;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY + positionY * SquareItemIcr);
	}
	
	function EnterRewardArea() {
		CURRENT_AREA = INVENTORY_AREA.REWARDS;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetRewardAreaPosition;
		SetRewardAreaPosition(INVENTORY_INDEX);
	}
	
	function SetCraftAreaPosition(Position) {
	
		var posX;
		var posY;
	
		if(Position === 9) {
			posX = w * 0.326;
			posY = h * 0.816;
		} else if (Position >= 5 && Position <= 8) {
			
			var basePositionX = w * 0.313;
			var basePositionY = h * 0.676;
		
			posX = basePositionX + parseInt((INVENTORY_INDEX - 5) % 2) * SquareItemIcr;
			posY = basePositionY + parseInt((INVENTORY_INDEX - 5) / 2) * SquareItemIcr;
		} else {
			posX = w * 0.326;
			posY = h * 0.200;
			
			posY += h * 0.083 * INVENTORY_INDEX;
		}
	
		robot.moveMouse(posX, posY);
	}
	
	function EnterCraftArea() {
		CURRENT_AREA = INVENTORY_AREA.CRAFT;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetCraftAreaPosition;
		SetCraftAreaPosition(INVENTORY_INDEX);
	}
	
	function SetDivinationCardAreaPosition(Position) {
		var positionX = (INVENTORY_INDEX % 10);
		var positionY = parseInt(INVENTORY_INDEX / 10);
		
		var basePositionX = w * 0.33;
		var basePositionY = h * 0.33;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY + positionY * SquareItemIcr);
	}
	
	function EnterDivinationCardArea() {
		CURRENT_AREA = INVENTORY_AREA.DIVINATION_CARD;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetDivinationCardAreaPosition;
		SetDivinationCardAreaPosition(INVENTORY_INDEX);
	}
	
	function SetStashAreaPosition(Position) {
		var positionX = (INVENTORY_INDEX % 12);
		var positionY = parseInt(INVENTORY_INDEX / 12);
		
		var basePositionX = w * 0.032;
		var basePositionY = h * 0.190;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY + positionY * SquareItemIcr);
	}
	
	function EnterStashArea() {
		CURRENT_AREA = INVENTORY_AREA.STASH;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetStashAreaPosition;
		SetStashAreaPosition(INVENTORY_INDEX);
	}
	
	function SetSellAreaPosition(Position) {
		var positionX = (INVENTORY_INDEX % 12);
		var positionY = parseInt(INVENTORY_INDEX / 12);
		
		var basePositionX = w * 0.185;
		var basePositionY = h * 0.523;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY + positionY * SquareItemIcr);
	}
	
	function EnterSellArea() {
		CURRENT_AREA = INVENTORY_AREA.SELL;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetSellAreaPosition;
		SetSellAreaPosition(INVENTORY_INDEX);
	}
	
	function SetBagAreaPosition(Position) {
		var positionX = (INVENTORY_INDEX % 12);
		var positionY = parseInt(INVENTORY_INDEX / 12);
		
		var basePositionX = w * 0.685;
		var basePositionY = h * 0.58;
		
		robot.moveMouse(basePositionX + positionX * SquareItemIcr, basePositionY + positionY * SquareItemIcr);
	}
	
	function EnterBagArea () {
		CURRENT_AREA = INVENTORY_AREA.BAG_AREA;
		INVENTORY_INDEX = 0;
		ResetInputArrays(InputKeys, InputDPAD);
		SET_AREA_POSITION = SetBagAreaPosition;
		SetBagAreaPosition(INVENTORY_INDEX);
	}
	
	function ResolveInput(data) {
		
		//console.log(robot.getMousePos());
		
		var buttons = data[10];
		
		/* START KEY SPECIAL CASE */
		var pressed = buttons - 128 >= 0;
		ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, 128, pressed);
		buttons = buttons >= 128 ? buttons - i : buttons;
		
		for(var i = 64; i >= 1; i = i / 2) {
			pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile[CURRENT_AREA], InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}
		
		// solve dpad
		ResolveDpadInput(data[11], DPADOfExile[CURRENT_AREA], InputDPAD, BehaviorOfExile, true);
	}

	var SubSectionDetectionInterval = null;
	
	function LeaveArea () {
		SignatureDetectionWorker.postMessage({cmd: 'set-subsigs', data: null});
		clearInterval(SubSectionDetectionInterval);
		SubSectionDetectionInterval = null;
		CurrentSubSection = null;
	}
	
	function EnterArea() {
		//console.log('enter area');
		//robot.mouseToggle("up");
		//console.log('set subsigs');
		SignatureDetectionWorker.postMessage({cmd: 'set-subsigs', data: SubSectionSignatures});
		SubSectionDetectionInterval = setInterval(function () {
			SignatureDetectionWorker.postMessage({cmd: 'detect-sub'});
		}, DETECTION_INTERVAL_MS);
		EnterBagArea();
	}
	
	function ChangeCurrentSubSection(mode) {
		console.log('change current sub section');
		CurrentSubSection = mode;
		console.log(IndexOf(GAME_MODE, CurrentSubSection));
	}
	
	return {
		ResolveInput: ResolveInput,
		EnterArea: EnterArea,
		LeaveArea: LeaveArea,
		SubSection: ChangeIntoSubSection
	};
	
})();

var GAME_MODE_DEBUG = (function() {
	
	var InputKeys = {};
	
	var KeysOfExile = {};
	
	KeysOfExile[KEYS.KEY_START] = 'Debug.DetectPixelSignature';
	
	var BehaviorOfExile = {
		'Debug.CapturePixelSignature': [null, "Debug.CapturePixelSignature"],
		'Debug.DetectPixelSignature': [null, "Debug.DetectPixelSignature"],
		'Debug.PrintCursorData': [null, "Debug.PrintCursorData"]
	};

	var SIGNATURE_CAPTURE_ORDER = [{
		filename: 'signatures.json',
		mode: [
			GAME_MODE.INVENTORY,
			GAME_MODE.PASSIVE_SKILL_TREE,
			GAME_MODE.WORLD_MAP
		]
	},
	{
		filename: 'inventory-signatures.json',
		mode: [
			GAME_MODE.STASH,
			GAME_MODE.SELL,
			GAME_MODE.CRAFT_SCREEN,
			GAME_MODE.REWARD_SCREEN
		]
	}];

	var SIGNATURE_CAPTURE_STATE = null;
	
	DefaultBehaviours["Debug.PrintCursorData"] = function () {
		var c = robot.getMousePos();
		console.log(c);
	};

	var supportedAspects = [
		{
			aspect: 16/9,
			coords: {}
		}
	];

	supportedAspects[0].coords[GAME_MODE.INVENTORY] = {x: 0.978125, y: 0.7944444444444444};
	supportedAspects[0].coords[GAME_MODE.PASSIVE_SKILL_TREE] = {x: 0.5036458333333333, y: 0.027777777777777776};
	supportedAspects[0].coords[GAME_MODE.WORLD_MAP] = {x: 0.1734375, y: 0.024074074074074074};
	supportedAspects[0].coords[GAME_MODE.STASH] = {x: 0.029166666666666667, y: 0.7453703703703703};
	supportedAspects[0].coords[GAME_MODE.SELL] = {x: 0.31875, y: 0.08796296296296297};
	supportedAspects[0].coords[GAME_MODE.CRAFT_SCREEN] = {x: 0.32447916666666665, y: 0.09907407407407408};
	supportedAspects[0].coords[GAME_MODE.REWARD_SCREEN] = {x: 0.4484375, y: 0.6259259259259259};
	
	var LastCapturedSignatures = [];
	
	function FindAspectRatio(aspect) {
		var ret = -1;
		
		for(var i = 0; i < supportedAspects.length && ret === -1; i++) {
			if(supportedAspects[i].aspect === aspect) {
				ret = i;
			}
		}
		
		return ret;
	}
	
	function GetCaptureCoordinates(mode) {
		var aspectRatioIndex = FindAspectRatio(w / h);
		var coords = null;
		if(aspectRatioIndex !== -1) /* supported */ {
			coords = supportedAspects[aspectRatioIndex].coords[mode];
			coords.x *= Math.round(w);
			coords.y *= Math.round(h);
		} else {
			console.error('unsupported aspect ratio for capture');
		}
		return coords;
	}
	
	DefaultBehaviours["Debug.DetectPixelSignature"] = function () {
		if(SIGNATURE_CAPTURE_STATE !== null) {

			var groupIndex = SIGNATURE_CAPTURE_STATE.group;
			var modeIndex = SIGNATURE_CAPTURE_STATE.mode;
		
			var group = SIGNATURE_CAPTURE_ORDER[groupIndex];
		
			var captureFrame = group.mode[modeIndex];
			
			var name = IndexOf(GAME_MODE, captureFrame);
		
			console.log("Capturing " + name);
		
			var coords = GetCaptureCoordinates(captureFrame);
		
			var sig = CaptureSignatureAt(coords.x, coords.y);
			
			sig.gameMode = captureFrame;
			sig.name = name;
			
			LastCapturedSignatures.push(sig);				
		
			SIGNATURE_CAPTURE_STATE.mode++;

			var nextMode = group.mode[SIGNATURE_CAPTURE_STATE.mode];
			
			if(nextMode) {
				name = IndexOf(GAME_MODE, nextMode);
				console.log('open ' + name + ' screen');
			} else /* Go to another group */ {
				SignatureDetectionWorker.postMessage({cmd: 'persist', data: {sigs: LastCapturedSignatures, filename: w + 'x' + h + group.filename}});

				LastCapturedSignatures = [];
				SIGNATURE_CAPTURE_STATE.mode = 0;
				SIGNATURE_CAPTURE_STATE.group++;
				
				var nextGroup = SIGNATURE_CAPTURE_ORDER[SIGNATURE_CAPTURE_STATE.group];
				
				if(!nextGroup) /* finished capturing */ {
					SIGNATURE_CAPTURE_STATE = null;
					console.log('finished capturing');
				} else {
					nextMode = nextGroup.mode[SIGNATURE_CAPTURE_STATE.mode];
					name = IndexOf(GAME_MODE, nextMode);
					console.log('open ' + name + ' screen');
				}
			}
			
		} else /* start capturing */ {
			SIGNATURE_CAPTURE_STATE = {group: 0, mode: 0};
			
			var captureFrame = SIGNATURE_CAPTURE_ORDER[0].mode[0];
			var name = IndexOf(GAME_MODE, captureFrame);
		
			console.log('open ' + name + ' screen');
		}
	};
	
	function CaptureSignatureAt(x, y) {
		var sigWidth = parseInt(w * 0.04);
		var mouse = robot.getMousePos();
		var sigMax = parseInt(x + sigWidth / 2)
		var sigMin = parseInt(x - sigWidth / 2);

		var sig = {};
		
		sig.y = y;
		sig.x = [];
		
		var sigPart = parseInt(sigWidth / 10);
		
		for(var i = sigMin; i < sigMax; i = i + sigPart) {
			var c = robot.getPixelColor(i, y);
			var sigComponent = {};
			sigComponent.x = i;
			sigComponent.color = parseInt(c, 16);
			sig.x.push(sigComponent);
		}
		
		return sig;
	}
	
	var capturing = false;
	
	DefaultBehaviours["Debug.CapturePixelSignature"] = function () {
		if(!capturing) {
			capturing = true;

			var sig = CaptureSignatureAt(mouse.x, mouse.y);
			
			var stdin = process.openStdin();

			console.log('input pixel signature name: ');
			
			function inputSignatureName (d) {
				sig.name = d.toString().trim();
				stdin.removeListener("data", inputSignatureName);
				
				function readGameMode (d) {
					sig.gameMode = parseInt(d.toString().trim());
					stdin.removeListener("data", readGameMode);
					
					capturing = false;
					console.log('capture complete\n');
					console.log(sig);
					SignatureDetectionWorker.postMessage({cmd: 'persist', data: sig});
				}
				
				stdin.addListener("data", readGameMode);
			}
			
			stdin.addListener("data", inputSignatureName);
		}
	};
	
	function ResolveInput(data) {
		
		var buttons = data[10];
		
		for(var i = 128; i >= 1; i = i / 2) {
			var pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}

	}
	
	return {
		ResolveInput: ResolveInput
	};
	
})();

var GAME_MODE_PASSIVE_SKILL_TREE = (function () {
	
	var BehaviorOfExile = {
		'left': [],
		'right': [],
		'PassiveSkillTree.ScrollDown': ["PassiveSkillTree.ScrollDown"],
		'PassiveSkillTree.ScrollUp': ["PassiveSkillTree.ScrollUp"],
		'ARPG.FetchLoot': ["ARPG.FetchLootHold", "ARPG.FetchLootRelease"],
		'Inventory.Quit': [null, 'Inventory.Quit']
	};

	var KeysOfExile = {
		1: 'left',
		16: 'PassiveSkillTree.ScrollDown',
		32: 'PassiveSkillTree.ScrollUp',
		64: 'ARPG.FetchLoot',
		128: 'Inventory.Quit'
	};

	var DPADOfExile = {
	};

	var InputKeys = {
		1: false,
		2: false,
		4: false,
		8: false,
		16: false,
		32: false,
		64: false,
		128: false
	};

	var InputDPAD = {
	};
	
	DefaultBehaviours['PassiveSkillTree.ScrollDown'] = function () {
	};

	DefaultBehaviours['PassiveSkillTree.ScrollUp'] = function () {
	};
	
	function ResolveInput(data) {
			
		//console.log(robot.getMousePos());
		
		var buttons = data[10];
		
		for(var i = 128; i >= 1; i = i / 2) {
			pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}
		
		// resolve left thumb axis
		MoveThumbstick(data[1], data[3], 
			MAX_INPUT_THUMBSTICK, 
			RIGHT_THUMBSTICK_THRESHOLD,
			RightThumbIfCallback,
			RightThumbElseCallback);
	}
	
	function EnterArea() {
	}
	
	function LeaveArea() {
		ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
	}
	
	return {
		EnterArea: EnterArea,
		ResolveInput: ResolveInput,
		LeaveArea: LeaveArea
	};
})();

var GAME_MODE_WORLD_MAP = (function () {
	
	var BehaviorOfExile = {
		'left': [],
		'right': [],
		'Inventory.Quit': [null, 'Inventory.Quit']
	};

	var KeysOfExile = {
		1: 'left',
		16: 'control',
		128: 'Inventory.Quit'
	};

	var DPADOfExile = {
	};

	var InputKeys = {
		1: false,
		2: false,
		4: false,
		8: false,
		16: false,
		32: false,
		64: false,
		128: false
	};

	var InputDPAD = {
	};

	var limitX = w * 0.34;
	
	function WorldMapIfLeftThumbstick(x, y) {
	
		var pos = robot.getMousePos();
		var mouseSpeed = 3;
		x = mouseSpeed * Math.sign(x) * Math.pow(x, 2);
		y = mouseSpeed * Math.sign(y) * Math.pow(y, 2);
		
		var finalX = pos.x + x * mouseSpeed;
		
		if(finalX > limitX) {
			finalX = limitX;
		}
		
		robot.moveMouse(finalX, pos.y + y * mouseSpeed);
	}	
	
	function ResolveInput(data) {
			
		var buttons = data[10];
		
		for(var i = 128; i >= 1; i = i / 2) {
			pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
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
		robot.moveMouse(limitX / 2, h * 0.5);
	}
	
	function LeaveArea() {
		ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
	}
	
	return {
		EnterArea: EnterArea,
		ResolveInput: ResolveInput,
		LeaveArea: LeaveArea
	};
})();

var GAME_MODE_ARPG = (function() {
	
	var BehaviorOfExile = {
		'q': [],
		'w': [],
		'e': ["MouseNeutral"],
		'r': [],
		'right': [],
		'middle': ["MouseLastAngleLow"],
		'ARPG.OptionsMenu': [null, 'ARPG.OptionsMenu'],
		'ARPG.FetchLoot': ["ARPG.FetchLootHold", "ARPG.FetchLootRelease"],
		'1': [],
		'2': []
	};

	var KeysOfExile = {
		1: 'middle',
		2: 'right',
		4: 'e',
		8: 'q',
		16: 'r',
		32: 'w',
		64: 'ARPG.FetchLoot',
		128: 'ARPG.OptionsMenu'
	};

	var DPADOfExile = {
		1: '5',
		2: 'control',
		4: '4',
		12: '3',
		20: '2',
		28: '1'
	};

	var InputKeys = {
		1: false,
		2: false,
		4: false,
		8: false,
		16: false,
		32: false,
		64: false,
		128: false
	};

	var InputDPAD = {
	};
	
	DefaultBehaviours['ARPG.OptionsMenu'] = function() {
		// check if possible to open menu (eg: if esc menu is not open)
		if(robot.getPixelColor(parseInt(w * 0.1421875), parseInt(h * 0.89351851852)) === '98a1a6') {
			ChangeGameMode(GAME_MODE.OPTIONS_MENU);
		}
	};
	
	var moving = false;
	var lastTimeClick = 0;
	var lastAngle = 0;

	var LEFT_THUMBSTICK_THRESHOLD = 0.25;

	DefaultBehaviours.MouseLastAngleLow = function (args, key) {
		var R = h * 0.1;
		robot.moveMouse(BasePosition.x + R * Math.cos(lastAngle), BasePosition.y + R * Math.sin(lastAngle));
		ActionKey(key, "down");
	}

	DefaultBehaviours.MouseLastAngleMid = function (args, key) {
		var R = h * 0.225;
		robot.moveMouse(BasePosition.x + R * Math.cos(lastAngle), BasePosition.y + R * Math.sin(lastAngle));
		ActionKey(key, "down");
	}

	DefaultBehaviours.MouseLastAngleHigh = function (args, key) {
		var R = h * 0.35;
		robot.moveMouse(BasePosition.x + R * Math.cos(lastAngle), BasePosition.y + R * Math.sin(lastAngle));
		ActionKey(key, "down");
	}
	
	function move(angle, extMoving) {
		var R = h * 0.0908;
		robot.moveMouse(BasePosition.x + R * Math.cos(angle), BasePosition.y + R * Math.sin(angle));
		if(!extMoving) {
			moving = true;
			setTimeout(function() {
				robot.mouseToggle("down");
			}, 20);
		}
	}

	function stop() {
		var mousePos = robot.getMousePos();
		//robot.moveMouse(w / 2, h * 0.44);
		robot.mouseToggle("up");
		moving = false;
	}
	
	function LeftThumbIfCallback (x, y) {
		lastAngle = Math.atan2(y, x);
		move(lastAngle, moving);
	}
	
	function LeftThumbElseCallback() {		
		if(moving) {
			stop();
		}
	}

	function ResolveDataInput(data) {
		
		// resolve left thumb axis
		
		MoveThumbstick(data[1], data[3], 
			MAX_INPUT_THUMBSTICK, 
			LEFT_THUMBSTICK_THRESHOLD, 
			LeftThumbIfCallback,
			LeftThumbElseCallback);

		// resolve buttons
		
		var buttons = data[10];
		
		for(var i = 128; i >= 1; i = i / 2) {
			var pressed = buttons - i >= 0;
			ActivateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
			buttons = buttons >= i ? buttons - i : buttons;
		}

		// resolve r3 and l3

		buttons = data[11] % 4;

		if(DPADOfExile[buttons]) /* Cases 1 or 2 */ {
			var key = DPADOfExile[buttons];
			ActivateKey(DPADOfExile, InputDPAD, BehaviorOfExile, buttons, true);
			if(buttons === 1) {
				ActivateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 2, false);
			} else {
				ActivateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 1, false);
			}
		} else {
			ActivateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 2, false);
			ActivateKey(DPADOfExile, InputDPAD, BehaviorOfExile, 1, false);
		}
		
		// resolve dpad
		
		ResolveDpadInput(data[11], DPADOfExile, InputDPAD, BehaviorOfExile);
		
		var timestamp = new Date().getTime();
		
		if(data[9] < 128 && timestamp - lastTimeClick > 500) {

			robot.keyToggle("alt", "down");

			setTimeout(function() {
		
				robot.mouseClick("left");
				
				setTimeout(function() {
					robot.keyToggle("alt", "up");
				}, 22);
				
			}, 50);

			lastTimeClick = timestamp;
		} else if(data[9] > 128 && timestamp - lastTimeClick > 500) {
			robot.keyTap("escape");
			lastTimeClick = timestamp;
		}
	}

	function EnterArea() {
		robot.moveMouse(BasePosition.x, BasePosition.y);
		SignatureDetectionWorker.postMessage({cmd: 'clear-lastsig'});
	}
	
	function LeaveArea() {
		ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
	}
	
	function SetBehavior(qBehavior, wBehavior, eBehavior, rBehavior, rightBehavior, middleBehavior) {
		BehaviorOfExile['q'][0] = qBehavior;
		BehaviorOfExile['w'][0] = wBehavior;
		BehaviorOfExile['e'][0] = eBehavior;
		BehaviorOfExile['r'][0] = rBehavior;
		BehaviorOfExile['right'][0] = rightBehavior;
		BehaviorOfExile['middle'][0] = middleBehavior;
	};
	
	return {
		EnterArea: EnterArea,
		ResolveInput: ResolveDataInput,
		LeaveArea: LeaveArea,
		SetBehavior: SetBehavior
	};
	
})();

var CURRENT_GAME_MODE = GAME_MODE.ARPG;
var GAME_MODE_OBJECT = GAME_MODE_ARPG;

/* END OF GAME MODES */

var MAX_INPUT_THUMBSTICK = 128;

var MoveThumbstick = (function() {
	
	var Function = function (DataX, DataY, Max, Threshold, IfCallback, ElseCallback) {
		var x = (DataX - Max) / Max;
		var y = (DataY - Max) / Max;

		if(Math.abs(x) > Threshold || Math.abs(y) > Threshold) {
			
			if(Math.abs(x) > Threshold) {
				x = Math.sign(x) * (Math.abs(x) - Threshold)/(1 - Threshold);
			}
			
			if(Math.abs(y) > Threshold) {
				y = Math.sign(y) * (Math.abs(y) - Threshold)/(1 - Threshold);
			}
			
			IfCallback(x, y);
		} else {
			ElseCallback();
		}

	}

	return Function;
	
})();

/*

Indexes
1  - X Axis - Left Thumbstick
3  - Y Axis - Left Thumbstick

5 - X Axis - Right Thumbstick
7 - Y Axis - Right Thumbstick

8 & 9 - Triggers
	= 00 (8) & 128 (9) Neutral
	< 128 (9) Right Trigger
	> 128 (9) Left Trigger
	= 00 (9) & 128 (8) RT + LT
	
10 - Keys

	Values
	1   - X
	2   - Circle
	4   - Square	
	8   - Triangle
	16  - L1
	32  - R1
	64  - Select
	128 - Start
	
11 - POV Hat, L3 and R3
	
	Calculation: (INPUT % 4) = L3 and R3 values
				 INT(INPUT / 4) * 4 = POV Hat switch
	
	Values
	
	1 	- L3
	2	- R3
	3	- L3 + R3
	
	POV Hat
	4	- Up
	8	- Up + Right
	12 	- Right
	16 	- Down + Right
	20	- Down
	24	- Down + Left
	28 	- Left
	32	- Up + Left
	
*/

var RIGHT_THUMBSTICK_THRESHOLD = 0.16;

function RightThumbIfCallback (x, y) {
	var pos = robot.getMousePos();
	var mouseSpeed = 3;
	x = mouseSpeed * Math.sign(x) * Math.pow(x, 2);
	y = mouseSpeed * Math.sign(y) * Math.pow(y, 2);
	robot.moveMouse(pos.x + x * mouseSpeed, pos.y + y * mouseSpeed);
}

function RightThumbElseCallback() {		
}

var LastInputData = null;

function ControllerListener (data) {
	LastInputData = data;
}

function StartControllerListener(DEBUG_MODE) {
	xbox.HIDController.addListener('data', ControllerListener);
	if(!DEBUG_MODE) {
		SignatureDetectionWorker.postMessage({cmd: 'init', data: {defaultGameMode: GAME_MODE.ARPG, resolutionPrefix: fileResolutionPrefix}});
	}
}

function RemoveControllerListener() {
	xbox.HIDController.removeListener('data', ControllerListener);
	clearInterval(DetectPollingInterval);
	clearInterval(RightThumbstickMouseInterval);
	DetectPollingInterval = null;
	RightThumbstickMouseInterval = null;
	LastInputData = null;
}

var EXPORTED_INPUT_MODES = {
	"Simple": [
		{
			name: "Just press",
			key: "nothing",
			help: "Just press the key. Use the last mouse cursor position for some abilities. Good for generic ranged attacks."
		},
		{
			name: "Center mouse and press",
			key: "MouseNeutral",
			help: "Move the mouse to the center position and press the key. Good for melee attacks (use game client's aim bot)."
		}
	],
	"Increment": [
		{
			name: "Small increment to cursor position",
			key: "MouseLastAngleLow",
			help: "Use a small increment to the cursor position last angle before pressing the button. Good for totems and traps"
		},
		{
			name: "Medium increment to cursor position",
			key: "MouseLastAngleMid",
			help: "Use a medium increment to the cursor position last angle before pressing the button. Good for totems, traps and skills like leap slam"		
		},
		{
			name: "High increment to cursor position",
			key: "MouseLastAngleHigh",
			help: "Use a high increment to the cursor position last angle before pressing the button. Good for totems, traps and skills like leap slam"		
		}
	]
};

if(DEBUG_MODE) {
	CURRENT_GAME_MODE = GAME_MODE.DEBUG;
	GAME_MODE_OBJECT = GAME_MODE_DEBUG;
	StartControllerListener();
	PollGamepadEvents();
}

/*exec("nw . --disable-gpu --force-cpu-draw", function(error, stdout, stderr) {
	console.log(stdout);
	if(error) {
		return console.error(stderr);
	}
});*/
