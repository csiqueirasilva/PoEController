/* global menuWindow */

(function() {

	var EXPORTED_INPUT_MODES = require('../game/Behaviors').exported;

	var xboxImg = document.getElementById('xbox-img');
	var ps3Img = document.getElementById('ps3-img');

	var menuCanvas = document.getElementById('reference-img');
	var ctx = menuCanvas.getContext('2d');

	var LABEL_IDS = {
		DPAD_UP: 'button-dpad-up',
		DPAD_LEFT: 'button-dpad-left',
		DPAD_RIGHT: 'button-dpad-right',
		DPAD_DOWN: 'button-dpad-down',
		SHOULDER_LEFT: 'button-shoulder-left',
		SHOULDER_RIGHT: 'button-shoulder-right',
		KEY_UP: 'button-key-up',
		KEY_LEFT: 'button-key-left',
		KEY_RIGHT: 'button-key-right',
		KEY_DOWN: 'button-key-down',
		KEY_L3: 'button-key-l3',
		CHAR_MOVEMENT: 'label-char-movement',
		LOOT_POSITION: 'label-loot-position',
		KEY_ESCAPE: 'label-escape',
		MOUSE_CLICK: 'label-mouse-click',
		MOUSE_CURSOR: 'label-mouse-cursor',
		OPEN_MENU: 'label-open-menu'
	
	};
	
	var MenuInputCoordinates = {};
	
	MenuInputCoordinates['xbox'] = {};
	
	MenuInputCoordinates['xbox'].Img = xboxImg;

	MenuInputCoordinates['xbox'].KEY_L3 = [0.3275, 0.425];
	MenuInputCoordinates['xbox'].MOUSE_CURSOR = [0.577, 0.55];
	MenuInputCoordinates['xbox'].CHAR_MOVEMENT = [0.3275, 0.425];
	MenuInputCoordinates['xbox'].MOUSE_CLICK = [0.65, 0.18];
	MenuInputCoordinates['xbox'].LOOT_POSITION = [0.44, 0.4];
	MenuInputCoordinates['xbox'].OPEN_MENU = [0.56, 0.4];
	MenuInputCoordinates['xbox'].KEY_ESCAPE = [0.35, 0.18];

	MenuInputCoordinates['xbox'].DPAD_UP = [0.415, 0.49];
	MenuInputCoordinates['xbox'].DPAD_LEFT = [0.39, 0.5325];
	MenuInputCoordinates['xbox'].DPAD_RIGHT = [0.44, 0.5325];
	MenuInputCoordinates['xbox'].DPAD_DOWN = [0.415, 0.565];
	
	MenuInputCoordinates['xbox'].SHOULDER_LEFT = [0.35, 0.24];
	MenuInputCoordinates['xbox'].SHOULDER_RIGHT = [0.65, 0.24];
	
	MenuInputCoordinates['xbox'].KEY_UP = [0.668, 0.35];
	MenuInputCoordinates['xbox'].KEY_LEFT = [0.62, 0.4];
	MenuInputCoordinates['xbox'].KEY_RIGHT = [0.71, 0.4];
	MenuInputCoordinates['xbox'].KEY_DOWN = [0.662, 0.45];
	
	MenuInputCoordinates['ps3'] = {};
	MenuInputCoordinates['ps3'].Img = ps3Img;
	
	MenuInputCoordinates['ps3'].KEY_L3 = [0.405, 0.63];
	MenuInputCoordinates['ps3'].MOUSE_CURSOR = [0.605, 0.615];
	MenuInputCoordinates['ps3'].CHAR_MOVEMENT = [0.405, 0.63];
	MenuInputCoordinates['ps3'].MOUSE_CLICK = [0.72, 0.12];
	MenuInputCoordinates['ps3'].LOOT_POSITION = [0.445, 0.445];
	MenuInputCoordinates['ps3'].OPEN_MENU = [0.56, 0.445];
	MenuInputCoordinates['ps3'].KEY_ESCAPE = [0.33, 0.12];

	MenuInputCoordinates['ps3'].DPAD_UP = [0.3075, 0.38];
	MenuInputCoordinates['ps3'].DPAD_LEFT = [0.27, 0.44];
	MenuInputCoordinates['ps3'].DPAD_RIGHT = [0.345, 0.44];
	MenuInputCoordinates['ps3'].DPAD_DOWN = [0.3075, 0.5];
	
	MenuInputCoordinates['ps3'].SHOULDER_LEFT = [0.3075, 0.165];
	MenuInputCoordinates['ps3'].SHOULDER_RIGHT = [0.6975, 0.165];
	
	MenuInputCoordinates['ps3'].KEY_UP = [0.6975, 0.38];
	MenuInputCoordinates['ps3'].KEY_LEFT = [0.645, 0.44];
	MenuInputCoordinates['ps3'].KEY_RIGHT = [0.75, 0.44];
	MenuInputCoordinates['ps3'].KEY_DOWN = [0.6975, 0.5];
	
	function drawControllerReferencemenuCanvas(op) {
		
		menuCanvas.width = menuWindow.window.innerWidth;
		menuCanvas.height = menuWindow.window.innerHeight;
		
		ctx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		
		ctx.drawImage(MenuInputCoordinates[op].Img, menuCanvas.width * 0.2, menuCanvas.height * 0.1, menuCanvas.width * 0.6, menuCanvas.height * 0.6);

		for(var key in LABEL_IDS) {
			drawInputLine(MenuInputCoordinates[op][key], LABEL_IDS[key]);
		}
		
	}

	function drawInputLine(coords, elementId) {
	
		var iX = coords[0] * menuCanvas.width;
		var iY = coords[1] * menuCanvas.height;
		
		var domCoords = getElementCenterPosition(elementId);
		
		var eX = domCoords.x;
		var eY = domCoords.y;
		
		ctx.strokeStyle = '#000000';
		
		ctx.beginPath();
			ctx.moveTo(iX, iY);
			ctx.lineTo(eX, eY);
		ctx.stroke();
	}

	$('#select-input-method').change(function() {
		drawControllerReferencemenuCanvas($(this).val());
	});

	$(window).on('resize', function() {
		$('#select-input-method').change();
	});

	function getElementCenterPosition (elementId) {
		var e = document.getElementById(elementId);
		var x = e.offsetLeft + e.offsetWidth / 2;
		var y = e.offsetTop + e.offsetHeight / 2;
		return {x:x, y:y};
	}
	
	var options = [];
	
	for(var key in EXPORTED_INPUT_MODES) {
		var arr = EXPORTED_INPUT_MODES[key];
		var group = document.createElement('optgroup');
		group.label = key;
		for(var i = 0; i < arr.length; i++) {
			var o = document.createElement('option');
			var v = arr[i];
			o.innerHTML = v.name;
			o.title = v.help;
			o.value = v.key;
			group.appendChild(o);
		}
		options.push(group);
	}
	
	$('.button-input-type').append(options);
	
})();