(function () {
	'use strict';
	const form = document.getElementById('contact-form');
	if (!form) return;
	const button = document.getElementById('contact-submit');
	const status = document.getElementById('contact-status');
	const retry = document.getElementById('contact-verification-retry');
	const fields = [...form.querySelectorAll('input[required], textarea[required]')];
	let token = '';
	let widgetId = null;
	let sending = false;
	let widgetTheme = '';
	let script = null;

	function updateButton() {
		button.disabled = sending || !token;
	}
	function verificationFailed() {
		token = '';
		retry.hidden = false;
		updateButton();
	}
	function renderWidget() {
		if (sending || !window.turnstile) return;
		if (widgetId !== null) window.turnstile.remove(widgetId);
		token = '';
		widgetTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
		retry.hidden = true;
		updateButton();
		widgetId = window.turnstile.render('#contact-turnstile', {
			sitekey: '0x4AAAAAACsPS8ootg3uaoHB',
			theme: widgetTheme,
			size: 'flexible',
			'response-field': false,
			callback(value) {
				token = value;
				retry.hidden = true;
				updateButton();
			},
			'expired-callback'() {
				verificationFailed();
			},
			'timeout-callback'() {
				verificationFailed();
			},
			'error-callback'() {
				verificationFailed();
				return true;
			}
		});
	}
	window.onContactTurnstileLoad = renderWidget;
	function loadWidget() {
		script?.remove();
		script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onContactTurnstileLoad&render=explicit';
		script.async = true;
		script.addEventListener('error', () => verificationFailed());
		document.head.append(script);
	}
	retry.addEventListener('click', () => {
		if (sending) return;
		retry.hidden = true;
		if (window.turnstile) renderWidget();
		else loadWidget();
	});
	document.addEventListener('sb:themechange', () => {
		const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
		if (theme !== widgetTheme) renderWidget();
	});
	async function sendMessage(event) {
		event.preventDefault();
		if (sending) return;
		status.textContent = '';
		fields.forEach(field => {
			let error = field.value.trim() ? '' : 'Please fill in this field.';
			if (field.value.length > field.maxLength) error = 'Please shorten this field to ' + field.maxLength + ' characters.';
			if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) error = 'Please enter a valid email address.';
			field.setCustomValidity(error);
		});
		if (!form.reportValidity()) return;
		if (!token) {
			verificationFailed();
			return;
		}
		const values = Object.fromEntries(fields.map(field => [field.name, field.value.trim()]));
		const submittedToken = token;
		token = '';
		sending = true;
		updateButton();
		fields.forEach(field => { field.readOnly = true; });
		button.textContent = 'Sending…';
		status.textContent = 'Sending your message…';
		try {
			const response = await fetch('https://lib-tech.work/send-mailer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				signal: AbortSignal.timeout(20000),
				body: JSON.stringify({
					...values,
					subject: 'Portfolio enquiry from ' + values.name,
					service: 'sambruton.com',
					website: '',
					token: submittedToken
				})
			});
			if (response.ok) {
				form.reset();
				status.textContent = 'Thank you. Your message has been sent.';
			} else if (response.status === 429) {
				status.textContent = 'Too many attempts. Please wait a minute before trying again.';
			} else {
				status.textContent = 'Your message could not be sent. Your details are still here. Please verify again and retry.';
			}
		} catch {
			status.textContent = 'We could not confirm whether your message was sent. Your details are still here. Check your connection before trying again.';
		} finally {
			sending = false;
			fields.forEach(field => { field.readOnly = false; });
			button.textContent = 'Send message';
			// Tokens are single-use, including after failed or timed-out requests.
			if (widgetId !== null && window.turnstile) {
				if (widgetTheme !== document.documentElement.dataset.theme) renderWidget();
				else {
					window.turnstile.reset(widgetId);
				}
			}
			updateButton();
		}
	}
	form.addEventListener('submit', sendMessage);
	form.addEventListener('input', event => {
		if (!fields.includes(event.target) || sending) return;
		event.target.setCustomValidity('');
		status.textContent = '';
	});
	loadWidget();
})();
