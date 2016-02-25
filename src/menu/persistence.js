var Persistence = (function() {

	var fs = require('fs');

	function setInputData(data) {
		if(data instanceof Object) {
			$('#select-input-method').val(data.input).change();
			$('#button-key-up select').val(data.q).change();
			$('#button-shoulder-left select').val(data.w).change();
			$('#button-key-left select').val(data.e).change();
			$('#button-shoulder-right select').val(data.r).change();
			$('#button-key-right select').val(data.right).change();
			$('#button-key-down select').val(data.middle).change();
		}
	}
	
	function getInputData() {
		var inputMethod = $('#select-input-method').val();
		var qBehavior = $('#button-key-up select').val();
		var wBehavior = $('#button-shoulder-left select').val();
		var eBehavior = $('#button-key-left select').val();
		var rBehavior = $('#button-shoulder-right select').val();
		var rightBehavior = $('#button-key-right select').val();
		var middleBehavior = $('#button-key-down select').val();
		
		return {
			input: inputMethod,
			q: qBehavior,
			w: wBehavior,
			e: eBehavior,
			r: rBehavior,
			right: rightBehavior,
			middle: middleBehavior
		};
	}
	
	function persistUserSettings (cb) {
		
		var data = getInputData();
		
		console.log('persisting user settings:');
		console.log(data);
		
		fs.writeFile("user-settings.json", JSON.stringify(data), function(err) {
		
			if(err) {
				return console.log(err);
			}

			console.log("Persisted user settings file to disk.");
			
			if(cb instanceof Function) {
				cb();
			}
		}); 
	}
	
	function loadUserSettings(cb) {
		fs.readFile("user-settings.json", 'utf8', function(err, data) {
		
			if(err) {
				persistUserSettings();
				return console.log(err);
			} else {
				var settings = JSON.parse(data);
				
				console.log('loaded user settings:');
				console.log(settings);
				
				setInputData(settings);
				
				console.log("Read user settings file from disk.");
			}
			
			if(cb instanceof Function) {
				cb();
			}
		});	
	}
	
	return {
		Save: persistUserSettings,
		Load: loadUserSettings
	};
	
})();