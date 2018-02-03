# Dragon Drop

Keyboard accessible drag-and-drop reorder list.

<img alt="Dragon Drop" src="/demo/dragondrop_sticker.png" width="400" />

## Demo

http://schne324.github.io/dragon-drop/demo/

<img alt="" role="presentation" src="/demo/dragon-drop-screenshot.png" width="400" />

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
    dragonDrop.initElements();
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

#### `container` (required)
The one and only required parameter is the list HTMLElement that contains the sortable items.

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
Set to true if nested lists are being used (click and keydown events will not bubble up (`e.stopPropagation()` will be applied))

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

## Properties
```js
const dragonDrop = new DragonDrop(container);
```
### `dragonDrop.items` _Array_
An array of each of the sortable item element references.

### `dragonDrop.handles` _Array_
An array of each of the handle item element references. If instance doesn't have handles, this will be identical to `dragonDrop.items`.

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
Fires when an list is reordered. The callback is passed the container along with the item.

### Example use of events

```js
dragonDrop
  .on('grabbed', (container, item) => console.log(`Item ${item.innerText} grabbed`))
  .on('dropped', (container, item) => console.log(`Item ${item.innerText} dropped`))
  .on('reorder', (container, item) => console.log(`Reorder: ${item.innerText} has moved`))
  .on('cancel', () => console.log('Reordering cancelled'));
```

**NOTE** for mouse drag/drop event hooks the `dragula` property is exposed for dragula's events
```js
dragonDrop.dragula.on('drop', ...);
```

## Debugging

Set the following localStorage option to debug dragonDrop

```js
localStorage.debug = 'drag-on-drop:*';
```

## Thanks!

A special thanks to Aaron Pearlman for the logo.

Another special thanks to contributors/maintainers of [dragula](https://github.com/bevacqua/dragula) which is used for all of the mouse behavior/interaction for dragon drop!
