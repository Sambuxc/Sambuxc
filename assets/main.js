/* ═══════════════════════════════════════════════
   Scroll-triggered Reveal Animations
   ═══════════════════════════════════════════════ */
(function () {
	if (!('IntersectionObserver' in window)) return;
	document.documentElement.classList.add('reveal-ready');
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

		if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
		const max = track.scrollWidth - track.clientWidth;
		if ((e.deltaY < 0 && track.scrollLeft <= 0) || (e.deltaY > 0 && track.scrollLeft >= max - 1)) return;
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
	if (!('IntersectionObserver' in window)) return;
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
