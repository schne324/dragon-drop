# Dragon Drop

[![CircleCI](https://circleci.com/gh/schne324/dragon-drop.svg?style=svg)](https://circleci.com/gh/schne324/dragon-drop)

Keyboard/assistive technology accessible drag-and-drop reorder list.

<img alt="Dragon Drop" src="/demo/dragondrop_sticker.png" width="400" />

## Demo

http://schne324.github.io/dragon-drop/demo/

<img alt="" role="presentation" src="/demo/dragon-drop-screenshot.png" width="400" />

## Enter the dragon...

For an in-depth look at dragon drop see the [smashing magazine article on dragon drop](https://www.smashingmagazine.com/2018/01/dragon-drop-accessible-list-reordering/)

## Installation

## npm
```bash
$ npm install drag-on-drop
```

### bower
```bash
$ bower install drag-on-drop
```

## Usage

### Browserify/Webpack

```js
import DragonDrop from 'drag-on-drop';

const dragon = new DragonDrop(container, options);
```

### In the browser

```js
const DragonDrop = window.DragonDrop;
const dragon = new DragonDrop(container, options);
```

### React

Although a DragonDrop react component doesn't exist (yet), it can be used _with_ react:

```js
class App extends Component {
  componentDidMount() {
    this.setState({
      dragonDrop: new DragonDrop(this.dragon)
    });
  }

  componentDidUpdate() {
    const { dragonDrop } = this.state;
    // this public method allows dragon drop to
    // reassess the updated items and handles
    dragonDrop.initElements(this.dragon);
  }

  render() {
    return (
      <ul className='dragon' ref={el => this.dragon = el}>
        <li>
          <button type='button' aria-label='Reorder' />
          <span>Item 1</span>
        </li>
        <li>
          <button type='button' aria-label='Reorder' />
          <span>Item 2</span>
        </li>
      </ul>
    );
  }
}
```
[Full example](https://codepen.io/schne324/pen/dZOGeG)

**NOTE** usage with react is not exactly ideal because DragonDrop uses normal DOM events not picked up by react (react doesn't know about the reordering).

### CDN (unpkg)

https://unpkg.com/drag-on-drop

## API

### `new DragonDrop(container, [options])`

#### `container` _HTMLElement|Array_ (required)

Either a single container element or an array of container elements.

#### `options` _Object_ (optional)

##### `item` _String_

The selector for the drag items (qualified within container). Defaults to
```js
'li'
```

##### `handle` _String_

The selector for the keyboard handle (qualified within the container and the selector provided for `item`). If set to `false`, the entire item will be used as the handle. Defaults to
```ks
'button'
```

##### `activeClass` _String_

The class to be added to the item being dragged. Defaults to

```js
'dragon-active'
```

##### `inactiveClass` _String_

The class to be added to all of the other items when an item is being dragged. Defaults

```js
'dragon-inactive'
```

##### `nested` _Boolean_

Set to true if nested lists are being used (click and keydown events will not bubble up (`e.stopPropagation()` will be applied)). For nested lists, you MUST pass `DragonDrop` an array of containers as the 1st parameter (see example below).

__NOTE:__ *there is a 99% chance that you'll need to use [:scope selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope) to target only a given list's items (because dragon drop would otherwise include the sub list's items for example). Using `:scope` selectors will allow you to target direct descendant children (example: `:scope > li`).*

```js
const lists = Array.from(document.querySelectorAll('.dragon-list'));
const dragons = new DragonDrop(lists, {
  nested: true,
  handle: false,
  item: ':scope > li' // IMPORTANT! a selector that targets only a single list's items
});
const [ topLevel, sublist1, sublist2 ] = dragons;

topLevel.on('grabbed', () => console.log('top-most container item grabbed'));
sublist1.on('grabbed', () => console.log('sublist 1 item grabbed'));
sublist2.on('grabbed', () => console.log('sublist 1 item grabbed'));
```

##### `dragulaOptions` _Object_

An options object passed through to dragula.

__NOTE__: `dragulaOptions.moves` will be ignored given a DragonDrop instance with `nested: false` and a truthy `handle`

__NOTE__: `dragulaOptions.moves` AND `dragulaOptions.accepts` will be ignored given a DragonDrop instance with `nested: true`

##### `announcement` _Object_

The live region announcement configuration object containing the following properties:

###### `grabbed` _Function_

The function called when an item is picked up. The currently grabbed element along with an array of all items are passed as arguments respectively. The function should return a string of text to be announced in the live region. Defaults to

```js
el => `Item ${el.innerText} grabbed`
```

###### `dropped` _Function_

The function called when an item is dropped. The newly dropped item along with an array of all items are passed as arguments respectively. The function should return a string of text to be announced in the live region. Defaults to

```js
el => `Item ${el.innerText} dropped`
```

###### `reorder` _Function_

The function called when the list has been reordered. The newly dropped item along with an array of items are passed as arguments respectively. The function should return a string of text to be announced in the live region. Defaults to

```js
(el, items) => {
  const pos = items.indexOf(el) + 1;
  const text = el.innerText;
  return `The list has been reordered, ${text} is now item ${pos} of ${items.length}`;
}
```

###### `cancel` _Function_

The function called when the reorder is cancelled (via ESC). No arguments passed in. Defaults to

```js
() => 'Reordering cancelled'
```

##### `liveRegion` _Object_

Attributes that can be overridden in on the live region:

###### `ariaLive` _string_

Optional ariaLive attribute to be passed to the live region. Valid values are "off", "polite", or "assertive". Default is "assertive".

###### `ariaRelevant` string

Optional ariaRelevant attribute to be passed to the live region. Valid values are "additions", "removals", "text", and "all". Default is "additions".

###### `ariaAtomic` boolean

Optional ariaAtomic attribute to be passed to the live region. Default is "true".

## Properties

```js
const dragonDrop = new DragonDrop(container);
```
### `dragonDrop.items` _Array_

An array of each of the sortable item element references.

### `dragonDrop.handles` _Array_

An array of each of the handle item element references. If instance doesn't have handles, this will be identical to `dragonDrop.items`.

### `dragonDrop.dragula`

A direct handle on the `dragula` instance created by `dragonDrop`

### Example with options

```js
const list = document.getElementById('dragon-list');
const dragonDrop = new DragonDrop(list, {
  item: 'li',
  handle: '.handle',
  announcement: {
    grabbed: el => `The dragon has grabbed ${el.innerText}`,
    dropped: el => `The dragon has dropped ${el.innerText}`,
    reorder: (el, items) => {
      const pos = items.indexOf(el) + 1;
      const text = el.innerText;
      return `The dragon's list has been reordered, ${text} is now item ${pos} of ${items.length}`;
    },
    cancel: 'The dragon cancelled the reorder'
  }
});
```

## Events

Dragon drop emit events when important stuff happens.

### `dragonDrop.on('grabbed', callback)`

Fires when an item is grabbed (with keyboard or mouse). The callback is passed the container along with the grabbed item.

### `dragonDrop.on('dropped', callback)`

Fires when an item is dropped (with keyboard or mouse). The callback is passed the container and the grabbed item.

### `dragonDrop.on('reorder', callback)`

Fires when a list is reordered. The callback is passed the container along with the item.

### `dragonDrop.on('cancel', callback)`

Fires when a user cancels reordering with the escape key. The callback is passed the keydown event that triggered the cancel.

### Example use of events

```js
dragonDrop
  .on('grabbed', (container, item) => console.log(`Item ${item.innerText} grabbed`))
  .on('dropped', (container, item) => console.log(`Item ${item.innerText} dropped`))
  .on('reorder', (container, item) => console.log(`Reorder: ${item.innerText} has moved`))
  .on('cancel', (e) => {
    console.log('Reordering cancelled');
    e.preventDefault();
  });
```

**NOTE** for mouse drag/drop event hooks the `dragula` property is exposed for dragula's events
```js
dragonDrop.dragula.on('drop', ...);
```

## Methods

### `dragonDrop.initElements(container)`

Reinitialises the list, so that newly added items can be dragged. You can do this automatically with a `MutationObserver`:

```js
const observer = new MutationObserver(() => dragonDrop.initElements(container));
observer.observe(container, {childList: true});
```

## Debugging

Set the following localStorage option to debug dragonDrop

```js
localStorage.debug = 'drag-on-drop:*';
```

## Notes on accessibility

There are certain things that are left up to the discretion of the implementer.  This is to keep `DragonDrop` less opinionated on some of the gray areas of a11y. The [demos](http://schne324.github.io/dragon-drop/demo/) show a few different approaches on associating help text with DragonDrop:

1. __Recommended__ `aria-describedby` on each control (item, or if applicable, handle). This is the safest/test approach because it guarantees that AT users will receive the instructions. [Demo of this approach](https://schne324.github.io/dragon-drop/demo/index.html#bands-head)
1. __Recommended__ `aria-labelledby` on the container/list element.  With this approach, where supported, will announce the instructions whenever the AT users enters the list (which is less verbose than the above). [Demo of this approach](https://schne324.github.io/dragon-drop/demo/index.html#schedule-head)
1. __Not recommended__`aria-describedby` on the container/list element. This approach, where supported, will only announce the instructions if the screen reader user traverses to the actual list element. [Demo of this approach](https://schne324.github.io/dragon-drop/demo/index.html#nested)

For more information regarding accessibility you can read an [accessibility review of dragon drop](https://github.com/schne324/dragon-drop/issues/6) initiated by Drupal.

## Thanks!

A special thanks to Aaron Pearlman for the logo.

Another special thanks to contributors/maintainers of [dragula](https://github.com/bevacqua/dragula) which is used for all of the mouse behavior/interaction for dragon drop!
