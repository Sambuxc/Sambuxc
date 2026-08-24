/* ═══════════════════════════════════════════════
   Scroll-triggered Reveal Animations
   ═══════════════════════════════════════════════ */
(function () {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('on');
				}
			});
		},
		{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
	);

	document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();


/* ═══════════════════════════════════════════════
   Horizontal Timeline — Wheel Scroll + Progress
   ═══════════════════════════════════════════════ */
(function () {
	const track = document.getElementById('timelineTrack');
	const fill = document.getElementById('timelineProgressFill');
	const hint = document.getElementById('scrollHint');

	if (!track || !fill) return;

	/* Convert vertical wheel to horizontal scroll */
	track.addEventListener('wheel', function (e) {
		/* Only hijack when hovering the timeline and it's horizontally scrollable */
		if (track.scrollWidth <= track.clientWidth) return;

		e.preventDefault();

		/* Multiplier for snappy feel — trackpad sends small deltas, mouse wheel sends large ones */
		const speed = 3;
		track.scrollLeft += e.deltaY * speed;
	}, { passive: false });

	/* Update progress bar on scroll */
	function updateProgress() {
		const max = track.scrollWidth - track.clientWidth;
		if (max <= 0) {
			fill.style.width = '100%';
			return;
		}
		const pct = (track.scrollLeft / max) * 100;
		fill.style.width = pct + '%';

		/* Hide hint after user starts scrolling */
		if (hint && pct > 2) {
			hint.classList.add('hidden');
		}
	}

	track.addEventListener('scroll', updateProgress, { passive: true });
	window.addEventListener('resize', updateProgress);
	updateProgress();

	/* Horizontal IntersectionObserver for timeline cards */
	const timelineObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('on');
				}
			});
		},
		{
			root: track,
			threshold: 0.3,
			rootMargin: '0px 80px 0px 0px'
		}
	);

	track.querySelectorAll('.timeline-card.reveal, .era-divider').forEach((el) => {
		timelineObserver.observe(el);
	});
})();


/* ═══════════════════════════════════════════════
   Theme: system detection + manual toggle
   ═══════════════════════════════════════════════ */
(function () {
	const root = document.documentElement;
	const btn = document.getElementById('themeToggle');
	const icon = document.getElementById('themeIcon');
	const STORAGE_KEY = 'theme-preference';
	const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

	function applyTheme(theme) {
		root.setAttribute('data-theme', theme);
		icon.textContent = theme === 'light' ? '☀️' : '🌙';
		btn.setAttribute('aria-label',
			theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
		);
	}

	function getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: light)').matches
			? 'light'
			: 'dark';
	}

	function savePreference(theme) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			theme: theme,
			expires: Date.now() + ONE_WEEK
		}));
	}

	function loadPreference() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			const pref = JSON.parse(raw);
			if (Date.now() > pref.expires) {
				localStorage.removeItem(STORAGE_KEY);
				return null;
			}
			return pref.theme;
		} catch (_) {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	/* Initialise: stored preference (if not expired) → system preference */
	applyTheme(loadPreference() || 'dark');

	/* Manual toggle */
	btn.addEventListener('click', function () {
		const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		applyTheme(next);
		savePreference(next);
	});

	/* React to live system changes (only when no manual override stored) */
	window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
		if (!loadPreference()) {
			applyTheme(e.matches ? 'light' : 'dark');
		}
	});
})();
