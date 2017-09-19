import 'jsdom-global/register';
import test from 'tape';
import DragonDrop from '../';
import defaults from '../lib/defaults';
import queryAll from '../lib/query-all';
import Fixture from './helpers/fixture';

const fixture = new Fixture();

const wd = document.getElementById('with-dragger');
const wod = document.getElementById('without-dragger');
const ddWithDragger = new DragonDrop(wd, {
  item: '.with-dragger-item',
  activeClass: 'foo-active',
  announcement: {
    grabbed: el => `${el.querySelector('span').innerHTML} was grabbed`,
    dropped: el => `${el.querySelector('span').innerHTML} was dropped`
  }
});
const ddWithoutDragger = new DragonDrop(wod, {
  item: '.without-dragger-item',
  dragger: false
});

test('properly merges user options with defaults', t => {
  t.plan(7);
  const testEl = document.createElement('div');
  testEl.innerHTML = '<span>The stuff</span>';

  const options = ddWithDragger.options;
  const { dragger, inactiveClass, announcement } = defaults;

  t.is(options.item, '.with-dragger-item');
  t.is(options.dragger, dragger);
  t.is(options.activeClass, 'foo-active');
  t.is(options.inactiveClass, inactiveClass);
  t.is(options.announcement.grabbed(testEl), 'The stuff was grabbed');
  t.is(options.announcement.dropped(testEl), 'The stuff was dropped');
  t.is(
    options.announcement.reorder(testEl, [testEl]),
    announcement.reorder(testEl, [testEl])
  );
});

test('properly sets element ref properties', t => {
  t.plan(4);
  const items = queryAll('#with-dragger li');
  const draggers = queryAll('#with-dragger li button');

  t.deepEqual(ddWithDragger.items, items);
  t.deepEqual(ddWithDragger.draggers, draggers);

  const woItems = queryAll('#without-dragger li');

  t.deepEqual(ddWithoutDragger.items, woItems);
  t.deepEqual(ddWithoutDragger.draggers, woItems);
});

test('adds the right element attrs/props', t => {
  t.plan(2);
  const count = ddWithDragger.draggers.length;
  t.is(count, queryAll('button[tabindex="0"]', wd).length);
  t.is(count, queryAll('[role="button"]', wd).length);
});

test('instantiates a new LiveRegion', t => {
  t.plan(1);
  t.is(typeof ddWithoutDragger.liveRegion, 'object');
});

test('toggles aria-pressed/data-drag-on attributes when a dragger is clicked', t => {
  t.plan(4);
  const item = ddWithoutDragger.items[0];

  t.true(item.getAttribute('aria-pressed') !== 'true');
  t.true(item.getAttribute('data-drag-on') !== 'true');

  item.click();

  t.true(item.getAttribute('aria-pressed') === 'true');
  t.true(item.getAttribute('data-drag-on') === 'true');

  item.click(); // toggle it back off
});

// test('dropped/grabbed announcement when a dragger is clicked');
// test('clicks dragger when ENTER is pressed');
// test('clicks dragger when SPACE is pressed');
// test('properly moves item up when LEFT or UP is pressed and dragger is pressed');
// test('properly moves item down when DOWN or RIGHT is pressed and dragger is pressed');
// test('does nothing when arrow keys are pressed and dragger is not pressed');
// test('drops the item when tab is pressed');
// test('cancels reorder and restores list to initial order');

test('teardown', t => {
  fixture.destroy();
  t.end();
});
