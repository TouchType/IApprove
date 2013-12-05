var WS_URL = "ws://localhost:9090/who-approves";

function notify_approval(params) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (tabs && tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, params);
		}
	});
}

function handle_message(k,v) {
	console.log("message:", k, v);
	if (k === "approves") {
		notify_approval(v);
	} else {
		console.error("Unhandled message:", k, v);
	}
}

var message_queue = [];
var ws;
function connect() {
	console.log("Connecting to " + WS_URL);
	ws = $.gracefulWebSocket(WS_URL);
	ws.onmessage = function(e) {
		$.each(JSON.parse(e.data), handle_message);
	};
	ws.onopen = function() {
		console.log("Connected.");
		while(message_queue.length) {
			ws.send(message_queue[0]);
			message_queue.shift();
		}
	};
	ws.onclose = function() {
		console.warn("Connection closed.");
		setTimeout(connect, 4000);
		ws = null;
	};
}
connect();

function send_message(m) {
	if (ws) {
		ws.send(m)
	} else {
		console.warn("Not connected. Sending later.");
		message_queue.push(m);
	};
}

function handle_tab_change(tab_id) {
	if (tab_id === undefined) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tab_info) {
			console.log(tab_info);
			if (tab_info) handle_tab_change(tab_info[0].id);
		});
		return;
	}

	chrome.tabs.get(tab_id, function(t) {
		var tab = {url: t.url, title: t.title};
		console.log('active page changed: ', tab);
		send_message(JSON.stringify({'tab-changed': tab}))

		// send a screenshot to the server
		chrome.tabs.captureVisibleTab(t.windowId, {quality: 5}, function(data) {
			if (!data) {
				console.warn('Unable to get screenshot');
				return;
			}
			send_message(JSON.stringify({'screenshot': data}));
		});
	});
}

// tell the server what the current tab is
handle_tab_change();

// watch for switches between tabs
chrome.tabs.onActivated.addListener(function(tab_info) {
	handle_tab_change(tab_info.tabId);
});

// watch for tab updates
chrome.tabs.onUpdated.addListener(function(tab_info) {
	handle_tab_change(tab_info.tabId);
});

// watch for window changes
chrome.windows.onFocusChanged.addListener(function() {
	handle_tab_change();
});
