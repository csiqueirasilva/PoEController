var BehaviorOfExile = {
	'left': [],
	'right': [],
	'PassiveSkillTree.ScrollDown': ["PassiveSkillTree.ScrollDown"],
	'PassiveSkillTree.ScrollUp': ["PassiveSkillTree.ScrollUp"],
	'ARPG.FetchLoot': ["ARPG.FetchLootHold", "ARPG.FetchLootRelease"],
	'ARPG.Fixed.EscapeAndReturn': [null, 'ARPG.Fixed.EscapeAndReturn']
};

var KeysOfExile = {
	1: 'left',
	16: 'PassiveSkillTree.ScrollDown',
	32: 'PassiveSkillTree.ScrollUp',
	64: 'ARPG.FetchLoot',
	128: 'ARPG.Fixed.EscapeAndReturn'
};

var DPADOfExile = {
};

var InputKeys = {
	1: false,
	2: false,
	4: false,
	8: false,
	16: false,
	32: false,
	64: false,
	128: false
};

var InputDPAD = {
};

DefaultBehaviours['PassiveSkillTree.ScrollDown'] = function () {
};

DefaultBehaviours['PassiveSkillTree.ScrollUp'] = function () {
};

function ResolveInput(data) {

	//console.log(robot.getMousePos());

	var buttons = data[10];

	for (var i = 128; i >= 1; i = i / 2) {
		pressed = buttons - i >= 0;
		Input.activateKey(KeysOfExile, InputKeys, BehaviorOfExile, i, pressed);
		buttons = buttons >= i ? buttons - i : buttons;
	}

	// resolve left thumb axis
	MoveThumbstick(data[1], data[3],
		MAX_INPUT_THUMBSTICK,
		RIGHT_THUMBSTICK_THRESHOLD,
		RightThumbIfCallback,
		RightThumbElseCallback);
}

function EnterArea() {
}

function LeaveArea() {
	ClearHeldInput(KeysOfExile, InputKeys, DPADOfExile, InputDPAD, BehaviorOfExile);
}

module.exports = {
	enterArea: EnterArea,
	resolveInput: ResolveInput,
	leaveArea: LeaveArea
};