# dragon-drop
Keyboard accessible drag and drop reorder list

## Installation
`bower install drag-on-drop`

## Options
- `itemSelector` _(required)_: the selector for the actual items to be reordered (defaults to `'li'`).  This will be qualified within `this` (the container calling dragonDrop).
- `dragSelector` _(optional)_: the selector for the "handle" if applicable (defaults to `'.dragon'`). This is qualified within the `itemSelector` elements.
- `activeClass` _(optional)_: the class that is added to an actively dragging item - keyboard only (defaults to `'drag-on'`.
- `onChange` _(optional)_: a function that is invoked whenever a keyboard or mouse reorder has taken place.  The function accepts two arguments: `$item` which is a jquery reference to the newly dropped item, and `$items` which is a query collection of the entire list. `this` is also made available within the callback.

## Example
```js
$('.reorder-list').dragonDrop({
	itemSelector: 'li.reorderme',
	dragSelector: 'button.reorder-handle',
	activeClass: 'active',
	onChange: function ($item, $items) {
		alert($item.text() + ' has been dropped!');
	}
});
```