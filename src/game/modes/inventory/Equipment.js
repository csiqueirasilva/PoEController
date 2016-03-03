module.exports = {};

var Inventory = require('../Inventory');
var robot = require('robotjs');
var Window = require('../../Window');
var behaviors = require('../../Behaviors').functions;

behaviors["EquipmentArea.Up"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.getIndex()].u;

	if (pos !== undefined) {
		Inventory.setIndex(pos);
		SetEquipmentAreaPosition(Inventory.getIndex());
	}
};

behaviors["EquipmentArea.Down"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.getIndex()].d;

	if (pos === -1) /* Change Area, Flasks */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.FLASKS_AREA);
	} else if (pos !== undefined) {
		Inventory.setIndex(pos);
		SetEquipmentAreaPosition(Inventory.getIndex());
	}

};

behaviors["EquipmentArea.Left"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.getIndex()].l;

	if (pos !== undefined) {
		Inventory.setIndex(pos);
		SetEquipmentAreaPosition(Inventory.getIndex());
	}
};

behaviors["EquipmentArea.Right"] = function () {
	var pos = Inventory.EQUIPMENT_GRAPH[Inventory.getIndex()].r;

	if (pos !== undefined) {
		Inventory.setIndex(pos);
		SetEquipmentAreaPosition(Inventory.getIndex());
	}
};

function SetEquipmentAreaPosition(Position) {

	var basePositionX = Window.width;
	var basePositionY = Window.height;

	switch (Position) {
		case Inventory.EQUIPMENT_INDEX_TABLE.MAIN_HAND:
			basePositionX *= 0.719;
			basePositionY *= 0.301;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.RING_L:
			basePositionX *= 0.783;
			basePositionY *= 0.301;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.GLOVES:
			basePositionX *= 0.782;
			basePositionY *= 0.412;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.BELT:
			basePositionX *= 0.828;
			basePositionY *= 0.412;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.CHEST:
			basePositionX *= 0.826;
			basePositionY *= 0.350;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.HELMET:
			basePositionX *= 0.826;
			basePositionY *= 0.193;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.RING_R:
			basePositionX *= 0.891;
			basePositionY *= 0.301;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.OFF_HAND:
			basePositionX *= 0.933;
			basePositionY *= 0.301;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.BOOTS:
			basePositionX *= 0.916;
			basePositionY *= 0.412;
			break;
		case Inventory.EQUIPMENT_INDEX_TABLE.AMULET:
			basePositionX *= 0.891;
			basePositionY *= 0.240;
	}

	robot.moveMouse(basePositionX, basePositionY);
}

module.exports.setPosition = SetEquipmentAreaPosition;