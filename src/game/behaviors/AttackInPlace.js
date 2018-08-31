var robot = require('robotjs');

var ATTACK_IN_PLACE = false;

function setAttackInPlace() {
	ATTACK_IN_PLACE = true;
	robot.keyToggle('shift', 'down');
}

function clearAttackInPlace() {
	ATTACK_IN_PLACE = false;
	robot.keyToggle('shift', 'up');
}

function isAttackInPlace() {
	return ATTACK_IN_PLACE;
}

module.exports = {
	setAttackInPlace: setAttackInPlace,
	clearAttackInPlace: clearAttackInPlace,
	state: isAttackInPlace
};