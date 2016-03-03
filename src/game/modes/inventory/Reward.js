module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors').functions;

behaviors["RewardsArea.Up"] = function () {
	if (Inventory.getIndex() >= 10) {
		Inventory.subIndex(10);
		SetRewardAreaPosition(Inventory.getIndex());
	}
};

behaviors["RewardsArea.Down"] = function () {
	if (Inventory.getIndex() < 50) {
		Inventory.addIndex(10);
		SetRewardAreaPosition(Inventory.getIndex());
	}
};

behaviors["RewardsArea.Left"] = function () {
	if (Inventory.getIndex() % 10 !== 0) {
		Inventory.decIndex();
		SetRewardAreaPosition(Inventory.getIndex());
	}
};

behaviors["RewardsArea.Right"] = function () {
	if ((Inventory.getIndex() + 1) % 10 === 0) /* Goes Back to BagArea */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.icrIndex();
		SetRewardAreaPosition(Inventory.getIndex());
	}
};

function SetRewardAreaPosition(Position) {
	var positionX = (Inventory.getIndex() % 10);
	var positionY = parseInt(Inventory.getIndex() / 10);

	var basePositionX = Window.width * 0.202;
	var basePositionY = Window.height * 0.3426;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetRewardAreaPosition;