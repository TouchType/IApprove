$(function() {

	// restore/save who field value as cookies
	$('input[name=who]')
		.each(function() {
			$(this).val($.cookie($(this).attr('name')));
		})
		.keyup(function() {
			$.cookie($(this).attr('name'), $(this).val());
		});

	// handle submit buttons staying on the same page
	$('form').submit(function(e) {
		e.preventDefault();
		$.ajax({
			url: $(this).attr('action'),
			type: $(this).attr('method').toUpperCase(),
			data: $(this).serializeArray(),
			success: function(d) {
				console.log(d);
				$('input[name=comment]').val('').focus();
			},
			error: function(e) {
				console.error(e);
			}
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
