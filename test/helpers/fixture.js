
export default class Fixture {
  constructor() {
    this.withoutDragger = document.createElement('div');
    this.withDragger = document.createElement('div');
    this.nested = document.createElement('div');
    this.dragula = document.createElement('div');

    this.withoutDragger.innerHTML = `
      <ul id="without-dragger">
        <li class="without-dragger-item"><span>1</span></li>
        <li class="without-dragger-item"><span>2</span></li>
        <li class="without-dragger-item"><span>3</span></li>
      </ul>
    `;

    this.withDragger.innerHTML = `
      <ul id="with-dragger">
        <li class="with-dragger-item"><button>Drag me</button><span>1</span></li>
        <li class="with-dragger-item"><button>Drag me</button><span>2</span></li>
        <li class="with-dragger-item"><button>Drag me</button><span>3</span></li>
      </ul>
    `;

    this.nested.innerHTML = `
      <ul id="nested">
        <li class="top-level">Hello</li>
        <li class="top-level">World</li>
        <li class="top-level">
          <span>With sublist</span>
          <ul id="sublist">
            <li>Subitem</li>
            <li>Subitem</li>
            <li>Subitem</li>
          </ul>
        </li>
      </ul>
    `;
    this.dragula.innerHTML = '<ul id="for-dragula"><li>Hi</li><li>Bye</li></ul>';

    document.body.appendChild(this.withoutDragger);
    document.body.appendChild(this.withDragger);
    document.body.appendChild(this.nested);
    document.body.appendChild(this.dragula);
  }

  destroy() {
    document.body.removeChild(this.withoutDragger);
    document.body.removeChild(this.withDragger);
    document.body.removeChild(this.nested);
  }
}
