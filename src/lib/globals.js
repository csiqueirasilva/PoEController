const webFrame = require('electron').webFrame;
const ipcRenderer = require('electron').ipcRenderer;
const Window = require('./game/Window');
const GAME_MODE = require('./game/Enums').GAME_MODE;
const KEYS = require('./game/Enums').KEYS;

let app = require('electron').remote.app;
let win = require('electron').remote.getCurrentWindow();
const { BrowserWindow } = require('electron').remote;

var UserSettings = require('./menu/UserSettings');
var PoESettings = require('./menu/PoESettings');

let global = {};

let debug = UserSettings.Settings.debug;

if(debug) {
	win.webContents.openDevTools({ mode: 'detach' });
}

ipcRenderer.on('display-window-title', (ev, title) => {
	global.findWindowByTitle('menuWindow').hide();
	global.findWindowByTitle('hardwareConfig').hide();
	console.log(title);
	global.findWindowByTitle(title).show();
});

ipcRenderer.on('hardware-get-data', (ev, data) => {
	$('#hardware-dump-area').html(data.slice(0, 16).toString());
});

ipcRenderer.on('hardware-get-list', (ev, data) => {
	$('#hardware-config-list select').empty();
	
	var options = [];
	var listByVidPid = {};
	
	for(var key in data) {
		var elem = data[key];
		if(listByVidPid[elem.vendorId] === undefined) {
			listByVidPid[elem.vendorId] = {};
		}
		listByVidPid[elem.vendorId][elem.productId] = elem;
	}
	
	for(var vid in listByVidPid) {
		var group = document.createElement('optgroup');
		for(var pid in listByVidPid[vid]) {
			var elem = listByVidPid[vid][pid];
			group.label = elem.manufacturer;
			var o = document.createElement('option');
			o.innerHTML = elem.product;
			o.value = vid + "-" + pid;
			group.appendChild(o);
		}
		options.push(group);
	}
	
	$('#hardware-config-list select').append(options);
});

ipcRenderer.on('app-reload-config', () => {
	UserSettings.Load();
});

ipcRenderer.on('window-screen-size', (ev, data) => {
	PoESettings.setScreenSize(data.width, data.height);
});

ipcRenderer.send('window-request-screensize', true);

global.findWindowByTitle = function(title) {
	return Window.findWindowByTitle(title);
};