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
		var _this = $(this);
		var path = $(this).attr('action');
		var url = websocket_url(path);

		function handle_message(k,v) {
			console.log("message:", k, v);
			if (k === "tab-changed") {
				_this.find('a.for')
					.text(v.title)
					.attr('href', v.url);
				_this.find('input[name=title]')
					.val(v.title);
				_this.find('input[name=url]')
					.val(v.url);
			} else {
				console.error("Unhandled request:", k, v);
			}
		}

		var message_queue = [];
		var connection;
		function connect() {
			connection = $.gracefulWebSocket(url);
			connection.onmessage = function(e) {
				$.each(JSON.parse(e.data), handle_message);
			};
			connection.onopen = function() {
				console.log("Connected.");
				while(message_queue.length) {
					connection.send(message_queue[0]);
					message_queue.shift();
				}
			};
			connection.onclose = function() {
				console.warn("Connection closed.");
				setTimeout(connect, 4000);
			};
		}
		console.log("Connecting to " + url);
		connect();

		$(this).submit(function(e) {
			e.preventDefault();
			var form_data = {};
			$.each($(this).serializeArray(), function(i,e) {
				form_data[e.name] = e.value;
			});
			var message = JSON.stringify({approves: form_data});
			if (connection) {
				connection.send(message);
			} else {
				console.warn('Not connected. Sending later.');
				message_queue.push(message);
			}
			$(this).find('input[name=comment]')
				.val('')
				.focus();
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
