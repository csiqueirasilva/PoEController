/* global self */

var fs = require('fs');
var robot = require("robotjs");

function PersistSignatureToFile(filename, data) {
	fs.writeFile("signatures/" + (filename || "signatures.json"), JSON.stringify(data), function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("Persisted signature file to disk.");
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

self.onmessage = function(event) {
	var cmd = event.data.cmd;
	var data = event.data.data;

	switch(cmd) {
	
		case 'set-subsigs':

			LastDetectedSubSig = null;
			TRANSIENT_SIGNATURES = data;
			break;
			
		case 'detect-sub':

			if(TRANSIENT_SIGNATURES !== null) {
				var ret = DetectPixelSignature(TRANSIENT_SIGNATURES);
				if(ret !== LastDetectedSubSig) {
					LastDetectedSubSig = ret;
					if(ret !== null) {
						self.postMessage({cmd: 'detect-sub', data: ret.gameMode});
						console.log(ret.name);
					} else {
						self.postMessage({cmd: 'detect-sub', data: null});
						console.log('Sub-signature not detected. Going into default mode.');
					}
				}
			}
			break;
			
		case 'clear-lastsig':
			LastDetectedSig = null;
			break;
			
		case 'detect':
		
			if(!data.isBlockedGameMode) {
				var ret = DetectPixelSignature(PIXEL_SIGNATURES);
				if(ret !== LastDetectedSig) {
					LastDetectedSig = ret;
					if(ret !== null) {
						IsDefaultMode = false;
						self.postMessage({cmd: 'detect', data: ret.gameMode});
						console.log(ret.name);
					}
				} else if (!IsDefaultMode && LastDetectedSig === null) {
					IsDefaultMode = true;
					self.postMessage({cmd: 'detect', data: DEFAULT_GAME_MODE});
					console.log('Signature not detected. Going into default game mode.');
				}
			}

			break;

		case 'persist':
			PersistSignatureToFile(data.filename, data.sigs);
			break;
			
		case 'init':
			DEFAULT_GAME_MODE = data.defaultGameMode;
			self.postMessage({cmd: 'init'});
			break;
		case 'load-signatures-file':
			PIXEL_SIGNATURES = data;
	}

};