const queryAll = (selector, context) => {
  context = context || document;
  return Array.prototype.slice.call(
    context.querySelectorAll(selector)
  );
};

export default queryAll;
