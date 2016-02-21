(function() {

	var xboxImg = document.getElementById('xbox-img');
	var ps3Img = document.getElementById('ps3-img');

	var menuCanvas = document.getElementById('reference-img');
	var ctx = menuCanvas.getContext('2d');

	function drawControllerReferencemenuCanvas(op) {
		
		menuCanvas.width = window.innerWidth;
		menuCanvas.height = window.innerHeight;
		
		ctx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
		
		var bgImg = op === 'xbox' ? xboxImg : ps3Img;
		
		ctx.drawImage(bgImg, menuCanvas.width * 0.2, menuCanvas.height * 0.1, menuCanvas.width * 0.6, menuCanvas.height * 0.6);
		
		if(op === 'xbox') {
			// mouse cursor
			drawInputLine(0.577, 0.55, 0.577, 0.62, 'MOUSE CURSOR');
		} else /* PS3 */ {
		}
		
	}

	function drawInputLine(iniX, iniY, endX, endY, txt) {
	
		var iX = iniX * window.innerWidth;
		var iY = iniY * window.innerHeight;
		var eX = endX * window.innerWidth;
		var eY = endY * window.innerHeight;
		
		ctx.beginPath();
			ctx.moveTo(iX, iY);
			ctx.lineTo(eX, eY);
		ctx.stroke();
		
		if(txt !== undefined) {
			ctx.textBaseline="hanging"; 
			var textSize = window.innerHeight / 22;
			ctx.font = 'bold ' + textSize + 'px Verdana';
			var halfTxtWidth = ctx.measureText(txt).width / 2;
			ctx.fillStyle = '#000000';
			ctx.fillText(txt, eX - halfTxtWidth, eY);
			ctx.lineWidth = textSize * 0.05;
			ctx.strokeStyle = '#FFFFFF';
			ctx.strokeText(txt, eX - halfTxtWidth, eY);
		}
	}

	$('#select-input-method').change(function() {
		drawControllerReferencemenuCanvas($(this).val());
	});

	$(window).on('resize', function() {
		$('#select-input-method').change();
	});

})();