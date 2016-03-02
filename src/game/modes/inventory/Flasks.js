var Inventory = require('./game/Inventory');
var Window = require('./game/Window');
var robot = require('robotjs');

behaviors["FlasksArea.Up"] = function () {
	/* Change Area, Equipment */
	Inventory.leaveCurrentSubSection(Inventory.AREA_ID.EQUIPMENT_AREA);
};

behaviors["FlasksArea.Down"] = function () {
	Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
};

behaviors["FlasksArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX === 0) /* Change to SubSection, if open */ {
		EnterCurrentSubSection();
	} else {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["FlasksArea.Right"] = function () {
	if (Inventory.INVENTORY_INDEX < 4) {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

function SetFlasksAreaPosition(Position) {
	var positionX = Inventory.INVENTORY_INDEX;

	var basePositionX = Window.width * 0.775;
	var basePositionY = Window.height * 0.478;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY);
}

modules.export = {
	setPosition: SetFlasksAreaPosition
};