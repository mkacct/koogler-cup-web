'use strict';

let selectedURL = spreadsheetURL;
const houses = ['Fairview', 'Fulton Creek', 'Houk', 'Lockport', 'Prospect Hill', 'Ridge', 'Steamtown', 'Sugar Grove'];
const houseColors = {
	'Fairview': 'gray',
	'Fulton Creek': 'green',
	'Houk': '#5050ff',
	'Lockport': 'purple',
	'Prospect Hill': '#c9c900',
	'Ridge': 'red',
	'Steamtown': '#4b9cd3',
	'Sugar Grove': 'teal'
};

// return whether events begins with all of prevEvents
function checkEvents(events, prevEvents) {
	if (events.length >= prevEvents.length) {
		for (let i = 0; i < prevEvents.length; i++) {
			if (events[i].name != prevEvents[i].name) {
				return false;
			}
			for (let j = 0; j < 8; j++) {
				if (events[i].scores[houses[j]] != prevEvents[i].scores[houses[j]]) {
					return false;
				}
			}
		}
		return true;
	} else {
		return false;
	}
}

// onSuccess(object data), onError(string status, string error)
function getData(onSuccess, onError) {
	$.ajax({
		type: 'get',
		url: selectedURL,
		data: {
			key: apiKey,
			ranges: ['Main', 'Events']
		},
		traditional: true,
		dataType: 'json',
		timeout: reqTimeout
	}).done(function(json) {
		let mainData = json.valueRanges[0].values.slice();
		let eventData = json.valueRanges[1].values.slice(1);
		let data = {type: 'data'};
		data.display = asBoolean(mainData[1][4]);
		if (data.display) {
			data.showCount = asBoolean(mainData[2][4]);
			if (isNaN(mainData[3][4])) {
				data.eventTotal = 0;
			} else {
				data.eventTotal = Number(mainData[3][4]);
			}
			data.scores = {};
			for (let i = 0; i < 8; i++) {
				data.scores[houses[i]] = Number(mainData[i + 2][1]);
			}
			data.events = [];
			eventData.forEach(function(event) {
				let entry = {};
				entry.name = event[0];
				entry.scores = {};
				for (let i = 0; i < 8; i++) {
					entry.scores[houses[i]] = Number(event[i + 1]);
				}
				data.events.push(entry);
			});
		}
		logUsage('Success', 'Success');
		onSuccess(data);
	}).fail(function(xhr, status, err) {
		let errorMessage;
		console.dir(xhr);
		if (err.length > 0) {
			errorMessage = err;
		} else if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.status) {
			errorMessage = xhr.responseJSON.error.status;
		} else if (xhr.status == 0) {
			errorMessage = 'client error';
		} else {
			errorMessage = xhr.status;
		}
		if (xhr.status != 0) {logUsage('Fail', status + ': ' + errorMessage);}
		onError(status, errorMessage);
	});
}

function placeScores(scores) {
	let placedScores = [];
	for (let i = 0; i < 8; i++) {
		placedScores.push({
			house: houses[i],
			score: scores[houses[i]]
		});
	}
	placedScores.sort(function(a, b) {return b.score - a.score;});
	for (let i = 0; i < 8; i++) {
		if (i > 0 && placedScores[i].score == placedScores[i - 1].score) {
			placedScores[i].place = placedScores[i - 1].place;
		} else {
			placedScores[i].place = i + 1;
		}
	}
	return placedScores;
}

// get max decimal places of scores from scores object
function maxDecimalPlaces(scores) {
	let maxDP = 0;
	for (let i = 0; i < 8; i++) {
		let selectedScore = scores[houses[i]];
		let dp = decimalPlaces(selectedScore);
		if (dp > maxDP) {maxDP = dp;}
	}
	return maxDP;
}

function decimalPlaces(num) {
	let numStr = num.toString();
	if (numStr.indexOf('.') != -1) {
		return numStr.length - numStr.indexOf('.') - 1;
	} else {
		return 0;
	}
}