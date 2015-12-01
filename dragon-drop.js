/*global jQuery*/
;(function($){
  'use strict';

  var defaults = {
    itemSelector: 'li', // qualified within `this`
    dragSelector:  '.dragon', // qualified within `this` (optional, if not provided itemSelector will be used as dragSelector)
    activeClass: 'drag-on'
  };

  // TODO: According to WCAG:
  // ...authors SHOULD show a visual indication of potential drop targets.

  $.fn.dragonDrop = function (userOpts) {
    var options = $.extend(options, defaults, userOpts);
    
    return this.each(function () {
      var $items, $dragItems;
      var $container = $(this);

      updateItems();

      $dragItems
        .data('drag-on', false)
        .prop('tabIndex', 0)
        .attr({
          'role': 'button',
          'aria-grabbed': 'false',
          'aria-dropeffect': 'move'
        })
        .off('keydown', onDraggableKeydown)
        .on('keydown', onDraggableKeydown)
        .off('click', onDraggableClick)
        .on('click', onDraggableClick);

      function updateItems() {
        $items = $container.find(options.itemSelector);

        if (options.dragSelector) {
          $dragItems = $items.find(options.dragSelector);
        } else {
          $dragItems = $items;
        }
      }

      function onDraggableClick() {
        var $item = $(this);
        var isDragging = $item.data('drag-on');
        
        // toggle stuff
        $item.data('drag-on', !isDragging);

        if (options.activeClass) {
          $item.toggleClass(options.activeClass);
        }

        $item.attr('aria-grabbed', $item.data('drag-on'));
      }

      function onDraggableKeydown(e) {
        var which = e.which;
        var target = e.target;
        var $target = $(target);

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
            if ($target.data('drag-on')) {
              e.preventDefault();
              arrowHandler(which, target);
            }
            break;
          case 9:
            if ($target.data('drag-on')) {
              target.click();
            }
        }
      }

      function arrowHandler(key, dragItem) {
        var isUp = key === 37 || key === 38;
        var index = $.inArray(dragItem, $dragItems);
        
        if (endOfLine(index, isUp, $dragItems.length)) {
          return;
        }
        
        var $adjacentItem = $dragItems.eq((isUp) ? index - 1 : index + 1);

        if ($adjacentItem.length) {
          swap(dragItem, $adjacentItem[0], isUp);
        }
      }

      function swap(old, newDrag, isUp) {
        var newIndex = $.inArray(newDrag, $dragItems);
        var oldIndex = $.inArray(old, $dragItems);
        var $newItem = $items.eq(newIndex);
        var $oldItem = $items.eq(oldIndex);

        if (isUp) {
          $oldItem.insertBefore($newItem);
        } else {
          $oldItem.insertAfter($newItem);
        }

        old.focus();

        updateItems(); // re-index stuffzz
      }

      function endOfLine(i, isUp, len) {
        return i === -1  || isUp && i === 0 || !isUp && i === len - 1;
      }
    });
  };
})(jQuery);