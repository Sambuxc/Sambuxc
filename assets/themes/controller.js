(function () {
	'use strict';
	const api = window.SBThemes;
	if (!api) return;
	const mobile = window.matchMedia('(max-width: 768px)');
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.className = 'interest-trigger';
	trigger.setAttribute('aria-haspopup', 'dialog');
	trigger.setAttribute('aria-controls', 'interest-panel');
	trigger.setAttribute('aria-expanded', 'false');

	const panel = document.createElement('dialog');
	panel.id = 'interest-panel';
	panel.className = 'interest-panel';
	panel.setAttribute('aria-labelledby', 'interest-heading');
	panel.innerHTML = `
		<div class="interest-panel-heading">
			<h2 id="interest-heading">A few sides of me</h2>
			<button type="button" class="interest-close" aria-label="Close theme menu">×</button>
		</div>
		<form class="interest-form">
			<fieldset><legend>Explore an interest</legend><div class="interest-options"></div></fieldset>
			<fieldset class="scheme-options"><legend>Colour scheme</legend>
				<label><input type="radio" name="scheme" value="light"> Light</label>
				<label><input type="radio" name="scheme" value="dark"> Dark</label>
			</fieldset>
		</form>`;
	const options = panel.querySelector('.interest-options');
	Object.entries(api.themes).forEach(([id, theme]) => {
		const label = document.createElement('label');
		label.className = 'interest-option';
		const input = document.createElement('input');
		input.type = 'radio';
		input.name = 'interest';
		input.value = id;
		const symbol = document.createElement('span');
		symbol.className = 'interest-symbol';
		symbol.setAttribute('aria-hidden', 'true');
		symbol.textContent = theme.symbol;
		const copy = document.createElement('span');
		const title = document.createElement('strong');
		title.textContent = theme.label;
		const description = document.createElement('span');
		description.textContent = theme.description;
		copy.append(title, description);
		label.append(input, symbol, copy);
		options.append(label);
	});
	document.body.append(trigger, panel);
	// The native dialog provides focus containment and inert background on mobile.
	let previousOverflow = '';
	let pageLocked = false;
	function lockPage() {
		pageLocked = true;
		previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
	function unlockPage() {
		if (pageLocked) document.body.style.overflow = previousOverflow;
		pageLocked = false;
	}
	function openPanel() {
		if (panel.open) return;
		if (mobile.matches) {
			panel.showModal();
			lockPage();
		} else {
			panel.show();
		}
		trigger.setAttribute('aria-expanded', 'true');
		panel.querySelector('input[name="interest"]:checked').focus();
	}
	function closePanel() {
		if (!panel.open) return;
		panel.close();
		unlockPage();
		trigger.setAttribute('aria-expanded', 'false');
		trigger.focus({ preventScroll: true });
	}
	trigger.addEventListener('click', () => panel.open ? closePanel() : openPanel());
	panel.querySelector('.interest-close').addEventListener('click', closePanel);
	panel.addEventListener('cancel', event => {
		event.preventDefault();
		closePanel();
	});
	document.addEventListener('keydown', event => {
		if (event.key === 'Escape' && panel.open) { event.preventDefault(); closePanel(); }
	});
	document.addEventListener('pointerdown', event => {
		if (panel.open && !mobile.matches && !panel.contains(event.target) && !trigger.contains(event.target)) closePanel();
	});
	panel.addEventListener('click', event => {
		if (event.target !== panel || !mobile.matches) return;
		const rect = panel.getBoundingClientRect();
		if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel();
	});
	mobile.addEventListener('change', () => {
		// Close on breakpoint changes so a desktop popover never remains modal.
		if (panel.open) closePanel();
	});
	panel.querySelector('form').addEventListener('submit', event => event.preventDefault());
	panel.addEventListener('change', event => {
		const input = event.target;
		if (!['interest', 'scheme'].includes(input.name)) return;
		api.apply({ ...api.getPreference(), [input.name]: input.value }, true);
	});
	const legacyButton = document.getElementById('themeToggle');
	const legacyIcon = document.getElementById('themeIcon');
	if (legacyButton) legacyButton.addEventListener('click', () => {
		const pref = api.getPreference();
		api.apply({ ...pref, scheme: pref.scheme === 'dark' ? 'light' : 'dark' }, true);
	});
	function syncControls() {
		const pref = api.getPreference();
		trigger.textContent = `Explore my interests · ${api.themes[pref.interest].shortLabel}`;
		panel.querySelectorAll('input').forEach(input => { input.checked = pref[input.name] === input.value; });
		if (legacyIcon) legacyIcon.textContent = pref.scheme === 'light' ? '☀️' : '🌙';
		if (legacyButton) legacyButton.setAttribute('aria-label', `Switch to ${pref.scheme === 'light' ? 'dark' : 'light'} mode`);
	}
	document.addEventListener('sb:themechange', syncControls);
	syncControls();

	// Bounded parallax, updated only after scroll/resize/theme changes (no perpetual loop).
	const atmosphere = document.querySelector('.theme-atmosphere');
	const portrait = document.querySelector('[data-theme-parallax]');
	let frame = 0;
	function renderParallax() {
		frame = 0;
		const motion = api.themes[api.getPreference().interest].motion;
		const progress = reduced.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 1)));
		const smallScreenScale = mobile.matches ? 0.4 : 1;
		const x = motion.parallaxX * progress * smallScreenScale;
		const y = motion.parallaxY * progress * smallScreenScale;
		if (atmosphere) atmosphere.style.translate = `${x}px ${y}px`;
		if (portrait) portrait.style.translate = `${-x * 0.5}px ${y * 0.6}px`;
	}
	function scheduleParallax() {
		if (!frame) frame = requestAnimationFrame(renderParallax);
	}
	window.addEventListener('scroll', scheduleParallax, { passive: true });
	window.addEventListener('resize', scheduleParallax, { passive: true });
	reduced.addEventListener('change', scheduleParallax);
	document.addEventListener('sb:themechange', scheduleParallax);
	renderParallax();
})();
