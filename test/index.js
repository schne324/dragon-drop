import 'jsdom-global/register';
import test from 'tape';
import simulant, { fire } from 'simulant';
import proxyquire from 'proxyquire';
import { spy, stub } from 'sinon';
import defaults from '../lib/defaults';
import queryAll from '../lib/query-all';
import Fixture from './helpers/fixture';

proxyquire.noCallThru();

const on = spy();
const dragula = stub();
dragula.returns({ on });

const DragonDrop = proxyquire('../index', { dragula });
const fixture = new Fixture();

const wd = document.getElementById('with-dragger');
const wod = document.getElementById('without-dragger');
const nested = document.getElementById('nested');
const sublist = document.getElementById('sublist');
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
  handle: false,
  dragulaOptions: {
    boognish: true
  }
});
new DragonDrop(nested, {
  handle: false,
  nested: true,
  item: '.top-level',
  dragulaOptions: {
    freds: 7,
    accepts: 'hello',
    moves: 'world'
  }
});
const ddSublist = new DragonDrop([sublist], {
  nested: true
});

test('properly merges user options with defaults', t => {
  t.plan(7);
  const testEl = document.createElement('div');
  testEl.innerHTML = '<span>The stuff</span>';

  const options = ddWithDragger.options;
  const { handle, inactiveClass, announcement } = defaults;

  t.is(options.item, '.with-dragger-item');
  t.is(options.handle, handle);
  t.is(options.activeClass, 'foo-active');
  t.is(options.inactiveClass, inactiveClass);
  t.is(options.announcement.grabbed(testEl), 'The stuff was grabbed');
  t.is(options.announcement.dropped(testEl), 'The stuff was dropped');
  t.is(
    options.announcement.reorder(testEl, [testEl]),
    announcement.reorder(testEl, [testEl])
  );
});

test('properly blends in user\'s `dragulaOptions` without clobbering reserved options', t => {
  t.equal(dragula.callCount, 4);
  // the `ddWithDragger` call which passes 0 dragulaOptions
  const ddWithDraggerArgs = dragula.getCall(0).args;
  t.equal(Object.keys(ddWithDraggerArgs[1]).length, 1);
  t.equal(typeof ddWithDraggerArgs[1].moves, 'function');
  // the `ddWithoutDragger` call which passes arbitrary `boognish: true` as only dragulaOptions
  const ddWithoutDraggerArgs = dragula.getCall(1).args;
  t.deepEqual(ddWithoutDraggerArgs[1], {
    boognish: true
  });

  // the 2 calls as a result of the `nested: true` call
  const nestedCall1Args = dragula.getCall(2).args;
  const nestedCall2Args = dragula.getCall(3).args;
  t.equal(Object.keys(nestedCall1Args[1]).length, 1);
  t.equal(Object.keys(nestedCall2Args[1]).length, 1);
  t.equal(typeof nestedCall1Args[1].moves, 'function');
  t.equal(typeof nestedCall2Args[1].accepts, 'function');
  t.end();
});

test('properly sets element ref properties', t => {
  t.plan(4);
  const items = queryAll('#with-dragger li');
  const draggers = queryAll('#with-dragger li button');

  t.deepEqual(ddWithDragger.items, items);
  t.deepEqual(ddWithDragger.handles, draggers);

  const woItems = queryAll('#without-dragger li');

  t.deepEqual(ddWithoutDragger.items, woItems);
  t.deepEqual(ddWithoutDragger.handles, woItems);
});

test('methods are chainable', t => {
  t.plan(1);

  ddWithoutDragger
    .on('foo', () => t.pass())
    .announcement('foo')
    .announcement('bar')
    .emit('foo');
});

