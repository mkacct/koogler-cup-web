'use strict';

$(document).ready(function() {
	// tell desktop from mobile for hover
	watchForHover();
	// never keep buttons focused
	$('body').on('click', 'button', function(e) {
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
		if (e.key == 'Escape') {closeModal();}
	});
	// close toast on click
	$('body').on('click', '.toast', function(e) {
		$(this).remove();
	});
	// use expand links
	$('body').on('click', '.expandLink', function(e) {
		let hidden = $(this).parents($(this).attr('data-container-selector')).find('.hidden');
		if (hidden.is(':visible')) {
			hidden.slideUp(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-down"></i>' + $(this).attr('data-default-text'));
		} else {
			hidden.slideDown(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-up"></i>' + $(this).attr('data-shown-text'));
		}
	});
});

function openModal(selector, callback) {
	// close any expandables in modal
	$(selector).find('.expandLink').each(function() {
		$(this).html('<i class="fas fa-chevron-down"></i> ' + $(this).attr('data-default-text'));
	});
	$(selector).find('.hidden').hide();
	
	if ($('.modal:visible').length > 0) {
		closeModal(function() {openModalInternal(selector, callback)}, true);
	} else {
		openModalInternal(selector, callback)
	}
}

function openModalInternal(selector, callback) {
	$('#modalShade').fadeIn(uiAnimTime);
	if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		$(selector).css('opacity', 0).slideDown(uiAnimTime).animate({opacity: 1}, {queue: false, duration: uiAnimTime});
	} else {
		$(selector).css('opacity', 0).show().animate({opacity: 1}, {queue: false, duration: uiAnimTime});
	}
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function closeModal(callback, noUndim) {
	if (!noUndim) {$('#modalShade:visible').fadeOut(uiAnimTime);}
	if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		$('.modal:visible').slideUp(uiAnimTime).animate({opacity: 0}, {queue: false, duration: uiAnimTime});
	} else {
		$('.modal:visible').animate({opacity: 0}, {queue: false, duration: uiAnimTime});
		setTimeout(function() {$('.modal:visible').hide()}, uiAnimTime);
	}
	if (typeof callback == 'function') {setTimeout(callback, uiAnimTime);}
}

function toast(message, toastTime) {
	if ($('.toast').length > 0) {
		$('.toast').remove();
	}
	let popup = $('<div></div>').html(message).addClass('toast');
	$('body').append(popup);
	popup.fadeIn(animTime, function() {
		setTimeout(function() {
			popup.fadeOut(animTime, function() {
				popup.remove();
			});
		}, toastTime);
	});
}

function generateExpandLink(defaultText, shownText, containerSelector) {
	return $('<a href="javascript:void(0);"></a>').html('<i class="fas fa-chevron-down"></i>' + defaultText).addClass('expandLink').attr('data-container-selector', containerSelector).attr('data-default-text', defaultText).attr('data-shown-text', shownText);
}

// local storage

function lsGet(key, fallback) {
	if (window.localStorage) {
		let item = localStorage.getItem(lsAppId + '_' + key);
		if (typeof item == 'string') {
			return item;
		} else {
			return fallback.toString();
		}
	} else {
		console.log('lsGet failed because localStorage is not available');
		return fallback.toString();
	}
}

function lsSet(key, value) {
	if (window.localStorage) {
		localStorage.setItem(lsAppId + '_' + key, value.toString());
	} else {
		console.log('lsSet failed because localStorage is not available');
	}
}

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

function randomInt(min, max) {return Math.floor(Math.random() * (max - min + 1)) + min;}

function asBoolean(string) {return string.toLowerCase() == 'true';}