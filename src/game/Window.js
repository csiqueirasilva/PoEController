var dialog = require('dialog');
var robot = require('robotjs');
var DEBUG_MODE = require('./Enums').DEBUG_MODE;
var gui = window.require('nw.gui');

var w = robot.getScreenSize().width;
var h = robot.getScreenSize().height;

var resolution = w + 'x' + h;
var aspect = w / h;

var basePosition = {
	x: w / 2,
	y: h * 0.44
};

function showAllDevTools() {
	for (var i in global.__nwWindowsStore) {
		global.__nwWindowsStore[i].showDevTools();
	}
}

function hideAllGUIWindows() {
	for (var i in global.__nwWindowsStore) {
		global.__nwWindowsStore[i].hide();
	}
}

function quitIf(test, msg) {
	if (test) {
		quit(msg);
	}
}

function quit(msg) {
	hideAllGUIWindows();
	dialog.warn(msg, function () {
		gui.App.quit();
	});
}

module.exports = {
	basePosition: basePosition,
	quit: quit,
	quitIf: quitIf,
	width: w,
	height: h,
	resolution: resolution,
	aspect: aspect,
	showDevTools: showAllDevTools
};