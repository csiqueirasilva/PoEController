var Enums = require('../Enums');
var KEYS = Enums.KEYS;
var GAME_MODE = Enums.GAME_MODE;
var Game = require('../Game');
var Window = require('../Window');
var Input = require('../Input');
var SubSectionSignatures = Game.inventorySignatures;

var BagArea = require('../modes/inventory/Bag');
var Craft = require('../modes/inventory/Craft');
var FlasksArea = require('../modes/inventory/Flasks');
var EquipmentArea = require('../modes/inventory/Equipment');
var Reward = require('../modes/inventory/Reward');
var Sell = require('../modes/inventory/Sell');
var Stash = require('../modes/inventory/Stash');

var AreaId = {
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

var INVENTORY_INDEX = null;
var SET_AREA_POSITION_CB = null;
var ITEM_SQUARE_ICR = Window.height * 0.0479;

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
	r: EquipmentIndexTable.OFF_HAND
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

var CurrentSubSection = null;
var CURRENT_AREA = null;

var LeaveSubSectionDelay = 100;

function LeaveCurrentSubSection(TargetArea) {
	setTimeout(function () {
		ChangeActiveInputArea(TargetArea);
	}, LeaveSubSectionDelay);
}

function EnterCurrentSubSection() {
	switch (CurrentSubSection) {
		case GAME_MODE.REWARD_SCREEN:
			EnterRewardArea();
			break;
		case GAME_MODE.CRAFT_SCREEN:
			EnterCraftArea();
			break;
		case GAME_MODE.DIVINATION_CARD_SCREEN: /* NOT YET IMPLEMENTED */
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
	if (CurrentSubSection !== null) {
		Game.updateUI(CurrentSubSection);
	}
}

function ChangeActiveInputArea(mode) {
	
	CURRENT_AREA = mode;
	
	switch (CURRENT_AREA) {
		case AreaId.BAG_AREA:
			SET_AREA_POSITION_CB = BagArea.setPosition;
			break;
		case AreaId.FLASKS_AREA:
			SET_AREA_POSITION_CB = FlasksArea.setPosition;
			break;
		case AreaId.GEMS_AREA:
//			SET_AREA_POSITION_CB = GemsArea.setPosition;
			break;
		case AreaId.EQUIPMENT_AREA:
			SET_AREA_POSITION_CB = EquipmentArea.setPosition;
			break;
		case AreaId.REWARDS:
			SET_AREA_POSITION_CB = Reward.setPosition;
			break;
		case AreaId.CRAFT:
			SET_AREA_POSITION_CB = Craft.setPosition;
			break;
		case AreaId.SELL:
			SET_AREA_POSITION_CB = Sell.setPosition;
			break;
		case AreaId.SELL:
			SET_AREA_POSITION_CB = Stash.setPosition;
			break;
	}
	
	INVENTORY_INDEX = 0;
	ResetInputArrays();
	SET_AREA_POSITION_CB(INVENTORY_INDEX);
}

var KeysOfExile = {};
var DPADOfExile = {};

for (var i in AreaId) {
	KeysOfExile[AreaId[i]] = {};
	DPADOfExile[AreaId[i]] = {};

	KeysOfExile[AreaId[i]][KEYS.KEY_DOWN] = "left";
	KeysOfExile[AreaId[i]][KEYS.KEY_RIGHT] = "right";
}

// sell area
KeysOfExile[AreaId.CRAFT][KEYS.KEY_LEFT] = "CraftArea.ScrollDown";
KeysOfExile[AreaId.CRAFT][KEYS.KEY_UP] = "CraftArea.ScrollUp";

DPADOfExile[AreaId.CRAFT][KEYS.DPAD_UP] = "CraftArea.Up";
DPADOfExile[AreaId.CRAFT][KEYS.DPAD_DOWN] = "CraftArea.Down";
DPADOfExile[AreaId.CRAFT][KEYS.DPAD_LEFT] = "CraftArea.Left";
DPADOfExile[AreaId.CRAFT][KEYS.DPAD_RIGHT] = "CraftArea.Right";

// sell area
KeysOfExile[AreaId.SELL][KEYS.KEY_UP] = "SellArea.Cancel";
KeysOfExile[AreaId.SELL][KEYS.KEY_LEFT] = "SellArea.Confirm";

DPADOfExile[AreaId.SELL][KEYS.DPAD_UP] = "SellArea.Up";
DPADOfExile[AreaId.SELL][KEYS.DPAD_DOWN] = "SellArea.Down";
DPADOfExile[AreaId.SELL][KEYS.DPAD_LEFT] = "SellArea.Left";
DPADOfExile[AreaId.SELL][KEYS.DPAD_RIGHT] = "SellArea.Right";

// bag area
KeysOfExile[AreaId.BAG_AREA][KEYS.KEY_SHOULDER_LEFT] = "control";
KeysOfExile[AreaId.BAG_AREA][KEYS.KEY_SHOULDER_RIGHT] = "shift";

KeysOfExile[AreaId.BAG_AREA][KEYS.KEY_UP] = "BagArea.CenterClick";

DPADOfExile[AreaId.BAG_AREA][KEYS.DPAD_UP] = "BagArea.Up";
DPADOfExile[AreaId.BAG_AREA][KEYS.DPAD_DOWN] = "BagArea.Down";
DPADOfExile[AreaId.BAG_AREA][KEYS.DPAD_LEFT] = "BagArea.Left";
DPADOfExile[AreaId.BAG_AREA][KEYS.DPAD_RIGHT] = "BagArea.Right";

// rewards

DPADOfExile[AreaId.REWARDS][KEYS.DPAD_UP] = "RewardsArea.Up";
DPADOfExile[AreaId.REWARDS][KEYS.DPAD_DOWN] = "RewardsArea.Down";
DPADOfExile[AreaId.REWARDS][KEYS.DPAD_LEFT] = "RewardsArea.Left";
DPADOfExile[AreaId.REWARDS][KEYS.DPAD_RIGHT] = "RewardsArea.Right";

// stash

KeysOfExile[AreaId.STASH][KEYS.KEY_SHOULDER_LEFT] = "control";
KeysOfExile[AreaId.STASH][KEYS.KEY_SHOULDER_RIGHT] = "shift";

KeysOfExile[AreaId.STASH][KEYS.KEY_LEFT] = "StashArea.Back";
KeysOfExile[AreaId.STASH][KEYS.KEY_UP] = "StashArea.Forward";
KeysOfExile[AreaId.STASH][KEYS.KEY_SELECT] = "StashArea.SelectTab";

DPADOfExile[AreaId.STASH][KEYS.DPAD_UP] = "StashArea.Up";
DPADOfExile[AreaId.STASH][KEYS.DPAD_DOWN] = "StashArea.Down";
DPADOfExile[AreaId.STASH][KEYS.DPAD_LEFT] = "StashArea.Left";
DPADOfExile[AreaId.STASH][KEYS.DPAD_RIGHT] = "StashArea.Right";

// equipments

DPADOfExile[AreaId.EQUIPMENT_AREA][KEYS.DPAD_UP] = "EquipmentArea.Up";
DPADOfExile[AreaId.EQUIPMENT_AREA][KEYS.DPAD_DOWN] = "EquipmentArea.Down";
DPADOfExile[AreaId.EQUIPMENT_AREA][KEYS.DPAD_LEFT] = "EquipmentArea.Left";
DPADOfExile[AreaId.EQUIPMENT_AREA][KEYS.DPAD_RIGHT] = "EquipmentArea.Right";

// flasks

DPADOfExile[AreaId.FLASKS_AREA][KEYS.DPAD_UP] = "FlasksArea.Up";
DPADOfExile[AreaId.FLASKS_AREA][KEYS.DPAD_DOWN] = "FlasksArea.Down";
DPADOfExile[AreaId.FLASKS_AREA][KEYS.DPAD_LEFT] = "FlasksArea.Left";
DPADOfExile[AreaId.FLASKS_AREA][KEYS.DPAD_RIGHT] = "FlasksArea.Right";

// special case
KeysOfExile[KEYS.KEY_START] = "ARPG.Fixed.EscapeAndReturn";

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
	"ARPG.Fixed.EscapeAndReturn": [null, "ARPG.Fixed.EscapeAndReturn"]
};

// Set all DPAD keys
for (var key in DPADOfExile) {
	var dpadSetKeys = DPADOfExile[key];
	for (var inner in dpadSetKeys) {
		var v = dpadSetKeys[inner];
		BehaviorOfExile[v] = [v];
	}
}

var InputDPAD = {};
var InputKeys = {};

function ResolveInput(data) {

	//console.log(robot.getMousePos());

	var buttons = data[10];

	/* START KEY SPECIAL CASE */
	var pressed = buttons - 128 >= 0;
	Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, 128, pressed);
	buttons = buttons >= 128 ? buttons - i : buttons;

	for (var i = 64; i >= 1; i = i / 2) {
		pressed = buttons - i >= 0;
		Input.activateKey(KeysOfExile[CURRENT_AREA], InputKeys, BehaviorOfExile, i, pressed);
		buttons = buttons >= i ? buttons - i : buttons;
	}

	// solve dpad
	Input.dpad(data[11], DPADOfExile[CURRENT_AREA], InputDPAD, BehaviorOfExile, true);
}

