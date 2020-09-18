$(document).ready(function() {
	$('#close-btn').click(function () {
		ipcRenderer.send('app_quit');
	});
	
	$('#link-readme').click(function () {
		ipcRenderer.send('window-open-readme', true);
	});
	
	if($('select').select2 instanceof Function) {
		$('select').select2();
	}
});

global.hideAllHelp = function () {
	$('#msg-overlay').children().hide();
};
