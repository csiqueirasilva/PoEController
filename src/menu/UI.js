(function() {

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
	
	function drawControllerReferencemenuCanvas(op) {
		
		menuCanvas.width = window.innerWidth;
		menuCanvas.height = window.innerHeight;
		
		ctx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		
		ctx.drawImage(MenuInputCoordinates[op].Img, menuCanvas.width * 0.2, menuCanvas.height * 0.1, menuCanvas.width * 0.6, menuCanvas.height * 0.6);

		for(var key in LABEL_IDS) {
			drawInputLine(MenuInputCoordinates[op][key], LABEL_IDS[key]);
		}
		
	}

	function drawInputLine(coords, elementId) {
	
		var iX = coords[0] * window.innerWidth;
		var iY = coords[1] * window.innerHeight;
		
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
	
})();