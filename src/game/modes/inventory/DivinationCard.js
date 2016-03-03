module.exports = {};

var Inventory = require('../Inventory');
var Window = require('../../Window');
var robot = require('robotjs');

function SetDivinationCardAreaPosition(Position) {
	var positionX = (Inventory.getIndex() % 10);
	var positionY = parseInt(Inventory.getIndex() / 10);

	var basePositionX = Window.width * 0.33;
	var basePositionY = Window.height * 0.33;

	robot.moveMouse(basePositionX + positionX * Inventory.ITEM_SQUARE_ICR, basePositionY + positionY * Inventory.ITEM_SQUARE_ICR);
}

module.exports.setPosition = SetDivinationCardAreaPosition;