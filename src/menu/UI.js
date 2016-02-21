var xboxImg = document.getElementById('xbox-img');
var ps3Img = document.getElementById('ps3-img');

function drawControllerReferenceCanvas(op) {
	var canvas = document.getElementById('reference-img');
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	var ctx = canvas.getContext('2d');
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	var bgImg = op === 'xbox' ? xboxImg : ps3Img;
	
	ctx.drawImage(bgImg, canvas.width * 0.2, canvas.height * 0.1, canvas.width * 0.6, canvas.height * 0.6);
}

$('#select-input-method').change(function() {
	drawControllerReferenceCanvas($(this).val());
});

$('#select-input-method').change();

$(window).on('resize', function() {
	$('#select-input-method').change();
});