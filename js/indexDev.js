'use strict';

var devClickCount = 0;

$(document).ready(function() {
	$('#devStandalone').text(mqStandalone.matches);
	$('#devUA').text(navigator.userAgent);
	
	$('body').on('click', function(e) {
		if ($(e.target).is($('#cred'))) {
			devClickCount++;
			if (devClickCount >= 4) {
				devClickCount = 0;
				if (window.confirm('Open developer menu?')) {openModal('#devModal');}
			}
		} else {
			devClickCount = 0;
		}
	});
	$('#nonstandardUsageButton').on('click', function(e) {
		if (asBoolean(lsGet('nonstandardUsage', 'false'))) {
			lsSet('nonstandardUsage', 'false');
			toast('Nonstandard usage unmarked', 1000);
		} else {
			lsSet('nonstandardUsage', 'true');
			toast('Nonstandard usage marked', 1000);
		}
	});
});