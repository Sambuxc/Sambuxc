/* ═══════════════════════════════════════════════
   Sam Bruton — "Vibes" theme framework: behaviour
   ───────────────────────────────────────────────
   Pairs with assets/vibes.css.

   To add a new vibe:
     1. Add its CSS block in vibes.css
     2. Add {id, label, icon} to VIBES below
     3. Add a matching entry to PARALLAX_CONFIG
   That's it — the menu and parallax rebuild themselves
   from these two lists.
   ═══════════════════════════════════════════════ */

const VIBES = [
	{ id: 'none', label: 'Default', icon: '✨' },
	{ id: 'snowboard', label: 'Snowboard / Skate', icon: '🏂' },
	{ id: 'paragliding', label: 'Paragliding', icon: '🪂' },
	{ id: 'tech', label: 'Tech', icon: '💻' },
	{ id: 'guitar', label: 'Music / Guitar', icon: '🎸' },
];

const PARALLAX_CONFIG = {
	snowboard: [
		{ icons: ['❄', '❅', '❆'], count: 22, className: 'p-snow', sizeRange: [0.7, 1.6], durationRange: [9, 18] },
	],
	paragliding: [
		{ icons: ['☁'], count: 8, className: 'p-cloud', sizeRange: [2, 4], durationRange: [22, 38] },
		{ icons: ['🪂'], count: 3, className: 'p-glider', sizeRange: [1.2, 1.8], durationRange: [26, 40] },
	],
	tech: [
		{ icons: ['0', '1'], count: 26, className: 'p-bit', sizeRange: [0.7, 1.1], durationRange: [8, 16] },
	],
	guitar: [
		{ icons: ['♪', '♫', '♬'], count: 16, className: 'p-note', sizeRange: [0.9, 1.6], durationRange: [10, 20] },
	],
};

(function () {
	'use strict';

	const STORAGE_KEY = 'vibe-preference';
	const root = document.documentElement;
	const body = document.body;
	const validIds = VIBES.map((v) => v.id);

	/* ── Persistence ── */
	function loadVibe() {
		try {
			const v = localStorage.getItem(STORAGE_KEY);
			return validIds.includes(v) ? v : 'none';
		} catch (e) {
			return 'none';
		}
	}

	function saveVibe(v) {
		try {
			localStorage.setItem(STORAGE_KEY, v);
		} catch (e) {
			/* private mode etc — ignore */
		}
	}

	/* ── Parallax: scroll + subtle pointer drift ── */
	const Parallax = (function () {
		const container = document.getElementById('vibeParallax');
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let particles = [];
		let scrollY = window.scrollY;
		let pointerX = 0;
		let ticking = false;

		function rand(min, max) {
			return min + Math.random() * (max - min);
		}

		function clear() {
			if (!container) return;
			container.innerHTML = '';
			particles = [];
		}

		function spawnGroup(group) {
			const [minSize, maxSize] = group.sizeRange;
			const [minDur, maxDur] = group.durationRange;

			for (let i = 0; i < group.count; i++) {
				const el = document.createElement('span');
				el.className = 'vibe-particle ' + group.className;
				el.textContent = group.icons[i % group.icons.length];
				el.style.left = rand(0, 100) + 'vw';
				el.style.fontSize = rand(minSize, maxSize).toFixed(2) + 'rem';
				el.style.animationDuration = rand(minDur, maxDur).toFixed(1) + 's';
				el.style.animationDelay = (-rand(0, maxDur)).toFixed(1) + 's';
				el.dataset.depth = rand(0.15, 1).toFixed(2);
				container.appendChild(el);
				particles.push(el);
			}
		}

		function build(vibeId) {
			clear();
			if (!container || vibeId === 'none' || reduceMotion) return;
			const groups = PARALLAX_CONFIG[vibeId];
			if (!groups) return;
			groups.forEach(spawnGroup);
			applyOffsets();
		}

		function applyOffsets() {
			if (!particles.length) return;
			particles.forEach((el) => {
				const depth = parseFloat(el.dataset.depth) || 0.5;
				const py = (scrollY * depth * -0.06).toFixed(1);
				const px = (pointerX * depth * 10).toFixed(1);
				/* `translate` composes independently of the `transform`
				   the keyframe animation is driving, so both apply at once. */
				el.style.translate = px + 'px ' + py + 'px';
			});
			ticking = false;
		}

		function requestUpdate() {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(applyOffsets);
			}
		}

		if (!reduceMotion) {
			window.addEventListener('scroll', () => {
				scrollY = window.scrollY;
				requestUpdate();
			}, { passive: true });

			if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
				window.addEventListener('mousemove', (e) => {
					pointerX = (e.clientX / window.innerWidth) - 0.5;
					requestUpdate();
				}, { passive: true });
			}
		}

		return {
			setVibe: build,
		};
	})();

	/* ── Apply a vibe: attribute + menu state + parallax ── */
	function applyVibe(vibeId) {
		if (vibeId === 'none') {
			root.removeAttribute('data-vibe');
		} else {
			root.setAttribute('data-vibe', vibeId);
		}

		document.querySelectorAll('.vibe-option').forEach((btn) => {
			const isActive = btn.dataset.vibeOption === vibeId;
			btn.classList.toggle('active', isActive);
			btn.setAttribute('aria-checked', String(isActive));
		});

		const active = VIBES.find((v) => v.id === vibeId) || VIBES[0];
		const menuIcon = document.getElementById('vibeMenuIcon');
		if (menuIcon) menuIcon.textContent = active.icon;

		Parallax.setVibe(vibeId);
	}

	/* ── Build the menu markup once ── */
	function buildMenu() {
		const panel = document.getElementById('vibePanel');
		if (!panel) return;

		const label = document.createElement('p');
		label.className = 'vibe-panel-label';
		label.textContent = 'Pick a vibe';
		panel.appendChild(label);

		VIBES.forEach((vibe) => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'vibe-option';
			btn.setAttribute('role', 'menuitemradio');
			btn.setAttribute('aria-checked', 'false');
			btn.dataset.vibeOption = vibe.id;
			btn.innerHTML =
				'<span class="vibe-option-icon" aria-hidden="true">' + vibe.icon + '</span>' +
				'<span>' + vibe.label + '</span>';
			btn.addEventListener('click', () => {
				applyVibe(vibe.id);
				saveVibe(vibe.id);
				if (window.matchMedia('(max-width: 768px)').matches) {
					closeMenu();
				}
			});
			panel.appendChild(btn);
		});
	}

	/* ── Open / close behaviour ── */
	const menu = document.getElementById('vibeMenu');
	const toggleBtn = document.getElementById('vibeMenuToggle');
	const backdrop = document.getElementById('vibeBackdrop');

	function openMenu() {
		body.classList.add('vibe-menu-open');
		if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
	}

	function closeMenu() {
		body.classList.remove('vibe-menu-open');
		if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
	}

	function toggleMenu() {
		if (body.classList.contains('vibe-menu-open')) closeMenu();
		else openMenu();
	}

	if (toggleBtn) toggleBtn.addEventListener('click', toggleMenu);
	if (backdrop) backdrop.addEventListener('click', closeMenu);

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeMenu();
	});

	document.addEventListener('click', (e) => {
		if (menu && !menu.contains(e.target)) closeMenu();
	});

	/* ── Init ── */
	buildMenu();
	applyVibe(loadVibe());

	/* Exposed for debugging / console tinkering */
	window.SBVibes = { applyVibe, saveVibe, loadVibe, list: VIBES };
})();
