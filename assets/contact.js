(function () {
	'use strict';
	const form = document.getElementById('contact-form');
	if (!form) return;
	const button = document.getElementById('contact-submit');
	const status = document.getElementById('contact-status');
	const fields = [...form.querySelectorAll('input, textarea')];

	function checkMessage(event) {
		event.preventDefault();
		status.textContent = '';
		fields.forEach(field => {
			field.setCustomValidity(field.value.trim() ? '' : 'Please fill in this field.');
		});
		if (!form.reportValidity()) return;
		status.textContent = 'Your message is ready. Sending will be available soon.';
	}

	// UI review only. Keep entered details on the page until the API is connected.
	form.addEventListener('submit', checkMessage);
	button.addEventListener('click', checkMessage);
	form.addEventListener('input', event => {
		if (!fields.includes(event.target)) return;
		event.target.setCustomValidity('');
		status.textContent = '';
	});
	button.disabled = false;
})();