var SubSectionDetectionInterval = null;

function LeaveArea() {
	Game.signatureDetectionWorker.postMessage({cmd: 'set-subsigs', data: null});
	clearInterval(SubSectionDetectionInterval);
	SubSectionDetectionInterval = null;
	CurrentSubSection = null;
}

function EnterArea() {
	//console.log('enter area');
	//robot.mouseToggle("up");
	//console.log('set subsigs');
	Game.signatureDetectionWorker.postMessage({cmd: 'set-subsigs', data: SubSectionSignatures});
	SubSectionDetectionInterval = setInterval(function () {
		Game.signatureDetectionWorker.postMessage({cmd: 'detect-sub'});
	}, Game.DETECTION_INTERVAL_MS);
	ChangeActiveInputArea(AreaId.BAG_AREA);
}

function ResetInputArrays() {
	Input.ResetInputArrays(InputKeys, InputDPAD);
}

module.exports = {
	INVENTORY_INDEX: INVENTORY_INDEX,
	SET_AREA_POSITION_CB: SET_AREA_POSITION_CB,
	ITEM_SQUARE_ICR: ITEM_SQUARE_ICR,
	EQUIPMENT_INDEX_TABLE: EquipmentIndexTable,
	AREA_ID: AreaId,
	EQUIPMENT_GRAPH: EquipmentGraph,
	resolveInput: ResolveInput,
	enterArea: EnterArea,
	leaveArea: LeaveArea,
	subSection: ChangeIntoSubSection,
	resetInputArrays: ResetInputArrays,
	enterCurrentSubSection: EnterCurrentSubSection,
	leaveCurrentSubSection: LeaveCurrentSubSection
};