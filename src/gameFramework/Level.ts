import Framework from ".";
import Config from "./Config";
import GameObject from "./GameObject";
import { key, requestInfo, xy } from "./interface";
import Scene from "./Scene";

export default class Level {
  constructor(Framework: Framework) {
    this.Framework = Framework;

    this.rootScene = new Scene(Framework);
    this.autoDelete = true;
    this.firstDraw = true;
    this.allGameElement = [];
    this.timelist = [];
    this.updatetimelist = [];
    this.cycleCount = 0;

    this.config = this.Framework.config;
  }

  protected rootScene: Scene;
  protected autoDelete: boolean;
  protected firstDraw: boolean;
  public allGameElement: GameObject[];
  protected timelist: any[];
  protected updatetimelist: any[];
  protected cycleCount: number;
  protected config: Config;
  protected Framework: Framework;

  public get canvasChanged(): boolean {
    let isCanvasChanged = false;
    this.traversalAllElement(function (ele) {
      if (ele.isObjectChanged) {
        isCanvasChanged = true;
      }
    });
    return isCanvasChanged;
  }

  protected traversalAllElement(func: (v: GameObject) => void): void {
    this.allGameElement.forEach(func);
  }

  public initializeProgressResource(): void {
    return;
  }

  public load(): void {
    this.load();
    this.traversalAllElement((ele) => {
      ele.load();
    });
  }

