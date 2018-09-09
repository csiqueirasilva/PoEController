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

var Logger = require('./Logger');

var HID = require ('node-hid');

// Searches for Xbox 360 Controller, Xbox 360 Wifi Controller, Xbox One Controller and Xbox 360 Wireless Receiver
// http://www.linux-usb.org/usb.ids
var VID = 0x45E; // Microsoft
var PID = [0x28E, 0x28F, 0x2D1, 0x0719]; 

var HIDController = null;
var controllerFound = false;

var dialog = require('dialog');

for(var i = 0; i < PID.length && HIDController === null; i++) {
	try {
		HIDController = new HID.HID(VID, PID[i]);
	} catch (e) {
		dialog.warn("hidcontroller: " + e, function(){});
		Logger.warn(e);
	}
}

function addDataListener(cb) {
	if(HIDController !== null) {
		HIDController.addListener('data', cb);
	}
}

function removeDataListener(cb) {
	if(HIDController !== null) {
		HIDController.removeListener('data', cb);
	}
}

if(HIDController !== null) {
	controllerFound = true;
	HIDController.addListener('error', function () {
		Window.quit('[CONTROLLER DISCONNECTED] Error while reading information from the controller. Please ensure it is correctly connected and run PoEController again.');
	});
} else {
	Window.quit("[CONTROLLER NOT FOUND] Error while connecting to xbox 360/one controller driver. Please ensure it is correctly connected and configured.");	
}

module.exports = {
	found: controllerFound,
	addDataListener: addDataListener,
	removeDataListener: removeDataListener
};