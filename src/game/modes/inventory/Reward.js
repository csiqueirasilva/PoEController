module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors');

behaviors["RewardsArea.Up"] = function () {
	if (Inventory.INVENTORY_INDEX >= 10) {
		Inventory.INVENTORY_INDEX -= 10;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["RewardsArea.Down"] = function () {
	if (Inventory.INVENTORY_INDEX < 50) {
		Inventory.INVENTORY_INDEX += 10;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["RewardsArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX % 10 !== 0) {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["RewardsArea.Right"] = function () {
	if ((Inventory.INVENTORY_INDEX + 1) % 10 === 0) /* Goes Back to BagArea */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

function SetRewardAreaPosition(Position) {
	var positionX = (Inventory.INVENTORY_INDEX % 10);
	var positionY = parseInt(Inventory.INVENTORY_INDEX / 10);

	var basePositionX = Window.width * 0.202;
	var basePositionY = Window.height * 0.3426;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetRewardAreaPosition;