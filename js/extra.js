'use strict';

let inputHistory = [];

$('document').ready(function() {
	let date = new Date();
	if (date.getMonth() == 3 && date.getDate() == 1) {
		$('#logo').attr('src', 'res/lamb.png');
	}
	
	$('body').on('keydown', function(e) {
		inputHistory.push(e.key.toLowerCase());
		if (inputHistory.length > 10) {inputHistory.splice(0, 1);}
		if (compareArrays(inputHistory, ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'])) {toast('video games,', 5000);}
	});
	$('body').on('click', function(e) {
		inputHistory.push('click');
		if (inputHistory.length > 10) {inputHistory.splice(0, 1);}
	});
});

function compareArrays(a, b) { // of primatives that is
	if (a.length != b.length) {return false;}
	for (let i = 0; i < a.length; i++) {
		if (a[i] != b[i]) {return false;}
	}
	return true;
}