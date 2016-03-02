var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors');

behaviors["StashArea.Back"] = function () {
	var posX = Window.width * 0.013;
	var posY = Window.height * 0.132;

	robot.moveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
		}, 24);
	}, 24);

};

behaviors["StashArea.Forward"] = function () {
	var posX = Window.width * 0.320;
	var posY = Window.height * 0.132;

	robot.moveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
		}, 24);
	}, 24);
};

behaviors["StashArea.SelectTab"] = function () {

	var posX = Window.width * 0.028;
	var posY = Window.height * 0.132;

	robot.moveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
		}, 24);
	}, 24);

};

behaviors["StashArea.Up"] = function () {
	if (Inventory.INVENTORY_INDEX >= 12) {
		Inventory.INVENTORY_INDEX -= 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["StashArea.Down"] = function () {
	if (Inventory.INVENTORY_INDEX < 132) /* Change Area, Gems */ {
		Inventory.INVENTORY_INDEX += 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["StashArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX % 12 !== 0) {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["StashArea.Right"] = function () {
	if ((Inventory.INVENTORY_INDEX + 1) % 12 === 0) {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

function SetStashAreaPosition(Position) {
	var positionX = (Inventory.INVENTORY_INDEX % 12);
	var positionY = parseInt(Inventory.INVENTORY_INDEX / 12);

	var basePositionX = Window.width * 0.032;
	var basePositionY = Window.height * 0.190;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports = {
	setPosition: SetStashAreaPosition
};