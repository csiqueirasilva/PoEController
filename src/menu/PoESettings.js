/* global module */

const UserSettings = require('./UserSettings');

let Width = 0;
let Height = 0;

module.exports = (function() {

	var defaultActionKeysSettings = `[ACTION_KEYS]
attack_in_place=16
chat=13
close_panels=32
detonate_mines=68
enable_corpse_targeting=65
enable_key_pickup=70
highlight=18
highlight_toggle=90
open_challenges_panel=72
open_character_panel=67
open_events_panel=66
open_inventory_panel=73
open_ladder_panel=76
open_map=9
open_microtransaction_panel=77
open_options=79
open_passive_skills_panel=80
open_social_panel=83
open_world_panel=85
performance_overlay=112
take_screenshot=119
use_bound_skill1=1
use_bound_skill2=4
use_bound_skill3=2
use_bound_skill4=81
use_bound_skill5=87
use_bound_skill6=69
use_bound_skill7=82
use_bound_skill8=84
use_flask_in_slot1=49
use_flask_in_slot2=50
use_flask_in_slot3=51
use_flask_in_slot4=52
use_flask_in_slot5=53
weapon_swap=88
zoom_in=33
zoom_out=34
`;

	var defaultKeyPickup = `
key_pickup=2`;
	var defaultCorpseTargeting = `
corpse_targeting=key`;
	
	var videoSettings = `borderless_windowed_fullscreen=true
fullscreen=false
post_processing=true
resolution_height=%h
resolution_width=%w
screen_shake=false`;

	var fs = require('fs');
	var app = require('electron').app;
	
	if(app === undefined) {
		app = require('electron').remote.app;
	}

	var lastFilePath = UserSettings.Settings.gameConfigPath.replace(/%([^%]+)%/g, (_,n) => process.env[n]);
	
	var originalConfigFileContents = null;
	var originalActionKeys = null;
	var originalKeyPickup = null;
	var originalCorpseTargeting = null;
	var originalVideoSettings = null;
	
	function rewriteConfigFile() {
		console.log('reading config file ' + lastFilePath);
		var data = fs.readFileSync(lastFilePath, 'utf8');
		
		originalConfigFileContents = data;
		
		// match actions keys and replace
		var match = data.match(/(\[ACTION_KEYS\]){1}(\n|.)*?(?=\[)/);
		
		if(match !== null) {
			originalActionKeys = match[0];
		}
		
		var finalContent = data.replace(originalActionKeys, defaultActionKeysSettings);
		
		// match key_pickup
		match = finalContent.match(/\nkey_pickup=.*/);

		if(match !== null) {
			originalKeyPickup = match[0];
		}
		
		finalContent = finalContent.replace(originalKeyPickup, defaultKeyPickup);
		
		match = finalContent.match(/\ncorpse_targeting=.*/);

		if(match !== null) {
			originalCorpseTargeting = match[0];
		}
		
		finalContent = finalContent.replace(originalCorpseTargeting, defaultCorpseTargeting);
		
		match = finalContent.match(/borderless_windowed_fullscreen[\na-z=_0-9]*screen_shake=.*/);
		
		if(match !== null) {
			originalVideoSettings = match[0];
		}
		
		videoSettings = videoSettings.replace("%w", Width).replace("%h", Height);
		
		finalContent = finalContent.replace(originalVideoSettings, videoSettings);
		
		fs.writeFileSync(lastFilePath, finalContent);
	}

	function restoreConfigFile() {
		if(lastFilePath !== null) {
			console.log('restoring game config file ' + lastFilePath);
			fs.writeFileSync(lastFilePath, originalConfigFileContents);
		} else {
			console.log('no lastFilePath to restore game config file');
		}
	}
	
	return {
		rewriteConfigFile: rewriteConfigFile,
		restoreConfigFile: restoreConfigFile,
		setScreenSize: function(w, h) {
			Width = w;
			Height = h;
		}
	};
	
})();