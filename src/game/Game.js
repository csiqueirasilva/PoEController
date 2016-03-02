var DEBUG_MODE = require('./game/Enums').DEBUG_MODE;
var Logger = require('./game/Logger');
var Window = require('./game/Window');
var Input = require('./game/Input');
var Worker = require('workerjs');
var exec = require('child_process').exec;
var fs = require('fs');

var SignatureDetectionWorker = new Worker('src/game/SignatureDetectionWorker.js');

var DETECTION_INTERVAL_MS = 750;

var mainModesSignatures = null;
var inventorySignatures = null;

function loadAllSignatureFiles () {
	mainModesSignatures = ReadSignatureFile(Window.resolution  + "signatures.json");
	inventorySignatures = ReadSignatureFile(Window.resolution + "inventory-signatures.json");
}

function ReadSignatureFile(filename) {

	var ret = null;
	
	var filepath = "signatures/" + (filename || "signatures.json");
	
	try {
		ret = fs.readFileSync(filepath, 'utf8');
		ret = JSON.parse(ret);
		Logger.info('Read signature file ' + filepath + ' from disk');
	} catch (e) {
		SignatureNotFound(filepath);
	}

	return ret;
}

function SignatureNotFound(filename) {

	if (!DEBUG_MODE) {
		Window.quit('Signature file ' + filename + ' not found. Could not start the application.');
	} else {
		Logger.warn('Signature file ' + filename + ' not found.');
	}

}

SignatureDetectionWorker.onmessage = function (event) {
	var cmd = event.data.cmd;
	var data = event.data.data;

	switch (cmd) {
		case 'detect-sub':
			console.log('detect-sub', IndexOf(GAME_MODE, data));
			if (GAME_MODE_OBJECT.SubSection instanceof Function) {
				GAME_MODE_OBJECT.SubSection(data);
			}
			break;
		case 'detect':
			ChangeGameMode(data);
			break;
		case 'init':
			InitGame();
			break;
		case 'signature-not-found':
			SignatureNotFound(data);
	}
};

var DetectPollingInterval = null;
var RightThumbstickMouseInterval = null;

function PollGamepadEvents() {
	RightThumbstickMouseInterval = setInterval(function () {

		if (LastInputData !== null) {
			// resolve right thumb axis
			MoveThumbstick(LastInputData[5], LastInputData[7],
				MAX_INPUT_THUMBSTICK,
				RIGHT_THUMBSTICK_THRESHOLD,
				RightThumbIfCallback,
				RightThumbElseCallback);

			GAME_MODE_OBJECT.ResolveInput(LastInputData);
		}

	}, InputInterval);
}

function InitGame() {
	DetectPollingInterval = setInterval(function () {
		SignatureDetectionWorker.postMessage({cmd: 'detect', data: {CURRENT_GAME_MODE: CURRENT_GAME_MODE, isBlockedGameMode: IsBlockedGameMode()}});
	}, DETECTION_INTERVAL_MS);

	PollGamepadEvents();

	exec("start steam://rungameid/238960", function (error, stdout, stderr) {
		console.log(stdout);

		if (error) {
			return console.error(stderr);
		}
	});

	if (cbInitGame instanceof Function) {
		cbInitGame();
	}
}

function IsBlockedGameMode() {
	return CURRENT_GAME_MODE !== null && CURRENT_GAME_MODE < 1000;
}

var LastInputData = null;

function ControllerListener(data) {
	LastInputData = data;
}

var cbInitGame = null;

function StartControllerListener(DEBUG_MODE, callbackInitGame) {
	Controller.addDataListener(ControllerListener);
	cbInitGame = callbackInitGame;
	if (!DEBUG_MODE) {
		SignatureDetectionWorker.postMessage({cmd: 'init', data: {defaultGameMode: GAME_MODE.ARPG}});
	}
}

function RemoveControllerListener() {
	Controller.removeDataListener(ControllerListener);
	clearInterval(DetectPollingInterval);
	clearInterval(RightThumbstickMouseInterval);
	DetectPollingInterval = null;
	RightThumbstickMouseInterval = null;
	LastInputData = null;
}

var CURRENT_GAME_MODE = null;
var GAME_MODE_OBJECT = null;

function Init() {
	if (DEBUG_MODE) {
		showAllDevTools();
		CURRENT_GAME_MODE = GAME_MODE.DEBUG;
		GAME_MODE_OBJECT = GAME_MODE_DEBUG;
		StartControllerListener();
		PollGamepadEvents();
	} else {
		CURRENT_GAME_MODE = GAME_MODE.ARPG;
		GAME_MODE_OBJECT = GAME_MODE_ARPG;
	}
}

var ChangeGameModeUpdateUICallback = null;

function ChangeGameMode(NewGameMode) {

	var oldGameMode = CURRENT_GAME_MODE;

	if (oldGameMode !== NewGameMode) {

		//console.log(IndexOf(GAME_MODE, oldGameMode) + " to " + IndexOf(GAME_MODE, NewGameMode));

		if (GAME_MODE_OBJECT && GAME_MODE_OBJECT.LeaveArea instanceof Function) {
			GAME_MODE_OBJECT.LeaveArea();
		}

		var mode = null;

		switch (NewGameMode) {
			case GAME_MODE.DEBUG:
				mode = GAME_MODE_DEBUG;
				break;
			case GAME_MODE.INVENTORY:
				mode = GAME_MODE_INVENTORY;
				break;
			case GAME_MODE.OPTIONS_MENU:
				mode = GAME_MODE_OPTIONS_MENU;
				break;
			case GAME_MODE.PASSIVE_SKILL_TREE:
				mode = GAME_MODE_PASSIVE_SKILL_TREE;
				break;
			case GAME_MODE.WORLD_MAP:
				mode = GAME_MODE_WORLD_MAP;
				break;
			default:
				mode = GAME_MODE_ARPG;
		}

		CURRENT_GAME_MODE = NewGameMode;

		GAME_MODE_OBJECT = mode;

		if (oldGameMode !== CURRENT_GAME_MODE && mode.EnterArea instanceof Function) {
			mode.EnterArea();
		}

		UpdateUI(CURRENT_GAME_MODE);
	}
}

function setGameModeUpdateCallback(cb) {
	ChangeGameModeUpdateUICallback = cb;
}

function UpdateUI(mode) {
	if(ChangeGameModeUpdateUICallback instanceof Function) {
		ChangeGameModeUpdateUICallback(mode);
	}
}

modules.export({
	DETECTION_INTERVAL_MS: DETECTION_INTERVAL_MS,
	setGameModeUpdateCallback: setGameModeUpdateCallback,
	init: Init,
	loadSignatures: loadAllSignatureFiles,
	inventorySignatures: inventorySignatures,
	updateUI: UpdateUI,
	signatureDetectionWorker: SignatureDetectionWorker,
	changeMode: ChangeGameMode
});