function notifyApproval(params) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (tabs && tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, params);
		}
	});
}

var ws = $.gracefulWebSocket("ws://localhost:9090/who-approves");

ws.onmessage = function(e) {
	$.each(JSON.parse(e.data), function(k,v) {
		console.log("message:", k, v);
		if (k === "approves") {
			notifyApproval(v);
		} else {
			console.error("Unhandled request:", k, v);
		}
	});
};

chrome.tabs.onActivated.addListener(function(tab_info) {
	chrome.tabs.get(tab_info.tabId, function(t) {
		var tab = {url: t.url, title: t.title};
		ws.send(JSON.stringify({"tab-changed": tab}));
	});
});
