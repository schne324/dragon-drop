# dragon-drop
Keyboard accessible drag and drop reorder list

## Installation

## npm
`npm install drag-on-drop`

### bower
`bower install drag-on-drop`

### git
`git clone https://github.com/schne324/dragon-drop.git`

`cd dragon-drop`

`npm i`

`bower i`

`open example/example.html`

## Options
- `itemSelector` _(required)_: the selector for the actual items to be reordered (defaults to `'li'`).  This will be qualified within `this` (the container calling dragonDrop).
- `dragSelector` _(optional)_: the selector for the "handle" if applicable (defaults to `'.dragon'`). This is qualified within the `itemSelector` elements.
- `activeClass` _(optional)_: the class to be added to an actively dragging item - keyboard only (defaults to `'drag-on'`.
- `inactiveClass` _(optional)_: the class to be added to other items when an item is actively dragging
- `onChange` _(optional)_: a function that is invoked whenever a keyboard or mouse reorder has taken place.  The function accepts two arguments: `$item` which is a jquery reference to the newly dropped item, and `$items` which is a query collection of the entire list. `this` is also made available within the callback.
- `mouseDrag` _(optional)_: ANY sortable options the user wishes to pass through - https://github.com/voidberg/html5sortable#options - (the `placeholder` option defaults to `'dragon-placeholder'`).
- `announcement` _(optional)_: configuration object for the live region announcement
	- `textSelector` _(optional)_: the selector for element of which to grab text from. If not provided, will default to the text of the given item (defaults to `null`).
 	- `grab` _(optional)_: the desired readout for when an item is 'grabbed' (defaults to `'$1 grabbed'`). You may use:
 		- `'$1'` (the item's text)
 		- `'$2'` (the position within the list of the newly grabbed item)
 		- `'$3'` (the total number of items in the list)
 	- `drop` _(optional)_: the desired readout for when an item is 'dropped' (defaults to `'$1 dropped'`). You may use:
 		- `'$1'` (the item's text)
 		- `'$2'` (the position within the list of the newly dropped item)
 		- `'$3'` (the total number of items in the list)
 	- `reorder` _(optional)_: the desired readout for when the list is 'reordered' (defaults to `'The list has been reordered. $1 is now item $2 of $3'`). You may use:
 		- `'$1'` (the newly moved item's text)
 		- `'$2'` (the position within the list of the newly moved item)
 		- `'$3'` (the total number of items in the list)

## Example
given the following html...
```html
<ul class="reorder-list">
	<li class="reorderme">
		<span class="item-text">1</span>
		<button class="reorder-handle">reorder</button>
	</li>
	<li class="reorderme">
		<span class="item-text">2</span>
		<button class="reorder-handle">reorder</button>
	</li>
	<li class="reorderme">
		<span class="item-text">3</span>
		<button class="reorder-handle">reorder</button>
	</li>
</ul>
```

and the following js...
```js
$('.reorder-list').dragonDrop({
	itemSelector: 'li.reorderme',
	dragSelector: 'button.reorder-handle',
	activeClass: 'active',
	onChange: function ($item, $items) {
		alert($item.text() + ' has been dropped!');
	},
	mouseDrag: {placeholderClass: 'foo-placeholder'},
	announcement: {
		textSelector: '.item-text',
		grab: 'the dragon has grabbed $1',
		drop: 'the dragon has dropped $1',
		reorder: 'The dragon has formed a new order... $1 is now item $2 of $3'
	}
});
```

## Custom Examples
First, run `npm install`, then `bower install` to ensure all the dependencies are installed.
Then, you can edit the `example/example.jade` and the `example/styles.styl` files and run `gulp` to build the changes.
(`gulp watch` is available to prevent you from executing `gulp` after each and every change)

## Dependencies
This plugin leverages the html5 sortable plugin https://github.com/voidberg/html5sortable and adds accessible/keyboard enhancements.
