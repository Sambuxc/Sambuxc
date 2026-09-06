/* Edit this file to customise the four interests. No build step is required.
 * Palette order: background, surface, raised surface, text, muted text, accent, secondary accent.
 * Motion distances are pixels; durations are milliseconds. See THEMES.md.
 */
(function () {
	'use strict';
	const themes = {
		boards: {
			label: 'Snowboard / skateboarding', shortLabel: '🛹', symbol: '🏂',
			description: 'On snow. On wheels.',
			image: {
				src: 'https://images.unsplash.com/photo-1625154869776-100eba31abbb?q=80&w=2382&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
				alt: 'Snowboarder in a yellow jacket jumping against a clear blue sky',
				width: 1200, height: 782
			},
			font: "'Inter', system-ui, sans-serif", radius: '4px',
			light: ['#f3f5ed', '#ffffff', '#e5e9dc', '#182016', '#48523f', '#386300', '#a33214'],
			dark: ['#11150e', '#1e2518', '#2b3422', '#f0f6e6', '#b4c2a4', '#c3ef59', '#ff9c76'],
			motion: { duration: 180, easing: 'cubic-bezier(.2,.8,.3,1)', lift: -5, tilt: -2, scale: 1.01, revealX: -22, revealY: 8, parallaxX: 18, parallaxY: -10 }
		},
		paragliding: {
			label: 'Paragliding', shortLabel: '🪂', symbol: '🪂',
			description: 'A little more perspective.',
			font: "'Instrument Serif', Georgia, serif", radius: '24px',
			light: ['#eef8fc', '#ffffff', '#dceef5', '#102f43', '#3d5c6e', '#00678d', '#7d479d'],
			dark: ['#091c2b', '#112e42', '#1a3d54', '#e8f6fd', '#aac9dc', '#83daf4', '#d4b0ef'],
			motion: { duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', lift: -8, tilt: 0, scale: 1, revealX: 0, revealY: 28, parallaxX: 5, parallaxY: -24 }
		},
		tech: {
			label: 'Tech', shortLabel: '📟', symbol: '📟',
			description: 'Curiosity, made useful.',
			font: "'Space Mono', ui-monospace, monospace", radius: '10px',
			light: ['#f2f4fc', '#ffffff', '#e4e9f8', '#17203b', '#485574', '#394fb3', '#006c62'],
			dark: ['#0b1020', '#151e35', '#202c46', '#edf2ff', '#b0bfdf', '#9babff', '#70dcc7'],
			motion: { duration: 220, easing: 'cubic-bezier(.2,0,0,1)', lift: -2, tilt: 0, scale: 1, revealX: 0, revealY: 12, parallaxX: 0, parallaxY: -6 }
		},
		music: {
			label: 'Music / guitar', shortLabel: '🎶', symbol: '🎶',
			description: 'Room for a different rhythm.',
			font: "'Instrument Serif', Georgia, serif", radius: '16px',
			light: ['#fff4e8', '#fffcf7', '#f4dfc8', '#382218', '#6d5140', '#99451c', '#804475'],
			dark: ['#211510', '#32221a', '#463024', '#fff0df', '#d4b8a0', '#f7b36d', '#e7a6d5'],
			motion: { duration: 420, easing: 'cubic-bezier(.34,1.3,.64,1)', lift: -3, tilt: 1, scale: 1.015, revealX: 0, revealY: 16, parallaxX: -10, parallaxY: -14 }
		}
	};
	const storageKey = 'sb-appearance-v1';
	const defaults = { interest: 'tech', scheme: 'dark' };
	const validInterest = value => Object.hasOwn(themes, value);
	let preference = { ...defaults };
	try {
		const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
		if (saved) {
			if (validInterest(saved.interest)) preference.interest = saved.interest;
			if (['light', 'dark'].includes(saved.scheme)) preference.scheme = saved.scheme;
		} else {
			// Carry forward the old site's unexpired light/dark choice.
			let legacy = localStorage.getItem('sb-theme');
			try {
				const old = JSON.parse(localStorage.getItem('theme-preference') || 'null');
				if (old && (!old.expires || Date.now() <= old.expires)) legacy = old.theme;
			} catch (_) { /* Malformed legacy JSON must not prevent rendering. */ }
			if (['light', 'dark'].includes(legacy)) preference.scheme = legacy;
		}
	} catch (_) { /* Storage can be unavailable in privacy modes. */ }

	function apply(next, persist = false) {
		if (!next || !validInterest(next.interest) || !['light', 'dark'].includes(next.scheme)) return;
		preference = { interest: next.interest, scheme: next.scheme };
		const root = document.documentElement;
		const theme = themes[preference.interest];
		const [bg, surface, raised, text, muted, accent, secondary] = theme[preference.scheme];
		const tokens = {
			'color-bg': bg, 'color-surface': surface, 'color-surface-raised': raised,
			'color-text-primary': text, 'color-text-heading': text, 'color-text-secondary': muted,
			'color-text-muted': muted, 'color-text-faint': muted, 'color-text-disabled': muted,
			'color-text-white': text, 'color-text-link': accent, 'color-accent': accent,
			'color-accent-default': accent, 'color-accent-product': secondary,
			'color-accent-agency': accent, 'color-accent-mentor': secondary,
			'color-accent-freelance': accent, 'color-accent-intern': secondary,
			'card-bg': surface, 'card-bg-hover': raised, 'card-radius': theme.radius,
			'font-display': theme.font, 'font-serif': theme.font,
			'interest-duration': `${theme.motion.duration}ms`, 'interest-easing': theme.motion.easing,
			'interest-lift': `${theme.motion.lift}px`, 'interest-tilt': `${theme.motion.tilt}deg`,
			'interest-scale': theme.motion.scale,
			'interest-reveal-x': `${theme.motion.revealX}px`, 'interest-reveal-y': `${theme.motion.revealY}px`
		};
		root.dataset.interest = preference.interest;
		root.dataset.theme = preference.scheme;
		root.style.colorScheme = preference.scheme;
		Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(`--${key}`, value));
		if (persist) {
			try { localStorage.setItem(storageKey, JSON.stringify(preference)); } catch (_) { /* Session-only is fine. */ }
		}
		document.dispatchEvent(new CustomEvent('sb:themechange', { detail: { ...preference } }));
	}
	window.SBThemes = { themes, apply, getPreference: () => ({ ...preference }) };
	apply(preference);
})();
