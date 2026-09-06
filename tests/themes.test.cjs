const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/themes/config.js'), 'utf8');

function boot(entries = {}, blocked = false) {
	const storage = new Map(Object.entries(entries));
	const tokens = new Map();
	const root = { dataset: {}, style: { setProperty: (name, value) => tokens.set(name, value) } };
	const events = [];
	const context = {
		window: {}, document: { documentElement: root, dispatchEvent: event => events.push(event) },
		CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
		localStorage: {
			getItem(key) { if (blocked) throw new Error('Storage denied'); return storage.get(key) || null; },
			setItem(key, value) { if (blocked) throw new Error('Storage denied'); storage.set(key, value); }
		}
	};
	vm.runInNewContext(source, context);
	return { api: context.window.SBThemes, root, tokens, storage, events };
}

test('first visit defaults to tech/dark and does not write to storage', () => {
	const { root, storage } = boot();
	assert.equal(root.dataset.interest, 'tech');
	assert.equal(root.dataset.theme, 'dark');
	assert.equal(storage.size, 0);
});
test('all four interests support both schemes and survive a reload', () => {
	for (const interest of ['boards', 'paragliding', 'tech', 'music']) {
		for (const scheme of ['light', 'dark']) {
			const { api, storage, tokens, events } = boot();
			api.apply({ interest, scheme }, true);
			const { root } = boot(Object.fromEntries(storage));
			assert.equal(root.dataset.interest, interest);
			assert.equal(root.dataset.theme, scheme);
			assert.equal(events.at(-1).type, 'sb:themechange');
			assert.ok(tokens.get('--color-accent'));
			assert.ok(tokens.get('--interest-easing'));
		}
	}
});
test('blocked storage still allows switching interests and schemes', () => {
	const { api, root } = boot({}, true);
	api.apply({ interest: 'music', scheme: 'light' }, true);
	assert.equal(root.dataset.interest, 'music');
	assert.equal(root.dataset.theme, 'light');
});
test('malformed and unrecognised saved preferences fall back safely', () => {
	for (const raw of ['{broken', 'null', '3', '"test"', '{"interest":"__proto__","scheme":"invalid"}']) {
		const { root } = boot({ 'sb-appearance-v1': raw });
		assert.equal(root.dataset.interest, 'tech');
		assert.equal(root.dataset.theme, 'dark');
	}
});
test('invalid API choices neither mutate the page nor persist', () => {
	const { api, root, storage } = boot();
	for (const interest of ['unknown', '__proto__', 'constructor']) api.apply({ interest, scheme: 'light' }, true);
	api.apply({ interest: 'tech', scheme: 'unknown' }, true);
	api.apply(null, true);
	assert.equal(root.dataset.interest, 'tech');
	assert.equal(root.dataset.theme, 'dark');
	assert.equal(storage.size, 0);
});
test('migrates unexpired and plain legacy light mode; ignores expired choices', () => {
	assert.equal(boot({ 'theme-preference': JSON.stringify({ theme: 'light', expires: Date.now() + 60000 }) }).root.dataset.theme, 'light');
	assert.equal(boot({ 'sb-theme': 'light' }).root.dataset.theme, 'light');
	assert.equal(boot({ 'theme-preference': JSON.stringify({ theme: 'light', expires: 1 }) }).root.dataset.theme, 'dark');
});
test('reading the preference cannot mutate internal state', () => {
	const { api } = boot();
	api.getPreference().interest = 'music';
	assert.equal(api.getPreference().interest, 'tech');
});
