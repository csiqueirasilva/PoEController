var Logger = require('./Logger');
var FunctionLibrary = require('./FunctionLibrary');
var GAME_MODE = require('./Enums').GAME_MODE;

var CurrentMode = null;

function SubSection(mode) {
	if (typeof CurrentMode.SubSection === "function") {
		CurrentMode.SubSection(mode);
	}
}

function ResolveInput(data) {
	CurrentMode.resolveInput(data);
}

function SetMode(mode) {
	CurrentMode = mode;
}

function GetCurrent() {
	return CurrentMode.id;
}

function IsBlockedGameMode() {
	return CurrentMode.id < 1000;
}

function ChangeGameMode(NewGameMode) {

	var oldGameMode = CurrentMode;

	if (oldGameMode.id !== NewGameMode.id) {

		Logger.info('changing game mode to ' + FunctionLibrary.indexOf(GAME_MODE, NewGameMode.id));

		if (typeof CurrentMode.leaveArea === "function") {
			CurrentMode.leaveArea();
		}

		CurrentMode = NewGameMode;

		if (typeof CurrentMode.enterArea === "function") {
			CurrentMode.enterArea();
		}

		//window.updateGameOverlay(CurrentMode.id);
	}
}

module.exports = {
	change: ChangeGameMode,
	getCurrent: GetCurrent,
	isBlocked: IsBlockedGameMode,
	set: SetMode,
	solveInput: ResolveInput,
	subSection: SubSection
};