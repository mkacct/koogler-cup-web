'use strict';

const isAndroid = navigator.userAgent.toLowerCase().indexOf('android') > -1;
const mqStandalone = window.matchMedia('(display-mode: standalone)');

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('serviceWorker.js');
	});
}

$(document).ready(function() {
	// tell desktop from mobile for hover
	watchForHover();
	// never keep buttons focused
	$('button').on('click', function(e) {
		$(this).blur();
	});
	// three ways to close a modal
	$('#modalShade').on('click', function(e) {
		if ($(e.target).is($(this))) {closeModal();}
	});
	$('.modalClose').on('click', function(e) {
		closeModal();
	});
	$(document).on('keydown', function(e) {
		if (e.which == 27) {closeModal();}
	});
	// close toast on click
	$('body').on('click', '.toast', function(e) {
		$(this).remove();
	});
});

function openModal(selector, callback) {
	if ($('.modal:visible').length > 0) {
		closeModal(function() {openModalInternal(selector, callback)}, true);
	} else {
		openModalInternal(selector, callback)
	}
}

function openModalInternal(selector, callback) {
	$('#modalShade').fadeIn(uiAnimTime);
	$(selector).css('opacity', 0).slideDown(uiAnimTime).animate({opacity: 1}, {
		queue: false,
		duration: uiAnimTime
	});
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function closeModal(callback, noUndim) {
	if (!noUndim) {$('#modalShade:visible').fadeOut(uiAnimTime);}
	$('.modal:visible').slideUp(uiAnimTime).animate({opacity: 0}, {
		queue: false,
		duration: uiAnimTime
	});
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function toast(message, toastTime) {
	if ($('.toast').length > 0) {
		$('.toast').remove();
	}
	let popup = $('<div></div>').text(message).addClass('toast');
	$('body').append(popup);
	popup.fadeIn(animTime, function() {
		setTimeout(function() {
			popup.fadeOut(animTime, function() {
				popup.remove();
			});
		}, toastTime);
	});
}

/*
// if currentVer > storedVer
function isNewerVer(currentVer, storedVer) {
	let currentArr = splitVer(currentVer);
	let storedArr = splitVer(storedVer);
	for (let i in currentArr) {
		let storedNum = 0;
		if (typeof storedArr[i] == 'number') {storedNum = storedArr[i];} 
		if (currentArr[i] > storedNum) {
			return true;
		} else if (currentArr[i] < storedNum) {
			return false;
		}
	}
	return false;
}

// split by . and cast to number
function splitVer(ver) {
	let verArr = ver.split('.');
	verArr.forEach(function(str, i) {
		verArr[i] = Number(str);
	});
	return verArr;
}
*/

// local storage

function lsGet(key, fallback) {
	let item = localStorage.getItem('kcs-' + key);
	if (typeof item == 'string') {
		return item;
	} else {
		return fallback.toString();
	}
}

function lsSet(key, value) {
	localStorage.setItem('kcs-' + key, value.toString());
}