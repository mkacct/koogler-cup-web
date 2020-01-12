'use strict';

let prevData = {type: 'none'};
let prevShowEls = false;
let updateTimeout;
let devClickCount = 0;

// begin pwa install stuff

let installPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
	installPrompt = e;
	$('#installButton').parent().show();
});

window.addEventListener('appinstalled', function(e) {hideInstallOption(true)});

function hideInstallOption(installed) {
	if (installed) {
		$('#installButton').parent().hide();
		logUsage('Feature', 'PWA install');
	}
	if ($('#installModal:visible').length > 0) {
		closeModal(function() {hideInstallOption2(installed);});
	} else {
		hideInstallOption2(installed);
	}
}

function hideInstallOption2(installed) { // the part that may or may not occur after closing the modal
	$('#installConfirmButton').hide();
	if (!installed) {$('#installModal p').html('Please <a href="index.html">reload the page</a> to install the web app.');}
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
				if ($('#creditsBackButton:visible').length > 0) {
					// pls make this a function if it becomes any more important
					$('#credits').slideUp(uiAnimTime);
					$('#notCredits').slideDown(uiAnimTime);
					$('#creditsBackButton').fadeOut(uiAnimTime);
				} else {
					closeModal();
				}
			} else {
				//openModal('#closeAppModal');
				toast('Use a different feature to leave the app', 3000);
			}
		});
		window.history.pushState({}, '');
		
		/*
		$('#closeAppButton').on('click', function(e) {
			// somehow manage to close the app
		});
		*/
	}
	// to scroll to top by clicking the logo
	$('#logoLink').on('click', function(e) {
		$('html, body').animate({scrollTop: 0}, uiAnimTime);
	});
	// to reload by button
	$('#updateButton').on('click', function(e) {
		clearTimeout(updateTimeout);
		update();
	});
	// to open the install modal
	$('#installButton').on('click', function(e) {
		openModal('#installModal');
	});
	// to show the install prompt (pwa)
	$('#installConfirmButton').on('click', function(e) {
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
	// to show the alpha list
	$('#alphaListButton').on('click', function(e) {
		let eventEls = $('.event');
		if (eventEls.length > 0) {
			eventEls.sort(function(a, b) {
				let stringA = $(a).children('h3').text();
				let stringB = $(b).children('h3').text();
				let stringA2 = stringA;
				let stringB2 = stringB;
				let prefixes = ['Q1 ', 'Q2 ', 'Q3 ', 'Q4 '];
				if (prefixes.indexOf(stringA.substr(0, 3)) != -1) {stringA2 = stringA.substr(3);}
				if (prefixes.indexOf(stringB.substr(0, 3)) != -1) {stringB2 = stringB.substr(3);}
				let compare = stringA2.localeCompare(stringB2);
				if (compare != 0) {
					return compare;
				} else {
					return stringA.localeCompare(stringB);
				}
			});
			$('#alphaList').empty();
			for (let i = 0; i < eventEls.length; i++) {
				let eventA = $('<a></a>').attr('href', 'javascript:void(0);').text($(eventEls[i]).children('h3').text());
				eventA.on('click', function(e) {
					closeModal();
					if ($(document).has(eventEls[i]).length > 0) { // if event element is in dom
						window.scrollTo(0, eventEls[i].offsetTop - $('header').outerHeight() - 16);
					} else {
						toast('The event was since removed', 3000);
					}
					logUsage('Feature', 'Alphabetical list');
				});
				$('#alphaList').append($('<li></li>').append(eventA));
			}
			openModal('#alphaListModal');
		} else {
			toast('No events are visible; you can\'t use this feature right now', 3000) // how did you even reach this line anyway
		}
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
		$('#credits').slideUp(uiAnimTime);
		$('#notCredits').slideDown(uiAnimTime);
		$('#creditsBackButton').fadeOut(uiAnimTime);
	});
	// to log use of the twitter link
	$('#twitterLink').on('click', function(e) {
		logUsage('Feature', 'Twitter link')
	});
	
	// update notes stuff
	if (updateNotes.length > 0) {
		// place update notes
		if (updateNotes.length > 1) {$('#prevUpdates').empty();}
		for (let i = 0; i < updateNotes.length; i++) {
			let el = $('<p></p>');
			el.text(' – ' + updateNotes[i].text);
			el.prepend($('<b></b>').text(updateNotes[i].version));
			if (i == updateNotes.length - 1) {
				$('#currentUpdate').replaceWith(el);
			} else {
				$('#prevUpdates').prepend(el);
			}
		}
		
		// check version and show update notes accordingly
		let prevUN = lsGet('prevUN', 'new'); // 'new' as in they're a new user
		let currUN = updateNotes[updateNotes.length - 1].version;
		if (prevUN != 'new' && isNewerVer(currUN, prevUN)) {
			openModal('#updateNotesModal');
		}
		lsSet('prevUN', currUN);
	} else {
		lsSet('prevUN', '0'); // start at 0 so that they're sure to get the first update note
	}
	
	logUsage('Open', 'index');
	
	setupDevMenu();
	
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
					row.children('td').css('background-color', houseColors[placedScores[i].house]); // color it with the house color
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
					let event = $('<section></section>').addClass('event');
					event.append($('<h3></h3>').text(newEvents[i].name).addClass('selectable'));
					let evtPlacedScores = placeScores(newEvents[i].scores);
					let placeList = $('<ul></ul>');
					let hiddenPlaces = $('<div></div>').addClass('hidden');
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
						let expandLink = $('<div></div>').append(generateExpandLink('Show all', 'Collapse', '.event'));
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
			showEls: prevShowEls,
			clientError: err == 'client error'
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
		clientError: boolean,
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
		toast('<i class="fas fa-exclamation-triangle"></i> ' + obj.errorText, 5000);
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
			changeNoContentDesc('An error occurred, click the <i class="fas fa-redo-alt"></i> button to retry' + (obj.clientError ? '<br>Make sure you are connected to the internet' : ''));
		} else {
			// assuming it is because of disabled, since that's the only reason i have to remove content for now
			changeNoContentDesc('You cannot view the data at this time.');
		}
	}
	// enable/disable alpha list button (lazy ik)
	setTimeout(function() {$('#alphaListButton').attr('disabled', obj.showEls == false || obj.noEventsYet == true);}, animTime);
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

function setupDevMenu() {
	$('#devUA').text(navigator.userAgent);
	$('body').on('click', function(e) {
		if ($(e.target).is($('#cred'))) {
			devClickCount++;
			if (devClickCount >= 4) {
				devClickCount = 0;
				logUsage('Feature', 'Dev menu');
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
	$('#fakeDataButton').on('click', function(e) {
		if (window.confirm('Enable fake data?')) {
			lsSet('fakeData', 'true');
			window.location.reload();
		}
	});
	$('#mqButton').on('click', function(e) {
		alert(window.matchMedia(prompt('Enter media query')).matches);
	});
	if (asBoolean(lsGet('fakeData', 'false'))) {
		// fake data time
		selectedId = fakeSpreadsheetId;
		$('main h1').text('Fake data').css('color', 'red');
		$('#notCredits').prepend($('<button></button>').attr('id', 'cancelFakeDataButton').text('Stop using fake data'));
		$('#cancelFakeDataButton').on('click', function(e) {
			lsSet('fakeData', 'false');
			window.location.reload();
		});
	}
}