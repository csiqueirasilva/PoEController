module.exports = {};

var Inventory = require('../Inventory');
var robot = require('robotjs');
var Window = require('../../Window');
var behaviors = require('../../Behaviors').functions;

var globalDiffY = (-(Window.height / 1080) + 1) * 100;

function proxyMoveMouse(x, y) {
	robot.moveMouse(x, y - globalDiffY);
}

behaviors["CraftArea.Up"] = function () {
	if (Inventory.getIndex() === 7 || Inventory.getIndex() === 8 || Inventory.getIndex() === 9) {
		Inventory.subIndex(2);
	} else if (Inventory.getIndex() === 5 || Inventory.getIndex() === 6) {
		Inventory.setIndex(0);
	} else if (Inventory.getIndex() !== 0) {
		Inventory.decIndex();
	}

	SetCraftAreaPosition(Inventory.getIndex());
};

behaviors["CraftArea.Down"] = function () {
	if (Inventory.getIndex() === 7 || Inventory.getIndex() === 8 || Inventory.getIndex() === 9) /* Goes to Confirm */ {
		Inventory.setIndex(9);
	} else if (Inventory.getIndex() === 5 || Inventory.getIndex() === 6) {
		Inventory.addIndex(2);
	} else {
		Inventory.icrIndex();
	}

	SetCraftAreaPosition(Inventory.getIndex());
};

behaviors["CraftArea.Left"] = function () {
	if (Inventory.getIndex() === 6 || Inventory.getIndex() === 8) {
		Inventory.decIndex();
		SetCraftAreaPosition(Inventory.getIndex());
	}
};

behaviors["CraftArea.Right"] = function () {
	if (Inventory.getIndex() !== 5 && Inventory.getIndex() !== 7) {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.icrIndex();
		SetCraftAreaPosition(Inventory.getIndex());
	}
};

behaviors["CraftArea.ScrollUp"] = function () {
	var posX = Window.width * 0.440;
	var posY = Window.height * 0.171;

	proxyMoveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			SetCraftAreaPosition(Inventory.getIndex());
		}, 24);
	}, 24);
};

behaviors["CraftArea.ScrollDown"] = function () {
	var posX = Window.width * 0.440;
	var posY = Window.height * 0.547;

	proxyMoveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			SetCraftAreaPosition(Inventory.getIndex());
		}, 24);
	}, 24);
};

function SetCraftAreaPosition(Position) {

	var posX;
	var posY;

	if (Position === 9) {
		posX = Window.width * 0.326;
		posY = Window.height * 0.816;
	} else if (Position >= 5 && Position <= 8) {

		var basePositionX = Window.width * 0.313;
		var basePositionY = Window.height * 0.676;

		posX = basePositionX + parseInt((Inventory.getIndex() - 5) % 2) * Inventory.ITEM_SQUARE_ICR;
		posY = basePositionY + parseInt((Inventory.getIndex() - 5) / 2) * Inventory.ITEM_SQUARE_ICR;
	} else {
		posX = Window.width * 0.326;
		posY = Window.height * 0.200;

		posY += Window.height * 0.083 * Inventory.getIndex();
	}

	proxyMoveMouse(posX, posY);
}

module.exports.setPosition = SetCraftAreaPosition;