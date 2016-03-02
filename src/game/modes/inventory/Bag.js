var Inventory = require('./game/Inventory');
var robot = require('robotjs');
var behaviors = require('./game/Behaviors');

behaviors["BagArea.Up"] = function () {
	if (Inventory.INVENTORY_INDEX < 12) /* Change Area, Flasks */ {
		Inventory.leaveCurrentSubSection(AreaId.FLASKS_AREA);
	} else {
		Inventory.INVENTORY_INDEX -= 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["BagArea.Down"] = function () {
	if (Inventory.INVENTORY_INDEX >= 48) /* Change Area, Gems */ {

	} else {
		Inventory.INVENTORY_INDEX += 12;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["BagArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX % 12 === 0) /* Change to SubSection, if open */ {
		Inventory.enterCurrentSubSection();
	} else {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["BagArea.Right"] = function () {
	if ((Inventory.INVENTORY_INDEX + 1) % 12 === 0) /* Does nothing (?) */ {

	} else {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["BagArea.CenterClick"] = function () {
	robot.moveMouse(BasePosition.x, BasePosition.y);
	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
		}, 24);
	}, 24);
};

function SetBagAreaPosition(Position) {
	var positionX = (Inventory.INVENTORY_INDEX % 12);
	var positionY = parseInt(Inventory.INVENTORY_INDEX / 12);

	var basePositionX = Window.width * 0.685;
	var basePositionY = Window.height * 0.58;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

modules.export = {
	setPosition: SetBagAreaPosition
};