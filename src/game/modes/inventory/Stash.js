module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');
var behaviors = require('../../Behaviors').functions;

behaviors["StashArea.Back"] = function () {
	var posX = Window.width * 0.013;
	var posY = Window.height * 0.132;

	robot.moveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			SetStashAreaPosition(Inventory.getIndex());
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
			SetStashAreaPosition(Inventory.getIndex());
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
			SetStashAreaPosition(Inventory.getIndex());
		}, 24);
	}, 24);

};

behaviors["StashArea.Up"] = function () {
	if (Inventory.getIndex() >= 12) {
		Inventory.subIndex(12);
		SetStashAreaPosition(Inventory.getIndex());
	}
};

behaviors["StashArea.Down"] = function () {
	if (Inventory.getIndex() < 132) /* Change Area, Gems */ {
		Inventory.addIndex(12);
		SetStashAreaPosition(Inventory.getIndex());
	}
};

behaviors["StashArea.Left"] = function () {
	if (Inventory.getIndex() % 12 !== 0) {
		Inventory.decIndex();
		SetStashAreaPosition(Inventory.getIndex());
	}
};

behaviors["StashArea.Right"] = function () {
	if ((Inventory.getIndex() + 1) % 12 === 0) {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.icrIndex();
		SetStashAreaPosition(Inventory.getIndex());
	}
};

function SetStashAreaPosition(Position) {
	var positionX = (Inventory.getIndex() % 12);
	var positionY = parseInt(Inventory.getIndex() / 12);

	var basePositionX = Window.width * 0.032;
	var basePositionY = Window.height * 0.190;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetStashAreaPosition;