'use strict';

let kci = 0;

$('document').ready(function() {
	let date = new Date();
	if (date.getMonth() == 3 && date.getDate() == 1) {
		$('#logo').attr('src', 'res/lamb.png');
	}
	
	$('body').on('keydown', function(e) {
		if (kci == 9 && (e.key == 'a' || e.key == 'A')) {
			toast('video games,', 5000);
			kci = 0;
		} else if (((kci == 0 || kci == 1) && e.key == 'ArrowUp') || ((kci == 2 || kci == 3) && e.key == 'ArrowDown') || ((kci == 4 || kci == 6) && e.key == 'ArrowLeft') || ((kci == 5 || kci == 7) && e.key == 'ArrowRight') || (kci == 8 && (e.key == 'b' || e.key == 'B'))) {
			kci++;
		} else {
			kci = 0;
		}
	});
	$('body').on('click', function(e) {kci = 0;});
});