function showNotification(req) {
	var container = $('.iapprove-container');
	if (container.size() == 0) {
		container = $('<div>').addClass('iapprove-container');
		$('body').append(container);
	}

	// Google Drive presentation workaround
	var gdrive_fullscreen_elem = $('.punch-full-screen-element');
	if (gdrive_fullscreen_elem.size() > 0) {
		if (container.closest('.punch-full-screen-element').size() == 0) {
			gdrive_fullscreen_elem.append(container);
		} 
	}

	var n = $('<div>')
			.addClass('iapprove-notification')
			.addClass(req.comment ? 'iapprove-comment' : 'iapprove-like')
			.append(
				$('<h3>').append(
					$('<span>')
						.addClass('iapprove-who')
						.text(req.who)
				),
				req.comment
					? $('<q>').text(req.comment)
					: null
			);
	container.append(n);
	setTimeout(function() {
		n.animate({ opacity:0 }, function() {
			$(this).animate({ height:0, margin:0, padding:0 }, function() {
				$(this).remove();
			});
		});
	}, 5000);
}

chrome.runtime.onMessage.addListener(showNotification);
