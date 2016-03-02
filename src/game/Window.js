var dialog = require('dialog');
var robot = require('robotjs');
var DEBUG_MODE = require('./Enums').DEBUG_MODE;
var gui = window.require('nw.gui');

var w = robot.getScreenSize().width;
var h = robot.getScreenSize().height;
var resolution = w + 'x' + h;
var aspect = w / h;

var ABORTING_APPLICATION = false;

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

function SupportedResolution(width, height) {
	this.w = width;
	this.h = height;
}

SupportedResolution.prototype.toString = function () {
	return this.w + "x" + this.h;
};

var SUPPORTED_RESOLUTIONS = [
	new SupportedResolution(1920, 1080),
	new SupportedResolution(1600, 900),
	new SupportedResolution(1366, 768),
	new SupportedResolution(1360, 768)
];

if (!DEBUG_MODE) {
	var unsupportedResolution = true;

	for (var i = 0; i < SUPPORTED_RESOLUTIONS.length && unsupportedResolution; i++) {
		var res = SUPPORTED_RESOLUTIONS[i];
		if (w === res.w && h === res.h) {
			unsupportedResolution = false;
		}
	}

	if (unsupportedResolution) {
		quit('Unsupported screen resolution. Supported screen resolutions are ' + SUPPORTED_RESOLUTIONS.toString());
	}
}

module.exports = {
	quit: quit,
	quitIf: quitIf,
	width: w,
	height: h,
	resolution: resolution,
	aspect: aspect
};