var Inventory = require('./game/Inventory');
var robot = require('robotjs');
var Window = require('./game/Window');

var EquipmentIndexTable = Inventory.EQUIPMENT_INDEX_TABLE;

behaviors["EquipmentArea.Up"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.INVENTORY_INDEX].u;

	if (pos !== undefined) {
		Inventory.INVENTORY_INDEX = pos;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["EquipmentArea.Down"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.INVENTORY_INDEX].d;

	if (pos === -1) /* Change Area, Flasks */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.FLASKS_AREA);
	} else if (pos !== undefined) {
		Inventory.INVENTORY_INDEX = pos;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}

};

behaviors["EquipmentArea.Left"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.INVENTORY_INDEX].l;

	if (pos !== undefined) {
		Inventory.INVENTORY_INDEX = pos;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["EquipmentArea.Right"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.INVENTORY_INDEX].r;

	if (pos !== undefined) {
		Inventory.INVENTORY_INDEX = pos;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

function SetEquipmentAreaPosition(Position) {

	var basePositionX = Window.width;
	var basePositionY = Window.height;

	switch (Position) {
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

modules.export = {
	setPosition: SetEquipmentAreaPosition
};