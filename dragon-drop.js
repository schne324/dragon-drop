
/*global jQuery*/
;(function($){
  'use strict';

  var defaults = {
    itemSelector: 'li', // qualified within `this`
    dragSelector:  '.dragon', // qualified within `itemSelector` (optional, if not provided itemSelector will be used as dragSelector)
    activeClass: 'drag-on',
    inactiveClass: null,
    onChange: null,
    mouseDrag: null, // ANY jquery ui sortable options the user wishes to pass through
    announcement: { // these are all given 3 arguments in this exact order: the item's text, its index, and the total length of items
      textSelector: null, // if not provided, will default to the text of the given item
      grab: '$1 grabbed.',
      drop: '$1 dropped.',
      reorder: 'The list has been reordered. $1 is now item $2 of $3'
    }
  };
  var DATA_ATTR = 'dragon-drop-generated-live-region';

  $.fn.dragonDrop = function (userOpts) {
    var options = $.extend(options, defaults, userOpts);
    var mouseOpts = options.mouseDrag || {
      placeholder: 'dragon-placeholder',
      items: options.itemSelector,
      cancel: '',
      forcePlaceholderSize: true
    };

    return this.each(function () {
      var $items, $dragItems;
      var $container = $(this);
      var $liveRegion;
      if ($(document.body).data(DATA_ATTR)) {
        $liveRegion = jQuery($(document.body).data(DATA_ATTR));
      } else {
        $liveRegion = jQuery('<div />');

        $liveRegion
          // polite announcement attributes
          .attr({
            'aria-live': 'polite',
            'aria-relevant': 'additions',
            'aria-atomic': 'true'
          })
          // make it 'offscreen'
          .css({
            'position': 'absolute',
            'clip': 'rect(1px, 1px, 1px, 1px)',
            'width': '1px',
            'height': '1px',
            'margin-top': '-1px'
          })
          // insert it into the DOM
          .appendTo(jQuery(document.body));

        // we only need to add this once per page load...
        // (we don't want to keep adding new regions if its not needed)
        $(document.body).data(DATA_ATTR, $liveRegion[0]);
      }

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
              .one('click.dragon', onDraggableClick);
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

      function cleanUp() {
        if (options.activeClass) {
          $items.removeClass(options.activeClass);
        }

        if (options.inactiveClass) {
          $items.removeClass(options.inactiveClass);
        }
        $dragItems.data('drag-on', false);
      }

      function onDraggableClick() {
        updateItems();
        var item = this;
        var $item = $(item);
        var itemIndex = $.inArray(item, $dragItems);
        var $listItem = $items.eq(itemIndex);
        var wasDragging = $item.data('drag-on');
        var isDragging = !wasDragging;
        cleanUp();

        if (isDragging) {
          // toggle stuff
          $item.data('drag-on', isDragging);

          if (options.activeClass) {
            $listItem.toggleClass(options.activeClass);
          }

          if (options.inactiveClass) {
            $items
              .removeClass(options.inactiveClass)
              .filter(function () {
                return !$(this).is($item) && !$(this).is($item.closest(options.itemSelector));
              })
              .toggleClass(options.inactiveClass);
          }
        }
        $item.attr('aria-pressed', isDragging);
        $item.attr('aria-grabbed', isDragging);

        var ann = options.announcement;
        if (ann && ann.grab && ann.drop) {
          var $textElement = (ann.textSelector) ? $listItem.find(ann.textSelector) : $item;
          var text = $textElement.text(); // the item's text
          var textOpt = isDragging ? ann.grab : ann.drop;
          var annText = replacer(textOpt, [text, itemIndex, $items.length]);
          // kick off the actual announcement
          if (annText) {
            setTimeout(function () {
              $liveRegion.html('<p>' + annText + '</p>');
            });
          }
        }

        // fake debouncer because NVDA likes to fire mousedowns and clicks...
        // (this prevents the undesired double click)
        setTimeout(function () {
          $dragItems.one('click.dragon', onDraggableClick);
        }, 250);
      }

      function onDraggableKeydown(e) {
        var which = e.which;
        var target = e.target;
        var $target = $(target);

        switch (which) {
          case 13:
          case 32:
            e.preventDefault();
            $target.click();
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

        var a = options.announcement;
        if (a && a.reorder) {
          var itemText = (a.textSelector) ?
                          $oldItem.find(a.textSelector).text() :
                          $oldItem.text();
          var annString = replacer(a.reorder, [
            itemText,
            $.inArray($oldItem[0], $items) + 1,
            $items.length
          ]);

          if (annString) {
            setTimeout(function () {
              $liveRegion.html('<p>' + annString + '</p>');
            });
          }
        }
      }

      function endOfLine(i, isUp, len) {
        return i === -1  || isUp && i === 0 || !isUp && i === len - 1;
      }
    });
  };

  function replacer(text, replacees) {
    return text.replace(/\$\d/g, function (match) {
      var idx = parseInt(match.substr(1)) - 1; // zero-base it
      return replacees[idx];
    });
  }
})(jQuery);