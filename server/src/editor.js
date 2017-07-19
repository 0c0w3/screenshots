const React = require("react");

let pos, context, editor, highlighter, highlightContext;

exports.Editor = class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tool: 'none',
      color: '#000000',
      size: '5'
    };
  }

  render() {
    let canvasHeight = document.body.scrollHeight - 100;
    return <div>
      <div className="editor-header">
        <button id="highlighter" onClick={this.onClickHighlight.bind(this)}>highlighter</button>
        <button id="pen" onClick={this.onClickPen.bind(this)}>Pen</button>
        <button id="text" onClick={this.onClickRectangle.bind(this)}>Rectangle</button>
        <button id="arrow" onClick={this.onClickArrow.bind(this)}>Arrows</button>
        <button id="erase" onClick={this.onClickErase.bind(this)}>Erase</button>
        <Picker onSelectColor={this.handleColorSelect.bind(this)} onSelectSize={this.handleSizeSelect.bind(this)}></Picker>
        <button id="save" onClick={this.onClickSave.bind(this)}>Save</button>
        <button id="cancel" onClick={this.onClickCancel.bind(this)}>Cancel</button>
        <button id="clear" onClick={this.onClickClear.bind(this)}>Clear</button>
      </div>
      <div className="main-container">
        <img src={this.props.clip.image.url} style={{height: "auto", width: this.props.clip.image.dimensions.x + "px", maxWidth: "80%"}}/>
        <div className="canvas-container" id="canvas-container">
          <canvas className="highlighter" id="highlighter" ref="highlighter" height={canvasHeight} width={window.innerWidth}></canvas>
          <canvas className="editor" id="editor" ref="editor" height={canvasHeight} width={window.innerWidth}></canvas>
        </div>
      </div>
    </div>
  }

  handleColorSelect(color) {
    this.setState({color})
  }

  handleSizeSelect(size) {
    this.setState({size});
  }

  componentDidUpdate() {
    this.edit();
  }

  onClickErase() {
    this.setState({tool: 'eraser'});
  }

  onClickCancel() {
    this.props.onCancelEdit(false);
  }

  onClickSave() {
  }

  onClickClear() {
    context.clearRect(0, 0, editor.width, editor.height);
    highlightContext.clearRect(0, 0, editor.width, editor.height);
  }

  onClickHighlight() {
    this.setState({tool: 'highlighter'});
  }

  onClickPen() {
    this.setState({tool: 'pen'});
  }

  onClickArrow() {
    this.setState({tool: 'arrow'});
  }

  onClickRectangle() {
    this.setState({tool: 'rectangle'});
  }

  componentDidMount() {
    editor = document.getElementById("editor");
    context = this.refs.editor.getContext('2d');
    highlighter = document.getElementById("highlighter");
    highlightContext = this.refs.highlighter.getContext('2d');
  }

  drawRectangle(e) {
    pos = { x: 0, y: 0 };
    var rect = editor.getBoundingClientRect();
    pos.x = e.clientX - rect.left,
    pos.y = e.clientY - rect.top
    context.strokeRect(pos.x, pos.y, 50, 50);
  }

  edit() {
    pos = { x: 0, y: 0 };
    if (this.state.tool == 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.strokeStyle = 'rgba(255,0,0,0.5);';
    } else {
      context.strokeStyle = this.state.color;
      highlightContext.strokeStyle = this.state.color;
      context.globalCompositeOperation = 'source-over';
    }
    context.lineWidth = this.state.size;
    document.body.style.margin = 0;
    window.addEventListener("resize", this.resize);
    if (this.state.tool == 'highlighter' || this.state.tool == 'pen' || this.state.tool == 'eraser') {
      document.querySelector("#canvas-container").addEventListener("mousemove", this.draw)
      document.querySelector("#canvas-container").addEventListener("mousedown", this.setPosition);
      document.querySelector("#canvas-container").addEventListener("mouseenter", this.setPosition);
      document.querySelector("#canvas-container").removeEventListener("mousedown", this.drawRectangle);
      document.querySelector("#canvas-container").removeEventListener("mousemove", this.highlight);
    } else if (this.state.tool == 'rectangle') {
      document.querySelector("#canvas-container").removeEventListener("mousemove", this.draw);
      document.querySelector("#canvas-container").removeEventListener("mousedown", this.setPosition);
      document.querySelector("#canvas-container").removeEventListener("mouseenter", this.setPosition);
      document.querySelector("#canvas-container").removeEventListener("mousemove", this.highlight);
      document.querySelector("#canvas-container").addEventListener("mousedown", this.drawRectangle);
    }
    if (this.state.tool == 'highlighter') {
      document.querySelector("#canvas-container").removeEventListener("mousemove", this.draw)
      document.querySelector("#canvas-container").addEventListener("mousedown", this.setPosition);
      document.querySelector("#canvas-container").addEventListener("mouseenter", this.setPosition);
      document.querySelector("#canvas-container").addEventListener("mousemove", this.highlight);
    }
  }

  highlight(e) {
    if (e.buttons !== 1) return;
    highlightContext.lineWidth = 20;
    highlightContext.strokeStyle = 'yellow';
    highlightContext.beginPath();
    highlightContext.lineCap = 'round';
    highlightContext.moveTo(pos.x, pos.y);
    var rect = editor.getBoundingClientRect();
    pos.x = e.clientX - rect.left,
    pos.y = e.clientY - rect.top
    highlightContext.lineTo(pos.x, pos.y);

    highlightContext.stroke();
  }

  setPosition(e) {
    var rect = editor.getBoundingClientRect();
    pos.x = e.clientX - rect.left,
    pos.y = e.clientY - rect.top
  }

  resize() {
    editor.width = window.innerWidth;
    editor.height = window.innerHeight;
  }

  draw(e) {
    if (e.buttons !== 1) return;
    context.beginPath();

    context.lineCap = 'round';
    context.moveTo(pos.x, pos.y);
    let rect = editor.getBoundingClientRect();
    pos.x = e.clientX - rect.left,
    pos.y = e.clientY - rect.top
    context.lineTo(pos.x, pos.y);

    context.stroke();
  }
}

class Picker extends React.Component {
  constructor(props) {
    super(props);
  }

  onChangeColor(e) {
    this.props.onSelectColor(e.target.value);
  }

  onChangeSize(e) {
    this.props.onSelectSize(e.target.value);
  }

  render() {
    return <div>
      <select id="size" onChange={this.onChangeSize.bind(this)}>
        <option value='5'>5</option>
        <option value='10'>10</option>
        <option value='15'>15</option>
        <option value='20'>20</option>
      </select>
      <select id="color" onChange={this.onChangeColor.bind(this)}>
        <option value="#000000">Black</option>
        <option value="#38ADFC">Blue</option>
        <option value="#FECB2F">Yellow</option>
        <option value="#51CD25">Green</option>
        <option value="#CE0B24">Red</option>
        <option value="#FFFFFF">White</option>
      </select>
    </div>
  }
}
