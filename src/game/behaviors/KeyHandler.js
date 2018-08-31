var robot = require('robotjs');

function IsMouseInput(Key) {
	return Key === "left" || Key === "right" || Key === "middle";
}

function ActionKey(Key, Action) {
	if (IsMouseInput(Key)) {
		robot.mouseToggle(Action, Key);
	} else if (Key.match(/\./) === null) {
		robot.keyToggle(Key, Action);
	}
}

module.exports = {
	handle: ActionKey
};