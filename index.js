import dragula from 'dragula';
import LiveRegion from 'live-region';
import objectAssign from 'object-assign';
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
   * @option {String} dragger - The selector for the keyboard dragger. If set to
   *                            false, the entire item will be used as the dragger.
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
   */
  constructor(container, userOptions) {
    Emitter(this);
    this.initOptions(userOptions);
    this.initElements(container);

    // init mouse drag via dragula
    this.dragula = dragula([document.getElementById('demo')]);
    this.mouseEvents();
    // init live region for custom announcements
    this.liveRegion = new LiveRegion({
      ariaLive: 'assertive',
      ariaRelevant: 'additions',
      ariaAtomic: 'true'
    });
  }

  /**
   * Sets the dragon drop options (extending user opts with defaults)
   * @param  {Object} userOptions the user provided options
   */
  initOptions(userOptions) {
    userOptions = userOptions || {};
    userOptions.announcement = userOptions.announcement || {};
    const announceOpts = objectAssign(defaults.announcement, userOptions.announcement);
    // merge user opts with defaults
    this.options = objectAssign(defaults, userOptions);
    this.options.announcement = announceOpts;
    debug('dragon drop options: ', this.options);
  }

  /**
   * Sets all element refs
   * @param {HTMLElement} container the containing element
   */
  initElements(container) {
    this.container = container;
    this.setItems();

    // set all attrs/props/events on dragger elements
    this.draggers.forEach(dragger => {
      dragger.tabIndex = 0; // ensure it is focusable
      dragger.setAttribute('role', 'button');
      // TODO: if we're using a live region, should these attrs be omitted?
      dragger.setAttribute('aria-grabbed', 'false');
      dragger.setAttribute('aria-dropeffect', 'move');
      // events
      dragger.addEventListener('keydown', this.onKeydown.bind(this));
      dragger.addEventListener('click', () => {
        const wasPressed = dragger.getAttribute('drag-on') === 'true';
        dragger.setAttribute('aria-pressed', `${!wasPressed}`);
        dragger.setAttribute('drag-on', `${!wasPressed}`);
      });
    });
  }

  setItems() {
    const opts = this.options;
    this.items = queryAll(opts.item, this.container);
    this.draggers = opts.dragger
      ? queryAll([opts.item, opts.dragger].join(' '), this.container)
      : this.items;
  }

  onKeydown(e) {
    const { target, which } = e;
    const isDrag = () => target.getAttribute('drag-on') === 'true';

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
    }
  }

  arrow(which, target) {
    const draggers = this.draggers;
    const items = this.items;
    const isUp = which === 37 || which === 38;
    const index = draggers.indexOf(target);
    const adjacentIndex = isUp ? index - 1 : index + 1;
    const adjacentItem = draggers[adjacentIndex];

    if (!adjacentItem) { // prevents circularity
      return;
    }

    const oldItem = items[index];
    const newItem = items[adjacentIndex];
    const refNode = isUp ? newItem : newItem.nextElementSibling;
    oldItem.parentNode.insertBefore(oldItem, refNode);

    target.focus();
    this.setItems();

    this.emit('change', this.container, oldItem, newItem);
    this.announcement('reorder', oldItem);
  }

  announcement(type, item) {
    const config = this.options.announcement || {};
    const funk = config[type];

    if (funk) {
      const msg = funk(item, this.items);
      this.liveRegion.announce(msg, 5e3);
    }
  }

  mouseEvents() {
    this.dragula.on('drag', el => {
      this.announcement('grabbed', el);
    });

    this.dragula.on('drop', el => {
      this.announcement('dropped', el);
    });
  }
}
