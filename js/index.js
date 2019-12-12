'use strict';

var prevData = {type: 'none'};
var prevShowEls = false;
var updateTimeout;

// begin pwa install stuff

let installPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
	installPrompt = e;
	$('header .installButton').parent().show();
	$('#installDesc').show();
});

window.addEventListener('appinstalled', function(e) {hideInstallOption(true)});

function hideInstallOption(installed) {
	if ($('#installModal:visible')) {
		closeModal();
	}
	$('header .installButton').parent().hide();
	$('.installButton').hide(); // not very elegant???
	if (reason == 'dismissed') {
		$('#installDesc p').html('Please <a href="index.html">reload the page</a> to install the web app.');
	} else {
		$('#installDesc').hide();
	}
}

// end pwa install stuff

$(document).ready(function() {
	// place version number
	$('.versionNumber').text(version);
	
	// add events
	// android back button stuff
	if (mqStandalone.matches && isAndroid) {
		if (window.history.scrollRestoration) {window.history.scrollRestoration = 'manual';}
		
		// to do history stuff (for android back button)
		$(window).on('popstate', function(e) {
			window.history.pushState({}, '');
			if ($('.modal:visible').length > 0) {
				closeModal();
			} else {
				//openModal('#closeAppModal');
				toast('Unfortunately, you can\'t close the app this way.', 3000);
			}
		});
		window.history.pushState({}, '');
		
		/*
		$('#closeAppButton').on('click', function(e) {
			// somehow manage to close the app
		});
		*/
	}
	// to reload by button
	$('#updateButton').on('click', function(e) {
		clearTimeout(updateTimeout);
		update();
	});
	// to show the install prompt (pwa)
	$('.installButton').on('click', function(e) {
		installPrompt.prompt();
		hideInstallOption(false);
		installPrompt.userChoice.then(function(choice) {
			if (choice.outcome == 'accepted') {hideInstallOption(true);}
			installPrompt = null;
		});
	});
	// to open the menu modal
	$('#menuButton').on('click', function(e) {
		// be sure that it's showing normal content not credits
		$('#credits').hide();
		$('#creditsBackButton').hide();
		$('#notCredits').show();
		
		openModal('#menuModal');
	});
	// to show the update notes by button
	$('#updateNotesButton').on('click', function(e) {
		openModal('#updateNotesModal');
	});
	// to open the feedback page
	$('#feedbackButton').on('click', function(e) {
		window.open('https://docs.google.com/forms/d/e/1FAIpQLSc9bxC4iYVQVn-1QSceD_wdWn7YqwiLiN7-n3KNRvZ8pl8rxQ/viewform?usp=sf_link', '_blank');
	});
	// to show and hide the credits
	$('#creditsButton').on('click', function(e) {
		$('#notCredits').slideUp(uiAnimTime);
		$('#credits').slideDown(uiAnimTime);
		$('#creditsBackButton').fadeIn(uiAnimTime);
	});
	$('#creditsBackButton').on('click', function(e) {
		$(this).blur();
		$('#credits').slideUp(uiAnimTime);
		$('#notCredits').slideDown(uiAnimTime);
		$('#creditsBackButton').fadeOut(uiAnimTime);
	});
	// detect clicking expand button
	$('#events').on('click', '.expandLink', function(e) {
		let hiddenPlaces = $(this).parents('.event').find('.hiddenPlaces');
		if (hiddenPlaces.is(':visible')) {
			hiddenPlaces.slideUp(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-down"></i> Show all');
		} else {
			hiddenPlaces.slideDown(uiAnimTime);
			$(this).html('<i class="fas fa-chevron-up"></i> Collapse');
		}
	});
	
	// show update notes automatically
	let currentUNV = updateNotesVersion;
	let storedUNV = Number(lsGet('updateNotesVersion', 0));
	if (storedUNV > 0 && currentUNV > storedUNV) {
		openModal('#updateNotesModal');
	}
	lsSet('updateNotesVersion', updateNotesVersion);
	
	// start getting data
	$('#noContentDesc').html('Loading…');
	update();
});

function update() {
	setUpdateButton('updating');
	// get data from google sheets
	getData(function(data) { // success
		//console.dir(data);
		let updateType = getUpdateType(data);
		//console.log('update type: ' + updateType);
		if (updateType == 'disabled') { // display OFF
			updateVisuals({
				status: 'disabled',
				showEls: false
			});
		} else { // display ON
			if (updateType == 'correct') { // correction made, start over
				prevData = {type: 'corrected'};
			}
			let visuals = {
				status: 'live',
				showEls: true
			};
			// event heading
			if (data.events.length > 0) { // there are some events
				visuals.eventsHeadingText = 'Events';
				if (data.showCount) { // a count is to be shown
					if (data.eventTotal == data.events.length) {
						visuals.eventsHeadingText += ' (final)';
					} else if (data.eventTotal > data.events.length) {
						visuals.eventsHeadingText += ' (' + (data.eventTotal - data.events.length) + ' remain)';
					}
				}
			} else { // no events
				visuals.eventsHeadingText = 'No events yet';
				visuals.noEventsYet = true;
			}
			if (updateType != 'none') { // make changes
				// generate scoreboard
				let placedScores = placeScores(data.scores); // scores in order with places
				visuals.scoreboard = $('<table></table>'); // the scoreboard table
				let dp = maxDecimalPlaces(data.scores);
				for (let i = 0; i < 8; i++) { // a row for each house
					let row = $('<tr></tr>');
					row.append($('<td></td>').text(placedScores[i].place).addClass('placeCell'));
					row.append($('<td></td>').text(placedScores[i].house).addClass('houseCell'));
					row.append($('<td></td>').append(numberEl(placedScores[i].score, dp)).addClass('scoreCell'));
					row.css('background-color', houseColors[placedScores[i].house]); // color it with the house color
					if (placedScores[i].house == 'Prospect Hill') {row.css('color', 'black');} // make prospect hill readable
					visuals.scoreboard.append(row);
				}
				// generate events
				let prevEventCount = 0;
				if (prevData.type == 'data' && prevData.display) { // to not re-add events that are already here
					prevEventCount = prevData.events.length;
				}
				let newEvents = [];
				for (let i = prevEventCount; i < data.events.length; i++) { // put the new events in their array
					newEvents.push(data.events[i]);
				}
				visuals.appendEvents = updateType == 'add'; // use append mode if necessary
				visuals.events = []; // array of jq objects
				for (let i = 0; i < newEvents.length; i++) { // for each of the new events, create its html element
					let event = $('<div></div>').addClass('event');
					let eventTitle = $('<div></div>').text(newEvents[i].name).addClass('eventTitle');
					event.append(eventTitle);
					let evtPlacedScores = placeScores(newEvents[i].scores);
					let placeList = $('<ul></ul>');
					let hiddenPlaces = $('<div></div>').hide().addClass('hiddenPlaces');
					for (let i = 0; i < 8; i++) {
						let li = $('<li></li>').text(' ' + evtPlacedScores[i].house + ' (+' + evtPlacedScores[i].score + ')').css('color', houseColors[evtPlacedScores[i].house]);
						li.prepend($('<b></b>').text(evtPlacedScores[i].place + '.')); // the bold part before
						if (evtPlacedScores[i].place == 1) {
							placeList.append(li);
						} else {
							hiddenPlaces.append(li);
						}
					}
					placeList.append(hiddenPlaces);
					event.append(placeList);
					if (hiddenPlaces.children().length > 0) {
						let expandLink = $('<div></div>').append($('<a href="javascript:void(0)"></a>').html('<i class="fas fa-chevron-down"></i> Show all').addClass('expandLink'));
						event.append(expandLink);
					}
					visuals.events.push(event);
				}
			}
			
			//console.dir(visuals);
			updateVisuals(visuals);
		}
		prevData = data;
		clearTimeout(updateTimeout);
		updateTimeout = setTimeout(update, updateTime);
	}, function(reqStatus, err) { // error
		updateVisuals({
			status: 'error',
			errorText: reqStatus + ': ' + err,
			showEls: prevShowEls
		});
		prevData = {type: 'error'};
		clearTimeout(updateTimeout);
		updateTimeout = setTimeout(update, updateTime);
	});
}

/* obj:
	{
		status: string ('live', 'error', 'disabled'),
		errorText: string,
		showEls: boolean,
		scoreboard: jquery,
		eventsHeadingText: string,
		events: array[jquery],
		appendEvents: boolean,
		noEventsYet: boolean
	}
*/
function updateVisuals(obj) {
	// status
	if (obj.status == 'error') {
		setUpdateButton('error');
		toast(obj.errorText, 5000);
	} else {
		setUpdateButton('complete');
	}
	setTimeout(function() {setUpdateButton('off');}, 5000);
	// display els
	if (obj.showEls) {
		prevShowEls = true;
		changeNoContentDesc('');
		// scoreboard
		if (obj.scoreboard) {
			fadeChange($('#scoreboardContainer'), function(it) {it.empty().append(obj.scoreboard);});
		}
		// events heading
		if (obj.eventsHeadingText && obj.eventsHeadingText != $('#eventsHeading').text()) {
			fadeChange($('#eventsHeading'), function(it) {
				let pct = $('<div></div>').text(obj.eventsHeadingText); // events heading div element
				if (obj.noEventsYet) {pct.addClass('nothingText');}
				it.empty().append(pct);
			});
		}
		// events list
		if (obj.events) {
			if (obj.appendEvents) {
				for (let i = 0; i < obj.events.length; i++) {
					obj.events[i].hide();
					$('#events').prepend(obj.events[i]);
					obj.events[i].delay(animTime).slideDown(animTime);
				}
			} else {
				fadeChange($('#events'), function(it) {
					it.empty();
					for (let i = 0; i < obj.events.length; i++) {
						it.prepend(obj.events[i]);
					}
				});
			}
		}
	} else { // remove display content
		prevShowEls = false;
		fadeChange($('#scoreboardContainer'), function(it) {it.empty();});
		fadeChange($('#eventsHeading'), function(it) {it.empty();});
		fadeChange($('#events'), function(it) {it.empty();});
		if (obj.status == 'error') { // special case with error message
			changeNoContentDesc('Request failed, click <i class="fas fa-redo-alt"></i> to retry');
		} else {
			// assuming it is because of disabled, since that's the only reason i have to remove content for now
			changeNoContentDesc('You cannot view the data at this time.');
		}
	}
}

// states: 'off', 'waiting', 'complete', 'error'
function setUpdateButton(state) {
	if (state == 'off') {
		$('#updateButton').attr('disabled', false);
		$('#updateButton').html('<i class="fas fa-redo-alt"></i>');
	} else {
		$('#updateButton').attr('disabled', true);
		if (state == 'complete') {
			$('#updateButton').html('<i class="fas fa-check"></i>');
		} else if (state == 'error') {
			$('#updateButton').html('<i class="fas fa-exclamation-triangle"></i>');
		} else {
			$('#updateButton').html('<i class="fas fa-spinner fa-pulse"></i>');
		}
	}
}

function changeNoContentDesc(newText) {
	if ($('#noContentDesc').text() != newText) {
		fadeChange($('#noContentDesc'), function(it) {it.empty().html(newText);});
	}
}

// fade jq out, do func, fade jq in
function fadeChange(jq, func) {
	jq.fadeOut(animTime, function() {
		func(jq);
		jq.fadeIn(animTime);
	});
}

// this wasn't really a good idea
function getUpdateType(data) {
	if (!data.display) {
		return 'disabled';
	} else {
		if (prevData.type != 'data' || prevData.display == false) {
			return 'create';
		} else {
			if (checkEvents(data.events, prevData.events)) {
				if (data.events.length > prevData.events.length) {
					return 'add';
				} else {
					return 'none'; // MAY STILL HAVE SETTINGS CHANGE
				}
			} else {
				return 'correct';
			}
		}
	}
}

// return jq el of number aligned to dp
function numberEl(num, dp) {
	let el = $('<span></span>');
	el.text(num);
	let initialDP = decimalPlaces(num);
	let hiddenText = $('<span></span>').css('color', 'transparent');
	if (dp > 0 && num.toString().indexOf('.') == -1) {hiddenText.append('.');}
	for (let i = 0; i < dp - initialDP; i++) {hiddenText.append('0');}
	el.append(hiddenText);
	return el;
}