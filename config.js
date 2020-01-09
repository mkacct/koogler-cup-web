'use strict';

const version = '1.0.4';

const apiKey = window.atob('QUl6YVN5Q2xqcC02c3hrOXFvM21qcnZ6S2dWWm11LUh6WXRnTTFj'); // google api key
const spreadsheetId = '12UgKkow7LXLHgf5v45EsjuPuf_7COerJ7mnLgWdNCbs';
const fakeSpreadsheetId = '1i5f7R7_iv4w1zMJkfoi1mLL6cFmvmhq2Cw2aPX8llUQ';

const updateTime = 60000; // to update automatically
const reqTimeout = 10000; // set to 0 for no timeout
const animTime = 500; // for content loading & toasts
const uiAnimTime = 250; // for clicking on stuff

// update notes, oldest first
// example: {version: '1.0', text: 'Added something'}
const updateNotes = [
	{
		version: '1.0',
		text: 'Released'
	}
];