'use strict';

const version = '0.1';

const apiKey = 'AIzaSyCljp-6sxk9qo3mjrvzKgVZmu-HzYtgM1c'; // google api key
const spreadsheetId = '12UgKkow7LXLHgf5v45EsjuPuf_7COerJ7mnLgWdNCbs'; // real data
//const spreadsheetId = '1i5f7R7_iv4w1zMJkfoi1mLL6cFmvmhq2Cw2aPX8llUQ'; // fake data

const updateTime = 60000; // to update automatically
const reqTimeout = 30000; // set to 0 for no timeout
const animTime = 500; // for content loading & toasts
const uiAnimTime = 250; // for clicking on stuff

// update notes, oldest first
const updateNotes = [];