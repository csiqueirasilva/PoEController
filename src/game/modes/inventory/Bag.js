module.exports = {};

var Inventory = require('../Inventory');
var robot = require('robotjs');
var behaviors = require('../../Behaviors').functions;
var Window = require('../../Window');

behaviors["BagArea.Up"] = function () {
	if (Inventory.getIndex() < 12) /* Change Area, Flasks */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.FLASKS_AREA);
	} else {
		Inventory.subIndex(12);
		SetBagAreaPosition(Inventory.getIndex());
	}
};

behaviors["BagArea.Down"] = function () {
	if (Inventory.getIndex() >= 48) /* Change Area, Gems */ {

	} else {
		Inventory.addIndex(12);
		SetBagAreaPosition(Inventory.getIndex());
	}
};

behaviors["BagArea.Left"] = function () {
	if (Inventory.getIndex() % 12 === 0) /* Change to SubSection, if open */ {
		Inventory.enterCurrentSubSection();
	} else {
		Inventory.decIndex();
		SetBagAreaPosition(Inventory.getIndex());
	}
};

behaviors["BagArea.Right"] = function () {
	if ((Inventory.getIndex() + 1) % 12 === 0) /* Does nothing (?) */ {

	} else {
		Inventory.icrIndex();
		SetBagAreaPosition(Inventory.getIndex());
	}
};

behaviors["BagArea.CenterClick"] = function () {
	robot.moveMouse(Window.basePosition.x, Window.basePosition.y);
	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			SetBagAreaPosition(Inventory.getIndex());
		}, 24);
	}, 24);
};

function SetBagAreaPosition(Position) {
	var positionX = (Inventory.getIndex() % 12);
	var positionY = parseInt(Inventory.getIndex() / 12);

	var basePositionX = Window.width * 0.685;
	var basePositionY = Window.height * 0.58;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetBagAreaPosition;