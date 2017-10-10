/**
 * TODO:
 * - Dragula supports handles (the "move" option
 * (function))...if handle is provided, configure this
 *
 * - Idea for mobile support: Press and item to pick it up (how it already works) and then
 * click a different item to insert the item at that location
 *    - may not be a great idea because it would have to be smart about placing the dropped item
 *    before or after the target item.
 */

import dragula from 'dragula';
import LiveRegion from 'live-region';
import mergeOptions from 'merge-options';
import createDebug from 'debug';
import Emitter from 'component-emitter';

import defaults from './lib/defaults';
import queryAll from './lib/query-all';

const debug = createDebug('drag-on-drop:index');

export default class DragonDrop {
  /**
   * Dragon Drop
   * @param  {HTMLElement} container - The containing list
   * @param  {Object} userOptions - The user provided options
   *
   * @option {String} item - The selector for the drag items (qualified within
   *                         container). Defaults to `'li'`.
   * @option {String} handle - The selector for the handle. If set to
   *                            false, the entire item will be used as the draggable region.
   *                            Defaults to `'button'`.
   * @option {String} activeClass - The class to be added to the item being dragged.
   *                                Defaults to `'dragon-active'`.
   * @option {String} inactiveClass - The class to be added to all of the other
   *                                  items when an item is being dragged. Defaults
   *                                  to `'dragon-inactive'`.
   * @option {Object} annnouncement - The configuration object for live region announcements
   * @option {Function} announcement.grabbed - The function called when an item is picked up.
   *                                           The currently grabbed element along with an
   *                                           array of all items are passed as arguments
   *                                           respectively. The function should return a
   *                                           string of text to be announced in the live region.
   * @option {Function} announcement.dropped - The function called with an item is dropped. The
   *                                           newly dropped item along with an array of items
   *                                           are passed as arguments respectively. The function
   *                                           should return a string of text to be announced in
   *                                           the live region.
   * @option {Function} announcement.reorder - The function called when the list has been reordered.
   *                                           The newly dropped item along with an array of items
   *                                           are passed as arguments respectively. The function
   *                                           should return a string of text to be announced in
   *                                           the live region.
   * @option {Function} announcement.cancel - The function called when the reorder is cancelled
   *                                          (via ESC). No arguments passed in.
   */
  constructor(container, userOptions) {
    // make the dragon an emitter
    Emitter(this);
    // init mouse drag via dragula
    this.dragula = dragula([container]);
    // init live region for custom announcements
    this.liveRegion = new LiveRegion({
      ariaLive: 'assertive',
      ariaRelevant: 'additions',
      ariaAtomic: 'true'
    });
    // initialize elements / events
    this
      .initOptions(userOptions)
      .initElements(container)
      .mouseEvents();

    debug('dragon initialized: ', this);

    return this;
  }

  /**
   * Sets the dragon drop options (extending user opts with defaults)
   * @param  {Object} userOptions the user provided options
   */
  initOptions(userOptions) {
    userOptions = userOptions || {};
    userOptions.announcement = userOptions.announcement || {};
    this.options = mergeOptions({}, defaults, userOptions);

    return this;
  }

  /**
   * Sets all element refs
   * @param {HTMLElement} container the containing element
   */
  initElements(container) {
    const { activeClass, inactiveClass } = this.options;

    this.container = container;
    this.setItems();

    const cachedItems = this.items;

    // set all attrs/props/events on handle elements
    this.handles.forEach((handle, i) => {
      handle.tabIndex = 0; // ensure it is focusable

      if (handle.tagName !== 'BUTTON') {
        handle.setAttribute('role', 'button');
      }

      // events
      handle.addEventListener('keydown', this.onKeydown.bind(this));
      handle.addEventListener('click', () => {
        const wasPressed = handle.getAttribute('data-drag-on') === 'true';
        const type = wasPressed ? 'dropped' : 'grabbed';

        // clean up
        this.handles // TODO: This can probably be tied into the below items iteration
          .filter(h => h.getAttribute('aria-pressed') === 'true')
          .forEach(h => {
            h.setAttribute('aria-pressed', 'false');
            h.setAttribute('data-drag-on', 'false');
            h.classList.remove(activeClass);
          });

        handle.setAttribute('aria-pressed', `${!wasPressed}`);
        handle.setAttribute('data-drag-on', `${!wasPressed}`);

        this.announcement(type, cachedItems[i]);
        this.emit(type, container, cachedItems[i]);

        // configure classes (active and inactive)
        this.items.forEach(item => {
          const method = !wasPressed ? 'add' : 'remove';
          const isTarget = item === handle || item.contains(handle);

          item.classList[(isTarget && !wasPressed) ? 'add' : 'remove'](activeClass);
          item.classList[(isTarget && !wasPressed) ? 'remove' : method](inactiveClass);
        });

        if (!wasPressed) {
          // cache the initial order to allow for escape cancellation
          this.cachedItems = queryAll(this.options.item, container);
        }
      });
    });

    return this;
  }

  setItems() {
    const opts = this.options;
    this.items = queryAll(opts.item, this.container);
    this.handles = opts.handle
      ? queryAll([opts.item, opts.handle].join(' '), this.container)
      : this.items;

    return this;
  }

  onKeydown(e) {
    const { target, which } = e;
    const isDrag = () => target.getAttribute('data-drag-on') === 'true';

    switch (which) {
      case 13:
      case 32:
        e.preventDefault();
        target.click();

        break;
      case 37:
      case 38:
      case 39:
      case 40:
        if (isDrag()) {
          e.preventDefault();
          this.arrow(which, target);
        }

        break;
      case 9:
        if (isDrag()) {
          target.click();
        }

        break;
      case 27:
        if (isDrag()) {
          target.click();
          this.cancel();
        }
    }

    return this;
  }

  arrow(which, target) {
    const handles = this.handles;
    const items = this.items;
    const isUp = which === 37 || which === 38;
    const index = handles.indexOf(target);
    const adjacentIndex = isUp ? index - 1 : index + 1;
    const adjacentItem = handles[adjacentIndex];

    if (!adjacentItem) { // prevents circularity
      return;
    }

    const oldItem = items[index];
    const newItem = items[adjacentIndex];
    const refNode = isUp ? newItem : newItem.nextElementSibling;
    // move the item in the DOM
    oldItem.parentNode.insertBefore(oldItem, refNode);

    target.focus();
    this
      .setItems()
      .emit('reorder', this.container, oldItem)
      .announcement('reorder', oldItem);

    return this;
  }

  announcement(type, item) {
    debug(`${type} announcement`, item);
    const config = this.options.announcement || {};
    const funk = config[type];

    if (funk && typeof funk === 'function') {
      const msg = funk(item, this.items);
      this.liveRegion.announce(msg, 5e3);
      this.emit('announcement', msg);
    }

    return this;
  }

  mouseEvents() {
    this.dragula.on('drag', el => {
      this.announcement('grabbed', el);
    });

    this.dragula.on('drop', el => {
      this
        .announcement('dropped', el)
        .setItems();
    });

    return this;
  }

  cancel() {
    // cache active element so it can be focused after reorder
    const focused = document.activeElement;
    // restore the order of the list
    this.cachedItems.forEach(item => this.container.appendChild(item));
    this.items = this.cachedItems;
    // ensure the handle stays focused
    focused.focus();
    this
      .announcement('cancel')
      .emit('cancel');

    return this;
  }
}

// make window.DragonDrop available rather than window.DragonDrop.default
module.exports = DragonDrop;
