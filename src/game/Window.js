var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var ipc = null;
var robot = null;

var app = null;

var w = null;
var h = null;

var resolution = null;
var aspect = null;

var basePosition = null;

if(BrowserWindow === undefined) {
	BrowserWindow = electron.remote.BrowserWindow;
	ipc = electron.ipcRenderer;
	app = electron.remote.app;
} else {
	ipc = electron.ipcMain;
	robot = require('robotjs');
	w = robot.getScreenSize().width;
	h = robot.getScreenSize().height;
	resolution = w + 'x' + h;
	aspect = w / h;
	basePosition = {
		x: w / 2,
		y: h * 0.44
	};
	app = electron.app;
}

var dialog = require('dialog');

var DEBUG_MODE = require('./Enums').DEBUG_MODE;

function showAllDevTools() {
	let windows = BrowserWindow.getAllWindows();
	windows.forEach((wind) => {
		wind.webContents.openDevTools({ mode: 'detach' });
	});
}

function hideAllGUIWindows() {
	let windows = BrowserWindow.getAllWindows();
	windows.forEach((wind) => {
		wind.hide();
	});
}

function quitIf(test, msg) {
	if (test) {
		quit(msg);
	}
}

function quit(msg) {
	hideAllGUIWindows();
	if(DEBUG_MODE) {
		console.log(msg);
	}
	dialog.warn(msg, function () {
		app.quit();
	});
}

function findWindowByTitle (title) {
	let ret = false;
	let windows = BrowserWindow.getAllWindows();
	for(let i = 0; i < windows.length && !ret; i++) {
		if(windows[i].getTitle() === title) {
			ret = windows[i];
		}
	}
	return ret;
}

module.exports = {
	basePosition: basePosition,
	quit: quit,
	quitIf: quitIf,
	width: w,
	height: h,
	resolution: resolution,
	aspect: aspect,
	showDevTools: showAllDevTools,
	getIpc: () => ipc,
	findWindowByTitle: findWindowByTitle,
	send: (title, event, ...args) => {
		var win = findWindowByTitle(title);
		if(win && !win.isDestroyed()) {
			win.webContents.send(event, ...args);
		}
	},
	alert: (msg) => dialog.warn(msg)
};