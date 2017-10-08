
export default class Fixture {
  constructor() {
    this.withoutDragger = document.createElement('div');
    this.withDragger = document.createElement('div');

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

    document.body.appendChild(this.withoutDragger);
    document.body.appendChild(this.withDragger);
  }

  destroy() {
    document.body.removeChild(this.withoutDragger);
    document.body.removeChild(this.withDragger);
  }
}
