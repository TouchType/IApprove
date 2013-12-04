var WS_URL = "ws://localhost:9090/who-approves";

function notifyApproval(params) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (tabs && tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, params);
		}
	});
}

function handle_message(k,v) {
	console.log("message:", k, v);
	if (k === "approves") {
		notifyApproval(v);
	} else {
		console.error("Unhandled message:", k, v);
	}
}

var message_queue = [];
var ws = null;
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
	};
}
connect();

chrome.tabs.onActivated.addListener(function(tab_info) {
	chrome.tabs.get(tab_info.tabId, function(t) {
		var tab = {url: t.url, title: t.title};
		var message = JSON.stringify({"tab-changed": tab});
		if (ws) {
			ws.send(message)
		} else {
			console.warn("Not connected. Sending later.");
			message_queue.push(message);
		};
	});
});
