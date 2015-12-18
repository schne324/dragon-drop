
/*global jQuery*/
;(function($){
  'use strict';

  var defaults = {
    itemSelector: 'li', // qualified within `this`
    dragSelector:  '.dragon', // qualified within `itemSelector` (optional, if not provided itemSelector will be used as dragSelector)
    activeClass: 'drag-on',
    inactiveClass: null,
    onChange: null
  };

  //             TODO
  // -----------------------------------
  // 1) Add `mouseDrag` options object:
  // mouseDrag: {
  //   key: 'Any options user wishes to pass directly to `sortable`'
  // }

  $.fn.dragonDrop = function (userOpts) {
    var options = $.extend(options, defaults, userOpts);
    var mouseOpts = {
      placeholder: 'dragon-placeholder',
      items: options.itemSelector,
      cancel: '',
      forcePlaceholderSize: true
    };

    return this.each(function () {
      var $items, $dragItems;
      var $container = $(this);

      if (options.onChange) {
        mouseOpts.stop = function (_, ui) {
          options.onChange.call(this, ui.item, $container.find(options.itemSelector));
        };
      }

      $container.sortable(mouseOpts);

      // update refs after mouse drag changes dom
      $container.on('sortupdate', updateItems);

      setup();

      function setup() {
        updateItems();

        $dragItems
          .each(function (_, dragItem) {
            var $dragItem = $(dragItem);

            $dragItem
              .data('drag-on', false)
              .prop('tabIndex', 0)
              .attr({
                'role': 'button',
                'aria-grabbed': false,
                'aria-dropeffect': 'move'
              })
              .off('keydown.dragon')
              .on('keydown.dragon', onDraggableKeydown)
              .off('click.dragon')
              .on('click.dragon', onDraggableClick);
          });

        if (options.activeClass) {
          $items.removeClass(options.activeClass);
        }
        if (options.inactiveClass) {
          $items.removeClass(options.inactiveClass);
        }
      }

      function updateItems() {
        $items = $container.find(options.itemSelector);
        $dragItems = options.dragSelector ?
                      $items.find(options.dragSelector) :
                      $items;
      }

      function onDraggableClick() {
        updateItems();
        var $item = $(this);
        var itemIndex = $.inArray(this, $dragItems);
        var $listItem = $items.eq(itemIndex);
        var isDragging = $item.data('drag-on');

        // toggle stuff
        $item.data('drag-on', !isDragging);

        if (options.activeClass) {
          $listItem.toggleClass(options.activeClass);
        }

        if (options.inactiveClass) {
          $items
            .filter(function () {
              return !$(this).is($item) && !$(this).is($item.closest(options.itemSelector));
            })
            .toggleClass(options.inactiveClass);
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

        updateItems(); // re-index the stuffs

        if (options.onChange) {
          options.onChange.call($container[0], $oldItem, $items);
        }
      }

      function endOfLine(i, isUp, len) {
        return i === -1  || isUp && i === 0 || !isUp && i === len - 1;
      }
    });
  };
})(jQuery);