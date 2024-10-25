import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";
import { requestMouseFocus } from "../dispatch";

export type SKButtonProps = SKElementProps & { 
  text?: string;
  buttonFill?: string;  // Added buttonFill property
};

export class SKButton extends SKElement {
  constructor({
    text = "",
    fill = "lightblue",  // Default fill color is light blue
    buttonFill,  // Accept buttonFill property
    ...elementProps
  }: SKButtonProps = {}) {
    super(elementProps);
    this.text = text;
    this.fill = buttonFill || fill;  // Use buttonFill if provided, otherwise fallback to fill
    this.padding = Style.textPadding;
    this.calculateBasis();
    this.doLayout();
  }

  state: "idle" | "hover" | "down" = "idle";

  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    this.setMinimalSize(this.width, this.height);
  }

  protected _radius = 8;  // Rounded corners
  set radius(r: number) {
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  // Updated the font to Times New Roman
  protected _font = "bold 16px 'Times New Roman', serif";
  set font(s: string) {
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = "white";  // Default font color is white for contrast
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }  

  protected _highlightColour = "#aaa";  // Highlight color
  set highlightColour(hc: string) {
    this._highlightColour = hc;
  }

  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    const m = measureText(this.text, this._font);

    if (!m) {
      console.warn(`measureText failed in SKButton for ${this.text}`);
      return;
    }

    // Increase the button height slightly
    this.height = height || m.height + this.padding * 2 + 10;  // Adjusted for more height
    this.width = width || m.width + this.padding * 2;

    if (!width) this.width = Math.max(this.width, 100);  // Ensure minimum button width
  }

  handleMouseEvent(me: SKMouseEvent) {
    switch (me.type) {
      case "mousedown":
        this.state = "down";
        requestMouseFocus(this);
        return true;
      case "mouseup":
        this.state = "hover";
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        } as SKEvent);
      case "mouseenter":
        this.state = "hover";
        return true;
      case "mouseexit":
        this.state = "idle";
        return true;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.translate(this.margin, this.margin);

    // Add button shadow for depth effect
    gc.shadowColor = "rgba(0, 0, 0, 0.15)";
    gc.shadowBlur = 6;
    gc.shadowOffsetX = 3;
    gc.shadowOffsetY = 3;

    // Draw the background with a rounded rectangle and smoother color transitions
    gc.beginPath();
    gc.roundRect(this.x, this.y, w, h, this._radius);
    gc.fillStyle = this.state === "down" ? this._highlightColour : this.fill;
    gc.fill();

    // Draw the border
    gc.strokeStyle = this.state === "down" ? this._highlightColour : "#333";
    gc.lineWidth = this.state === "down" ? 3 : 1;
    gc.stroke();

    // Remove shadow for the text rendering
    gc.shadowColor = "transparent";

    // Draw the text in the center of the button with Times New Roman
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    gc.fillText(this.text, this.x + w / 2, this.y + h / 2);

    gc.restore();

    super.draw(gc);
  }

  public toString(): string {
    return `SKButton '${this.text}'`;
  }
}
