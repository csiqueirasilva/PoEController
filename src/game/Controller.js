/*

Indexes
1  - X Axis - Left Thumbstick
3  - Y Axis - Left Thumbstick

5 - X Axis - Right Thumbstick
7 - Y Axis - Right Thumbstick

8 & 9 - Triggers
	= 00 (8) & 128 (9) Neutral
	< 128 (9) Right Trigger
	> 128 (9) Left Trigger
	= 00 (9) & 128 (8) RT + LT
	
10 - Keys

	Values
	1   - X
	2   - Circle
	4   - Square	
	8   - Triangle
	16  - L1
	32  - R1
	64  - Select
	128 - Start
	
11 - POV Hat, L3 and R3
	
	Calculation: (INPUT % 4) = L3 and R3 values
				 INT(INPUT / 4) * 4 = POV Hat switch
	
	Values
	
	1 	- L3
	2	- R3
	3	- L3 + R3
	
	POV Hat
	4	- Up
	8	- Up + Right
	12 	- Right
	16 	- Down + Right
	20	- Down
	24	- Down + Left
	28 	- Left
	32	- Up + Left
	
*/
var Window = require('./Window');

var UserSettings = require('../menu/UserSettings').Settings;

var HID = require ('node-hid');

// Searches for Xbox 360 Controller, Xbox 360 Wifi Controller, Xbox One Controller and Xbox 360 Wireless Receiver
// http://www.linux-usb.org/usb.ids
var VID = UserSettings.vid;//0x45E; // Microsoft
var PID = UserSettings.pid;//[0x28E, 0x28F, 0x2D1, 0x719, 0x2A1];

var HIDController = null;
var controllerFound = false;
var intervalDataRead = null;

function addDataListener(cb) {
	var readData = null;

	if(HIDController !== null && intervalDataRead === null) {
		intervalDataRead = setInterval(() => {
			readData = HIDController.readSync();
			cb(readData);
			console.log(readData, 'interval read');
		}, 5);
	}
}

function removeDataListener() {
	if(HIDController !== null && intervalDataRead !== null) {
		clearInterval(intervalDataRead);
		intervalDataRead = null;
	}
}

function load() {
	
	var ret = false;
	
	var devices = HID.devices();

	try {
		HIDController = new HID.HID(VID, PID);
	} catch (e) {
	}
	
	if(HIDController !== null) {
		
		controllerFound = true;
		HIDController.addListener('error', function () {
			Window.quit('[CONTROLLER DISCONNECTED] Error while reading information from the controller. Please ensure it is correctly connected and run PoEController again.');
		});
		Window.send('menuWindow', 'display-window-title', 'menuWindow');
		ret = {};
		ret.vid = VID;
		ret.pid = PID;
		
	} else {
		Window.send('hardwareConfig', 'display-window-title', 'hardwareConfig');
		Window.send('hardwareConfig', 'hardware-get-list', devices);
		Window.alert("[CONTROLLER NOT FOUND] Error while connecting to controller. Please select your device and check if it is connected and configured.");
	}
	
	return ret;
}

function unload() {
	if(HIDController !== null) {
		HIDController.close();
		HIDController = null;
	}
}

var electron = require('electron');
electron.ipcMain.on('hardware-connect-device', (ev, vid, pid, title) => {
	if(HIDController !== null) {
		HIDController.close();
	}
	
	try {
		HIDController = new HID.HID(vid, pid);
		addDataListener((d) => {
			Window.send(title, 'hardware-get-data', d);
		});
	} catch (e) {
		HIDController = null;
		Window.alert('Could not connect to selected device:' + e.message);
	}
});

module.exports = {
	load: load,
	found: () => controllerFound,
	addDataListener: addDataListener,
	removeDataListener: removeDataListener,
	unload: unload
};