  public loadingProgress(
    ctx: CanvasRenderingContext2D,
    requestInfo: requestInfo
  ): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "90px Arial";
    ctx.fillText(
      Math.floor(this.Framework.resourceManager.getFinishedRequestPercent()) +
        "%",
      ctx.canvas.width / 2 - 50,
      ctx.canvas.height / 2
    );
  }

  public initialize(): void {
    this.cycleCount = 0;
    this.traversalAllElement((ele) => {
      ele.initialize();
    });
    this.rootScene.initTexture();
  }

  public update(): void {
    this.rootScene.clearDirtyFlag();
    this.traversalAllElement(function (ele) {
      ele.clearDirtyFlag();
    });
    const preDraw = Date.now();

    this.rootScene.update();
    this.cycleCount++;

    const drawTime = Date.now() - preDraw;
    this.updatetimelist.push(drawTime);
    if (this.updatetimelist.length >= 30) {
      // var average = this.countAverage(this.updatetimelist);
      this.updatetimelist = [];
      // console.log("update time average " + average)
    }
  }

  public draw(ctx?: CanvasRenderingContext2D): void {
    this.rootScene.countAbsoluteProperty();
    /*this.traversalAllElement(function(ele) {
            ele.countAbsoluteProperty();
        })*/
    if (this.canvasChanged) {
      const rect = this.getChangedRect(ctx.canvas.width, ctx.canvas.height);

      ctx.save();
      ctx.beginPath();

      if (!this.config.isOptimize || this.firstDraw) {
        // 2017.02.20, from V3.1.1
        rect.x = 0;
        rect.y = 0;
        rect.width = ctx.canvas.width;
        rect.height = ctx.canvas.height;
        this.firstDraw = false;
      }

      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();

      ctx.clearRect(rect.x, rect.y, rect.width, rect.height);

      const preDraw = Date.now();

      this.rootScene.draw(ctx);

      const drawTime = Date.now() - preDraw;
      this.timelist.push(drawTime);
      if (this.timelist.length >= 30) {
        // const average = this.countAverage(this.timelist);
        this.timelist = [];
        // console.log("draw time average " + average)
      }
      ctx.restore();
    }
  }

  public countAverage(list: number[]): number {
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum / list.length;
  }

  public teardown(): void {
    for (const i in this.allGameElement) {
      const deleteObj = this.allGameElement[i];
      if (deleteObj.teardown instanceof Function) {
        deleteObj.teardown();
      }
      this.allGameElement[i] = null;
      delete this.allGameElement[i];
    }
    this.allGameElement.length = 0;
  }

  public getChangedRect(maxWidth: number, maxHeight: number): rect {
    const rect: rect = {
      x: maxWidth,
      y: maxHeight,
      x2: 0,
      y2: 0,
      width: 0,
      height: 0,
    };

    this.traversalAllElement(function (ele) {
      if (ele.isObjectChanged) {
        const nowDiagonal = Math.ceil(
          Math.sqrt(ele.width * ele.width + ele.height * ele.height)
        );
        const nowX = Math.ceil(ele.absolutePosition.x - nowDiagonal / 2);
        const nowY = Math.ceil(ele.absolutePosition.y - nowDiagonal / 2);
        const nowX2 = nowDiagonal + nowX;
        const nowY2 = nowDiagonal + nowY;
        const preDiagonal = Math.ceil(
          Math.sqrt(
            ele.previousWidth * ele.previousWidth +
              ele.previousHeight * ele.previousHeight
          )
        );
        const preX = Math.ceil(
          ele.previousAbsolutePosition.x - preDiagonal / 2
        );
        const preY = Math.ceil(
          ele.previousAbsolutePosition.y - preDiagonal / 2
        );
        const preX2 = preDiagonal + preX;
        const preY2 = preDiagonal + preY;
        const x = nowX < preX ? nowX : preX;
        const y = nowY < preY ? nowY : preY;
        const x2 = nowX2 > preX2 ? nowX2 : preX2;
        const y2 = nowY2 > preY2 ? nowY2 : preY2;

        if (x < rect.x) {
          rect.x = x;
        }

        if (y < rect.y) {
          rect.y = y;
        }

        if (x2 > rect.x2) {
          rect.x2 = x2;
        }

        if (y2 > rect.y2) {
          rect.y2 = y2;
        }
      }
    });

    rect.width = rect.x2 - rect.x;
    rect.height = rect.y2 - rect.y;

    return rect;
  }

  public showAllElement(): void {
    this.traversalAllElement(function (ele) {
      console.log(
        ele,
        "ele.isMove",
        ele._isMove,
        "ele.isRotate",
        ele._isRotate,
        "ele.isScale",
        ele._isScale,
        "ele.changeFrame",
        ele._changeFrame,
        "ele.isObjectChanged",
        ele.isObjectChanged
      );
    });
  }
  /**
   * 處理點擊的事件, 當mousedown + mouseup 都成立時才會被觸發
   * @event click
   * @param {Object} e 事件的參數, 會用到的應該是e.x和e.y兩個參數,
   * 表示的是目前點擊的絕對位置
   */
  public click(e: xy): void {
    return;
  }

  /**
   * 處理滑鼠點下的事件
   * @event mousedown
   * @param {Object} e 事件的參數, 會用到的應該是e.x和e.y兩個參數,
   * 表示的是目前點擊的絕對位置
   */
  public mousedown(e: xy): void {
    return;
  }

  /**
   * 處理滑鼠放開的事件
   * @event mouseup
   * @param {Object} e 事件的參數, 會用到的應該是e.x和e.y兩個參數,
   * 表示的是目前放開的絕對位置
   */
  public mouseup(e: xy): void {
    return;
  }

  /**
   * 處理滑鼠移動的事件(不論是否有點下, 都會觸發該事件)
   * @event mousemove
   * @param {Object} e 事件的參數, 會用到的應該是e.x和e.y兩個參數,
   * 表示的是目前滑鼠的絕對位置
   */
  public mousemove(e: xy): void {
    return;
  }

  /**
   * 處理觸控到螢幕時的事件, 若是在一般電腦上跑, 是不會觸發此事件的
   * (除非使用debugger模擬, https://developers.google.com/chrome-developer-tools/docs/mobile-emulation?hl=zh-TW)
   * @event touchstart
   * @param {Object} e 事件的參數,
   * 會用到的應該是e.touches[0].clientX和e.touches[0].clientY兩個參數,
   * 表示的是目前觸控到的位置
   */
  public touchstart(e: TouchEvent): void {
    return;
  }

  public touchend(e: TouchEvent): void {
    return;
  }

  /**
   * 處理觸控到螢幕並移動時的事件, 若是在一般電腦上跑, 是不會觸發此事件的
   * (除非使用debugger模擬, https://developers.google.com/chrome-developer-tools/docs/mobile-emulation?hl=zh-TW)
   * @event touchmove
   * @param {Object} e 事件的參數,
   * 會用到的應該是e.touches[0].clientX和e.touches[0].clientY兩個參數,
   * 表示的是目前最新觸控到的位置
   */
  public touchmove(e: TouchEvent): void {
    return;
  }

  public keydown(e: key): void {
    return;
  }

  public keyup(e: key): void {
    return;
  }

  public keypress(e: key): void {
    return;
  }

  public resetCycleCount(): void {
    this.cycleCount = 0;
  }

  public autodelete(): void {
    for (const i in this.rootScene.attachArray) {
      if (this.rootScene.attachArray[i].teardown instanceof Function) {
        this.rootScene.attachArray[i].teardown();
      }
      this.rootScene.attachArray[i] = null;
      delete this.rootScene.attachArray[i];
    }
    this.rootScene.attachArray.length = 0;
    this.teardown();
  }

  public afterLevelLoad(): void {
    this.rootScene.afterCreate();
  }
}

interface rect {
  x: number;
  y: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}
