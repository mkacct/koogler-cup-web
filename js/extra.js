'use strict';

$('document').ready(function() {
	let date = new Date();
	if (date.getMonth() == 3 && date.getDate() == 1) {
		$('#logo').attr('src', 'res/lamb.png');
	}
});