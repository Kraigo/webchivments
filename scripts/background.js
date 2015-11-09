'use strict';

var KEYS = {
	'65': 'A',			'66': 'B',			'67': 'C',
	'68': 'D',			'69': 'E',			'70': 'F',
	'71': 'G',			'72': 'H',			'73': 'I',
	'74': 'J',			'75': 'K',			'76': 'L',
	'77': 'M',			'78': 'N',			'79': 'O',
	'80': 'P',			'81': 'Q',			'82': 'R',
	'83': 'S',			'84': 'T',			'85': 'U',
	'86': 'V',			'87': 'W',			'88': 'X',
	'89': 'U',			'90': 'Z',

	'48': '0',			'49': '1',			'50': '2',
	'51': '3',			'52': '4',			'53': '5',
	'54': '6',			'55': '7',			'56': '8',
	'57': '9',			

	'32': 'SPACE',		'8': 'BACKSPACE',	'13': 'ENTER',
	'16': 'SHIFT',		'17': 'CTRL',		'18': 'ALT',
	'9': 'TAB',			'27': 'ESC',

	'192': 'TILDE',		'188': 'COMMA',		'190': 'PERIOD',
	'191': 'BSLASH',	'220': 'FSLASH',
	'189': 'MINUS',		'187': 'PLUS'
}
var stats;
var achievments;
var stacks = {
	presses: [],
	clicks: []
}

function setListeners() {
	chrome.runtime.onMessage.addListener(function(msg) {
		if (msg.pages) {
			stats.pages += msg.pages;
		}

		if (msg.path) {
			stats.path += msg.path;
		}
		
		if (msg.clicks) {
			stats.clicks += msg.clicks;

			var lastSpeed = calcSpeed(msg.clicks, stacks.clicks);
			if (lastSpeed > stats.clicksSpeed) {
				stats.clicksSpeed = lastSpeed;
			}

			console.log(msg.clicks);
		}

		if (msg.keys) {
			for(var i = 0, k; i < msg.keys.length; i++) {
				k = msg.keys[i];

				if (!stats.keys[KEYS[k]]) {
					stats.keys[KEYS[k]] = 0;
				}
				stats.keys[KEYS[k]] ++;
			}
			stats.presses += msg.keys.length;

			var lastSpeed = calcSpeed(msg.keys.length, stacks.presses);
			if (lastSpeed > stats.pressesSpeed) {
				stats.pressesSpeed = lastSpeed;
			}
		}

		if (msg.openPopup) {
			stats.popup ++;
			stats.achievmentsRecent = stats.achievmentsRecent.filter(function(item){
				return msg.openPopup.indexOf(item) < 0;
			});
			chrome.browserAction.setBadgeText({text: ''});
		}

	});
}

function saveStats() {
	checkAchievments();
	chrome.storage.local.set(stats);
}

function init(chromeStats) {
	stats = chromeStats;
	achievments = getAchievments(stats);
	setListeners();
	setInterval(saveStats, 10000)
}

function checkAchievments() {
	for(var i=0, achievment; i<achievments.length; i++) {
		achievment = achievments[i];
		if (!achievment.isFired() && achievment.trigger()) {
			fireAchievment(achievment);
		}
	}
}

function calcSpeed(input, stack) {
	stack.push(input);
	if (stack.length > 5) {
		stack.pop();
	}
	var result = 0;
	for (var i = 0; i < stack.length; i ++) {
		result += stack[i];
	}
	return result;
}

function fireAchievment(achievment) {
	console.log('Fire achievment', achievment.title);
	stats.achievmentsFired.push(achievment.id);
	stats.achievmentsRecent.push(achievment.id);
	var badge = stats.achievmentsRecent.length;
	chrome.browserAction.setBadgeText({text: badge > 0 ? badge.toString() : ''})
	chrome.notifications.create(null, {type:'basic', title: 'Новое достижение!', message: achievment.title, contextMessage: achievment.description, iconUrl: 'images/'+achievment.icon});
}


chrome.storage.local.clear(function() {
chrome.storage.local.get({
		pages: 0,
		path: 0,
		presses: 0,
		pressesSpeed: 0,
		clicks: 0,
		clicksSpeed: 0,
		popup: 0,
		keys: {},
		achievmentsFired: [],
		achievmentsRecent: []
	}, init);
});