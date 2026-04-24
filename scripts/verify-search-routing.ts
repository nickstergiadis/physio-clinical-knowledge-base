import assert from 'node:assert/strict';
import { buildSearchRoute, normalizeSearchQuery } from '../lib/searchRouting';

assert.equal(normalizeSearchQuery('shoulder'), 'shoulder');
assert.equal(normalizeSearchQuery(' shoulder\\\\ '), 'shoulder');
assert.equal(buildSearchRoute({ q: 'shoulder' }), '/search?q=shoulder');
assert.equal(buildSearchRoute({ q: 'shoulder\\\\' }), '/search?q=shoulder');
assert.equal(buildSearchRoute({ q: '  shoulder\\  ', region: 'shoulder', section: 'conditions' }), '/search?q=shoulder&region=shoulder&section=conditions');

const badRoute = buildSearchRoute({ q: 'shoulder\\' });
assert.ok(!badRoute.includes('%5C'));

console.log('Search routing assertions passed.');
