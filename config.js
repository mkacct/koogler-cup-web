'use strict';

const version = '1.1.1.1';

const apiURL = window.atob('aHR0cHM6Ly9zYW0uam9zaGllcG9vLmdx');

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
	},
	{
		version: '1.1',
		text: 'This update includes the following improvements:<ul><li>Stability issue has been addressed</li><li>Light mode is now available on compatible devices/browsers</li><li>Additional minor fixes</li></ul>'
	}
];