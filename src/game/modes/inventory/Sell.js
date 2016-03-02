var Inventory = require('./game/Inventory');
var Window = require('./game/Window');
var robot = require('robotjs');
var behaviors = require('./game/Behaviors');

behaviors["SellArea.Up"] = function () {
	if (Inventory.INVENTORY_INDEX >= 12) {
		Inventory.INVENTORY_INDEX -= 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["SellArea.Down"] = function () {
	if (Inventory.INVENTORY_INDEX < 48) /* Change Area, Gems */ {
		Inventory.INVENTORY_INDEX += 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["SellArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX % 12 !== 0) /* Change to SubSection, if open */ {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["SellArea.Right"] = function () {
	if ((Inventory.INVENTORY_INDEX + 1) % 12 === 0) /* Does nothing (?) */ {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
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
	var positionX = (Inventory.INVENTORY_INDEX % 12);
	var positionY = parseInt(Inventory.INVENTORY_INDEX / 12);

	var basePositionX = Window.width * 0.185;
	var basePositionY = Window.height * 0.523;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

modules.export = {
	setPosition: SetSellAreaPosition
};