test('adds the right element attrs/props', t => {
  t.plan(2);
  const count = ddWithDragger.handles.length;
  t.is(count, queryAll('button[tabindex="0"]', wd).length);
  t.is(count, queryAll('button, [role="button"]', wd).length);
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

test('only allows one (the most recently pressed) item to be pressed', t => {
  t.plan(3);
  const item1 = ddWithoutDragger.items[0];
  const item2 = ddWithoutDragger.items[1];

  item1.click();
  t.true(item1.getAttribute('aria-pressed') === 'true');

  item2.click();
  t.false(item1.getAttribute('aria-pressed') === 'true');
  t.true(item2.getAttribute('aria-pressed') === 'true');

  item2.click(); // toggle it back off
});

test('dropped/grabbed announcement when a dragger is clicked', t => {
  t.plan(1);
  // clean up from previous tests
  ddWithDragger.liveRegion.region.innerHTML = '';
  // click the dragger
  const dragger = ddWithDragger.handles[0];
  dragger.click();

  t.equal(ddWithDragger.liveRegion.region.lastChild.innerHTML, '1 was grabbed');
  dragger.click();
});

test('clicks dragger when ENTER is pressed', t => {
  t.plan(1);

  const item = ddWithoutDragger.items[1];
  const onItemClick = () => {
    item.removeEventListener('click', onItemClick);
    item.click(); // unpress it
    t.pass();
  };
  item.addEventListener('click', onItemClick);

  const e = simulant('keydown', { which: 13 });
  fire(item, e);

});

test('clicks dragger when SPACE is pressed', t => {
  t.plan(1);

  const item = ddWithoutDragger.items[1];
  const onItemClick = () => {
    item.removeEventListener('click', onItemClick);
    item.click(); // unpress it
    t.pass();
  };
  item.addEventListener('click', onItemClick);

  const e = simulant('keydown', { which: 32 });
  fire(item, e);
});

test('clicks a pressed item when TAB is pressed', t => {
  t.plan(1);
  const item = ddWithoutDragger.items[1];
  item.click(); // press it
  const onItemClick = () => {
    item.removeEventListener('click', onItemClick);
    item.click(); // unpress it
    t.pass();
  };
  item.addEventListener('click', onItemClick);
  const e = simulant('keydown', { which: 9 });
  fire(item, e);
});

test('properly moves item up when LEFT or UP is pressed and dragger is pressed', t => {
  t.plan(2);

  const item = ddWithoutDragger.items[2];
  // "press" the item
  item.click();
  const firstKeydown = simulant('keydown', { which: 37 });
  // fire the left keydown
  fire(item, firstKeydown);

  const itemsAfterLeft = queryAll('li', ddWithoutDragger.container);
  t.is(itemsAfterLeft.indexOf(item), 1);

  const secondKeydown = simulant('keydown', { which: 38 });
  // fire the up keydown
  fire(item, secondKeydown);

  const itemsAfterUp = queryAll('li', ddWithoutDragger.container);
  item.click(); // unpress it
  t.is(itemsAfterUp.indexOf(item), 0);
});

test('properly moves item down when DOWN or RIGHT is pressed and dragger is pressed', t => {
  t.plan(2);

  const item = ddWithDragger.handles[0];
  // "press" the item
  item.click();
  const firstKeydown = simulant('keydown', { which: 40 });
  // fire the down keydown
  fire(item, firstKeydown);

  const itemsAfterDown = queryAll('button', ddWithDragger.container);
  t.is(itemsAfterDown.indexOf(item), 1);

  const secondKeydown = simulant('keydown', { which: 39 });
  // fire the right keydown
  fire(item, secondKeydown);

  // fire it a few more times to test capping out
  fire(item, secondKeydown);
  fire(item, secondKeydown);
  fire(item, secondKeydown);
  fire(item, secondKeydown);

  const itemsAfterRight = queryAll('button', ddWithDragger.container);
  item.click(); // unpress it
  t.is(itemsAfterRight.indexOf(item), 2);
});

test('does nothing when arrow keys are pressed and dragger is not pressed', t => {
  t.plan(2);

  const item = ddWithDragger.handles[2];
  t.true(item.getAttribute('data-drag-on') !== 'true');

  const e = simulant('keydown', { which: 38 });
  fire(item, e);
  const items = queryAll('button', ddWithDragger.container);
  t.is(items.indexOf(item), 2);
});

test('drops the item when tab is pressed', t => {
  t.plan(2);

  const item = ddWithoutDragger.handles[0];
  item.click(); // press it
  t.is(item.getAttribute('aria-pressed'), 'true');
  item.click(); // unpress it
  t.is(item.getAttribute('aria-pressed'), 'false');
});

test('cancels reorder and restores list to initial order when escape is pressed', t => {
  t.plan(3);

  const item = ddWithDragger.handles[0];
  item.click(); // press it

  const e = simulant('keydown', { which: 40 }); // down

  fire(item, e);
  t.is(queryAll('button', ddWithDragger.container).indexOf(item), 1);

  const event = simulant('keydown', { which: 27 });
  fire(item, event);
  t.is(queryAll('button', ddWithDragger.container).indexOf(item), 0);
  t.is(item.getAttribute('aria-pressed'), 'false');
});

test('prevents click and keydown events from bubbling up given `nested: true`', t => {
  t.plan(1);

  let called = false;
  ddSublist[0].onKeydown({
    which: 32,
    stopPropagation: () => called = true,
    preventDefault: () => {},
    target: {
      click: () => {}
    }
  });

  t.ok(called);
});

test('handles dragula\'s "drag" and "drop" events', t => {
  const handlers = {};
  const dragList = document.getElementById('for-dragula');
  const D = proxyquire('../index', {
    dragula: () => ({
      on: (type, cb) => handlers[type] = cb
    })
  });

  const d = new D(dragList, {
    item: 'li'
  });
  spy(d, 'announcement');
  handlers.drag(dragList.firstChild);
  t.equal(d.announcement.callCount, 1);
  t.equal(d.announcement.getCall(0).args[0], 'grabbed');

  handlers.drop(dragList.firstChild);
  t.equal(d.announcement.callCount, 2);
  t.equal(d.announcement.getCall(1).args[0], 'dropped');

  t.end();
});

test('teardown', t => {
  fixture.destroy();
  t.pass();
  t.end();
});
