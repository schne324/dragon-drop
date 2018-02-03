const defaults = {
  item: 'li', // qualified within container
  handle: 'button', // qualified within `item`
  activeClass: 'dragon-active', // added to item being dragged
  inactiveClass: 'dragon-inactive', // added to other items when item is being dragged
  nested: false, // if true, stops propagation on keydown / click events
  announcement: {
    grabbed: el => `Item ${el.innerText} grabbed`,
    dropped: el => `Item ${el.innerText} dropped`,
    reorder: (el, items) => {
      const pos = items.indexOf(el) + 1;
      const text = el.innerText;
      return `The list has been reordered, ${text} is now item ${pos} of ${items.length}`;
    },
    cancel: 'Reordering cancelled'
  }
};

export default defaults;
