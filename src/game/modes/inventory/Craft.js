var Inventory = require('./game/Inventory');
var robot = require('robotjs');
var Window = require('./game/Window');
var behaviors = require('./game/Behaviors');

var globalDiffY = (-(Window.height / 1080) + 1) * 100;

function proxyMoveMouse(x, y) {
	robot.moveMouse(x, y - globalDiffY);
}

behaviors["CraftArea.Up"] = function () {
	if (Inventory.INVENTORY_INDEX === 7 || Inventory.INVENTORY_INDEX === 8 || Inventory.INVENTORY_INDEX === 9) {
		Inventory.INVENTORY_INDEX -= 2;
	} else if (Inventory.INVENTORY_INDEX === 5 || Inventory.INVENTORY_INDEX === 6) {
		Inventory.INVENTORY_INDEX = 0;
	} else if (Inventory.INVENTORY_INDEX !== 0) {
		Inventory.INVENTORY_INDEX--;
	}

	Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
};

behaviors["CraftArea.Down"] = function () {
	if (Inventory.INVENTORY_INDEX === 7 || Inventory.INVENTORY_INDEX === 8 || Inventory.INVENTORY_INDEX === 9) /* Goes to Confirm */ {
		Inventory.INVENTORY_INDEX = 9;
	} else if (Inventory.INVENTORY_INDEX === 5 || Inventory.INVENTORY_INDEX === 6) {
		Inventory.INVENTORY_INDEX += 2;
	} else {
		Inventory.INVENTORY_INDEX++;
	}

	Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
};

behaviors["CraftArea.Left"] = function () {
	if (Inventory.INVENTORY_INDEX === 6 || Inventory.INVENTORY_INDEX === 8) {
		Inventory.INVENTORY_INDEX--;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["CraftArea.Right"] = function () {
	if (Inventory.INVENTORY_INDEX !== 5 && Inventory.INVENTORY_INDEX !== 7) {
		Inventory.leaveCurrentSubSection(Inventory.AREA_ID.BAG_AREA);
	} else {
		Inventory.INVENTORY_INDEX++;
		Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
	}
};

behaviors["CraftArea.ScrollUp"] = function () {
	var posX = Window.width * 0.440;
	var posY = Window.height * 0.171;

	proxyMoveMouse(posX, posY);

	setTimeout(function () {
		robot.mouseClick("left");
		setTimeout(function () {
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
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
			Inventory.SET_AREA_POSITION_CB(Inventory.INVENTORY_INDEX);
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

		posX = basePositionX + parseInt((Inventory.INVENTORY_INDEX - 5) % 2) * Inventory.ITEM_SQUARE_ICR;
		posY = basePositionY + parseInt((Inventory.INVENTORY_INDEX - 5) / 2) * Inventory.ITEM_SQUARE_ICR;
	} else {
		posX = Window.width * 0.326;
		posY = Window.height * 0.200;

		posY += Window.height * 0.083 * Inventory.INVENTORY_INDEX;
	}

	proxyMoveMouse(posX, posY);
}

modules.export = {
	setPosition: SetCraftAreaPosition
};