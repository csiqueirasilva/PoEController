module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors').functions;

behaviors["FlasksArea.Up"] = function () {
	/* Change Area, Equipment */
	Inventory.leaveCurrentSubSection(Inventory.AREA_ID.EQUIPMENT_AREA);
};

behaviors["FlasksArea.Down"] = function () {
	Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
};

behaviors["FlasksArea.Left"] = function () {
	if (Inventory.getIndex() === 0) /* Change to SubSection, if open */ {
		Inventory.enterCurrentSubSection();
	} else {
		Inventory.decIndex();
		SetFlasksAreaPosition(Inventory.getIndex());
	}
};

behaviors["FlasksArea.Right"] = function () {
	if (Inventory.getIndex() < 4) {
		Inventory.icrIndex();
		SetFlasksAreaPosition(Inventory.getIndex());
	}
};

function SetFlasksAreaPosition(Position) {
	var positionX = Inventory.getIndex();

	var basePositionX = Window.width * 0.775;
	var basePositionY = Window.height * 0.478;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY);
}

module.exports.setPosition = SetFlasksAreaPosition;