'use strict';

const version = '1.0.6.2';

const apiKey = window.atob('QUl6YVN5Q2xqcC02c3hrOXFvM21qcnZ6S2dWWm11LUh6WXRnTTFj'); // google api key
const spreadsheetURL = window.atob('aHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLzEyVWdLa293N0xYTEhnZjV2NDVFc2p1UHVmXzdDT2VySjdtbkxnV2ROQ2JzL3ZhbHVlczpiYXRjaEdldA==');
const fakeSpreadsheetURL = window.atob('aHR0cHM6Ly9zaGVldHMuZ29vZ2xlYXBpcy5jb20vdjQvc3ByZWFkc2hlZXRzLzFpNWY3UjdfaXY0dzF6TUprZm9pMW1MTDZjRm12bWhxMkN3MmFQWDhsbFVRL3ZhbHVlczpiYXRjaEdldA==');

const updateTime = 60000; // to update automatically
const reqTimeout = 10000; // set to 0 for no timeout
const animTime = 500; // for content loading & toasts
const uiAnimTime = 250; // for clicking on stuff

// update notes, oldest first
// text is actually html
const updateNotes = [
	{
		version: '1.0',
		text: 'Released'
	}
];