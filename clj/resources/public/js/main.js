function websocket_url(path) {
	var loc = window.location;
	return "ws://" + loc.host + path;
}

$(function() {

	// restore/save who field value as cookies
	$('input[name=who]')
		.each(function() {
			$(this).val($.cookie($(this).attr('name')));
		})
		.keyup(function() {
			$.cookie($(this).attr('name'), $(this).val());
		});

	// do submits via websocket
	$('form').each(function() {
		var for_elem = $(this).find('input[name=for]');
		var path = $(this).attr('action');
		var url = websocket_url(path);
		console.log("Connecting to " + url);
		var connection = $.gracefulWebSocket(url);
		console.log("Connected.");
		connection.onmessage = function(e) {
			$.each(JSON.parse(e.data), function(k,v) {
				console.log("message:", k, v);
				if (k === "tab-changed") {
					for_elem.val(v.title);
				} else {
					console.error("Unhandled request:", k, v);
				}
			});
		};

		$(this).submit(function(e) {
			e.preventDefault();
			var form_data = {};
			$.each($(this).serializeArray(), function(i,e) {
				form_data[e.name] = e.value;
			});
			connection.send(JSON.stringify({approves: form_data}));
		});
	});

	// focus a text box
	$.each(['input[name=who]', 'input[name=comment]'], function(i,selector) {
		var e = $(selector);
		if (!e.val()) {
			e.focus();
			return false;
		}
	});
});
