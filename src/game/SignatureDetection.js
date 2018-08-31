module.exports = {};

var fs = require('fs');
var robot = require("robotjs");
var Logger = require('./Logger');
var Window = require('./Window');
var Mode = require('./Mode');
var Game = require('./Game');
var GAME_MODE = require('./Enums').GAME_MODE;

var DETECTION_INTERVAL_MS = 1400;

function PersistSignatureToFile(filename, data) {
	fs.writeFile("signatures/" + (filename || "signatures.json"), JSON.stringify(data), function(err) {
		if(err) {
			return console.log(err);
		}

		Logger.info("Persisted signature file to disk.");
	});
}

function DetectPixelSignature (SigCollection) {
	var sigDetected = false;
	var sig = null;
	
	for(var i = 0; i < SigCollection.length && !sigDetected; i++) {
		var testSig = SigCollection[i];
		var sigMatching = true;
		
		for(var j = 0; j < testSig.x.length && sigMatching; j++) {
			var c = testSig.x[j];
			var pixelAt = parseInt(robot.getPixelColor(c.x, testSig.y), 16);

			if(c.color !== pixelAt) {
				sigMatching = false;
			}
		}
		
		sigDetected = sigMatching;
	}
	
	if(sigDetected) {
		sig = SigCollection[i - 1];
	}
	
	return sig;
}

var LastDetectedSig = null;
var DEFAULT_GAME_MODE = null;
var LastDetectedSubSig = null;
var IsDefaultMode = true;

var TRANSIENT_SIGNATURES = null;
var PIXEL_SIGNATURES = [];

function Init (defaultGameMode) {
	DEFAULT_GAME_MODE = defaultGameMode;
}

function Detect() {
	var mode = null;
	if(!Mode.isBlocked()) {
		var ret = DetectPixelSignature(PIXEL_SIGNATURES);
		
		if(ret !== LastDetectedSig) {
			LastDetectedSig = ret;
			if(ret !== null) {
				Logger.info('setting: ' + ret.name);

				IsDefaultMode = false;
				mode = ret.gameMode;
			}
		} else if (!IsDefaultMode && LastDetectedSig === null) {
			IsDefaultMode = true;
			mode = DEFAULT_GAME_MODE;
			Logger.info('Signature not detected. Going into default game mode.');
		}
	}
	return mode;
}

function DetectSub () {
	var mode = null;
	if(TRANSIENT_SIGNATURES !== null) {
		var ret = DetectPixelSignature(TRANSIENT_SIGNATURES);
		if(ret !== LastDetectedSubSig) {
			LastDetectedSubSig = ret;
			if(ret !== null) {
				mode = ret.gameMode;
				Logger.info(ret.name);
			} else {
				mode = null;
				Logger.info('Sub-signature not detected. Going into default mode.');
			}
		}
	}
	return mode;
}

function ClearLastSig () {
	LastDetectedSig = null;
}

function SetSubsigs(mode) {
	LastDetectedSubSig = null;
	
	var sigs = null;
	
	if(mode === GAME_MODE.INVENTORY) {
		sigs = inventorySignatures;
	}
	
	if(sigs !== null) {
		Logger.info("setting subsigs");
	} else {
		Logger.info("didnt found subsigs");
	}
	
	TRANSIENT_SIGNATURES = sigs;
}

function LoadSignatures() {
	mainModesSignatures = ReadSignatureFile(Window.resolution  + "signatures.json");
	inventorySignatures = ReadSignatureFile(Window.resolution + "inventory-signatures.json");
	
	Logger.info('setting signatures');
	
	PIXEL_SIGNATURES = mainModesSignatures;
}

function SignatureNotFound(filename) {

	if (!DEBUG_MODE) {
		Window.quit('Signature file ' + filename + ' not found. Could not start the application.');
	} else {
		Logger.warn('Signature file ' + filename + ' not found.');
	}

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

var mainModesSignatures = null;
var inventorySignatures = null;

var SubSectionDetectionInterval = null;

function StopSubSigDetection() {
	SetSubsigs(null);
	clearInterval(SubSectionDetectionInterval);
	SubSectionDetectionInterval = null;
}

function StartSubSigDetection(extMode) {
	SetSubsigs(extMode);
	
	SubSectionDetectionInterval = setInterval(function () {
		var mode = DetectSub();
		if(mode !== null) {
			Mode.subSection(mode);
		}
	}, DETECTION_INTERVAL_MS);
	
}

var DetectPollingInterval = null;

function StartDetection() {
	
	Logger.info('start detecting');
	
	DetectPollingInterval = setInterval(function () {
		var detected = Detect();

		if(detected !== null) {
			Game.changeById(detected);
		}

	}, DETECTION_INTERVAL_MS);
}

function StopDetection () {
	Logger.info('stop detecting');

	clearInterval(DetectPollingInterval);
	DetectPollingInterval = null;
}

module.exports.loadSignatures = LoadSignatures;
module.exports.init = Init;
module.exports.persist = PersistSignatureToFile;

module.exports.stopSubSigDetection = StopSubSigDetection;
module.exports.startSubSigDetection = StartSubSigDetection;

module.exports.stopDetection = StopDetection;
module.exports.startDetection = StartDetection;

module.exports.clearLastSig = ClearLastSig;