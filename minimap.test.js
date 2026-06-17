const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function loadMinimapHelpers(seed = {}) {
  const store = new Map(Object.entries(seed));
  const sandbox = {
    window: {},
    localStorage: {
      getItem(key) { return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(key, String(value)); },
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('./js/minimap.js', 'utf8'), sandbox, { filename: 'minimap.js' });
  return { helpers: sandbox.MINIMAP_HELPERS, store };
}

test('normalizes minimap variant to the only supported map', () => {
  const { helpers } = loadMinimapHelpers();

  assert.equal(helpers.normalizeVariant('0'), 0);
  assert.equal(helpers.normalizeVariant('1'), 0);
  assert.equal(helpers.normalizeVariant('2'), 0);
  assert.equal(helpers.normalizeVariant('9'), 0);
  assert.equal(helpers.normalizeVariant('nope'), 0);
});

test('only the world card minimap remains', () => {
  const { helpers } = loadMinimapHelpers();

  assert.equal(helpers.VARIANTS.length, 1);
  assert.equal(helpers.VARIANTS[0].key, 'B');
});

test('uses the world card minimap as the default when no choice is saved', () => {
  const { helpers } = loadMinimapHelpers();

  assert.equal(helpers.initialVariant(null), 0);
});

test('story projection uses full world dimensions and real player position', () => {
  const { helpers } = loadMinimapHelpers();
  const view = helpers.buildMinimapView({
    gameMode: 'story',
    world: { w: 3200, h: 2000 },
    player: { x: 800, y: 500 },
    size: 160,
  });
  const pt = helpers.projectPoint(view, 1600, 1000);

  assert.equal(view.challenger, false);
  assert.equal(view.ox, 0);
  assert.equal(view.oy, 0);
  assert.equal(pt.x, 80);
  assert.equal(pt.y, 80);
  assert.equal(pt.visible, true);
  assert.equal(pt.dist, 0);
});

test('challenger projection centers the window on the player', () => {
  const { helpers } = loadMinimapHelpers();
  const view = helpers.buildMinimapView({
    gameMode: 'challenger',
    world: { w: 2600, h: 2600 },
    player: { x: 5200, y: -900 },
    size: 180,
  });
  const player = helpers.projectPoint(view, 5200, -900);
  const far = helpers.projectPoint(view, 7600, -900);

  assert.equal(view.challenger, true);
  assert.equal(view.span, 2400);
  assert.equal(player.x, 90);
  assert.equal(player.y, 90);
  assert.equal(player.visible, true);
  assert.equal(far.visible, false);
});
