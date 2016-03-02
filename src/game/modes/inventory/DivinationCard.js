var Inventory = require('./game/Inventory');
var Window = require('./game/Window');
var robot = require('robotjs');

function SetDivinationCardAreaPosition(Position) {
	var positionX = (Inventory.INVENTORY_INDEX % 10);
	var positionY = parseInt(Inventory.INVENTORY_INDEX / 10);

	var basePositionX = Window.width * 0.33;
	var basePositionY = Window.height * 0.33;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

modules.export = {
	setPosition: SetDivinationCardAreaPosition
};