import Game from "./Game";
import { xy } from "./interface";
import Level from "./Level";

export default class TouchManager {
  constructor(game: Game) {
    this.game = game;
    this.userTouchstartEvent = () => {
      return;
    };
    this.userTouchendEvent = () => {
      return;
    };
    this.userTouchcancelEvent = () => {
      return;
    };
    this.userTouchleaveEvent = () => {
      return;
    };
    this.userTouchmoveEvent = () => {
      return;
    };

    this.game.canvas.addEventListener(
      "touchstart",
      this.touchstartEvent,
      false
    );
    this.game.canvas.addEventListener("touchend", this.touchendEvent, false);
    //Framework.Game.canvas.addEventListener('touchcancel', this.touchcancelEvent, false);
    //Framework.Game.canvas.addEventListener('touchleave', this.touchleaveEvent, false);
    this.game.canvas.addEventListener("touchmove", this.touchmoveEvent, false);
  }

  private game: Game;
  public userTouchstartEvent: (e?: TouchEvent) => void;
  public userTouchendEvent: (e?: TouchEvent) => void;
  public userTouchcancelEvent: (e?: TouchEvent) => void;
  public userTouchleaveEvent: (e?: TouchEvent) => void;
  public userTouchmoveEvent: (e?: TouchEvent) => void;
  public subject: Level;

  public countCanvasOffset(e: TouchEvent): xy[] {
    const touches = e.changedTouches;
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let ele: HTMLElement = this.game.canvas;
    let newE: xy[];

    do {
      totalOffsetX += ele.offsetLeft;
      totalOffsetY += ele.offsetTop;
      ele = ele.offsetParent as HTMLElement;
    } while (ele);

    for (let i = 0; i < touches.length; i++) {
      const x = Math.floor(
        (touches[i].pageX - totalOffsetX) / this.game.widthRatio
      );
      const y = Math.floor(
        (touches[i].pageY - totalOffsetY) / this.game.heightRatio
      );
      newE.push({ x, y });
    }

    return newE;
  }

  public touchstartEvent(e: TouchEvent): void {
    e.preventDefault();
    const newE = this.countCanvasOffset(e);
    this.userTouchstartEvent.call(this.subject, newE, e);
  }

  public touchendEvent(e: TouchEvent): void {
    e.preventDefault();
    const newE = this.countCanvasOffset(e);
    this.userTouchendEvent.call(this.subject, newE, e);
  }

  public touchcancelEvent(e: TouchEvent): void {
    e.preventDefault();
    const newE = this.countCanvasOffset(e);
    this.userTouchcancelEvent.call(this.subject, newE, e);
  }

  public touchleaveEvent(e: TouchEvent): void {
    e.preventDefault();
    const newE = this.countCanvasOffset(e);
    this.userTouchleaveEvent.call(this.subject, newE, e);
  }

  public touchmoveEvent(e: TouchEvent): void {
    e.preventDefault();
    const newE = this.countCanvasOffset(e);
    this.userTouchmoveEvent.call(this.subject, newE, e);
  }
}
