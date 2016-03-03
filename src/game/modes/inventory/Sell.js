module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors').functions;

behaviors["SellArea.Up"] = function () {
	if (Inventory.getIndex() >= 12) {
		Inventory.subIndex(12);
		SetSellAreaPosition(Inventory.getIndex());
	}
};

behaviors["SellArea.Down"] = function () {
	if (Inventory.getIndex() < 48) /* Change Area, Gems */ {
		Inventory.addIndex(12);
		SetSellAreaPosition(Inventory.getIndex());
	}
};

behaviors["SellArea.Left"] = function () {
	if (Inventory.getIndex() % 12 !== 0) /* Change to SubSection, if open */ {
		Inventory.decIndex();
		SetSellAreaPosition(Inventory.getIndex());
	}
};

behaviors["SellArea.Right"] = function () {
	if ((Inventory.getIndex() + 1) % 12 === 0) /* Does nothing (?) */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.icrIndex();
		SetSellAreaPosition(Inventory.getIndex());
	}
};

behaviors["SellArea.Confirm"] = function () {
	var posX = Window.width * 0.194;
	var posY = Window.height * 0.758;

	robot.moveMouse(posX, posY);
};

behaviors["SellArea.Cancel"] = function () {
	var posX = Window.width * 0.456;
	var posY = Window.height * 0.758;

	robot.moveMouse(posX, posY);
};

function SetSellAreaPosition(Position) {
	var positionX = (Inventory.getIndex() % 12);
	var positionY = parseInt(Inventory.getIndex() / 12);

	var basePositionX = Window.width * 0.185;
	var basePositionY = Window.height * 0.523;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetSellAreaPosition;