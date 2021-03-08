import Game from "./Game";
import { xy } from "./interface";
import Point from "./Point";

export default class MouseManager {
  constructor(game: Game) {
    this.game = game;
    this.isHandling = true;
    this.userClickEvent = () => {
      return;
    };
    this.userMouseDownEvent = () => {
      return;
    };
    this.userMouseUpEvent = () => {
      return;
    };
    this.userMouseMoveEvent = () => {
      return;
    };
    this.userContextMenuEvent = () => {
      return;
    };
    this.game.mainContainer.addEventListener(
      "click",
      (e) => this.clickEvent(e),
      false
    );
    this.game.mainContainer.addEventListener(
      "mousedown",
      (e) => this.mousedownEvent(e),
      false
    );
    this.game.mainContainer.addEventListener(
      "mouseup",
      (e) => this.mouseupEvent(e),
      false
    );
    this.game.mainContainer.addEventListener(
      "mousemove",
      (e) => this.mousemoveEvent(e),
      false
    );
    this.game.mainContainer.addEventListener(
      "contextmenu",
      (e) => this.contextmenuEvent(e),
      false
    );
  }

  private game: Game;
  private isHandling: boolean;
  public userClickEvent: (e?: xy) => void;
  public userMouseDownEvent: (e?: xy) => void;
  public userMouseUpEvent: (e?: xy) => void;
  public userMouseMoveEvent: (e?: xy) => void;
  public userContextMenuEvent: (e?: xy) => void;

  public stopHandle(): void {
    this.isHandling = false;
  }

  public startHandle(): void {
    this.isHandling = true;
  }

  public countCanvasOffset(e: MouseEvent): Point {
    const pos = new Point();
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let ele: HTMLElement = this.game.canvas;

    do {
      totalOffsetX += ele.offsetLeft;
      totalOffsetY += ele.offsetTop;
      ele = ele.offsetParent as HTMLElement;
    } while (ele);

    pos.x = e.x || e.clientX;
    pos.y = e.y || e.clientY;
    pos.x = Math.floor((pos.x - totalOffsetX) / this.game.widthRatio);
    pos.y = Math.floor((pos.y - totalOffsetY) / this.game.heightRatio);

    return pos;
  }

  public clickEvent(e: MouseEvent): void {
    if (this.isHandling) {
      e.preventDefault();
      const p = this.countCanvasOffset(e);
      this.userClickEvent(p);
    }
  }

  public mousedownEvent(e: MouseEvent): void {
    if (this.isHandling) {
      e.preventDefault();
      const p = this.countCanvasOffset(e);
      this.userMouseDownEvent(p);
    }
  }

  public mouseupEvent(e: MouseEvent): void {
    if (this.isHandling) {
      e.preventDefault();
      const p = this.countCanvasOffset(e);
      this.userMouseUpEvent(p);
    }
  }

  public mousemoveEvent(e: MouseEvent): void {
    if (this.isHandling) {
      e.preventDefault();
      const p = this.countCanvasOffset(e);
      this.userMouseMoveEvent(p);
    }
  }

  public contextmenuEvent(e: MouseEvent): void {
    if (this.isHandling) {
      e.preventDefault();
      const p = this.countCanvasOffset(e);
      this.userContextMenuEvent(p);
    }
  }
}
