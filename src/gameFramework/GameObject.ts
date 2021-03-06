// By Raccoon
"use strict";

import Point from "./Point";

export default class GameObject {
  constructor() {
    this.absolutePosition = { x: 0, y: 0 };
    this.absoluteRotation = 0;
    this.absoluteScale = { x: 1, y: 1 };
    this.absoluteOpacity = 1;
    this.systemLayer = 1;
    //this.spriteParent = {}
    this.previousAbsolutePosition = new Point();
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.rotation = 0;
    this.scale = { x: 1, y: 1 };
    this.position = { x: 0, y: 0 };
    this.opacity = 1;

    this._isRotate = true;
    this._isScale = true;
    this._isMove = true;
    this._isFade = true;
    this._changeFrame = true;
    this._isCountAbsolute = false;
  }

  public _isRotate: boolean;
  public _isScale: boolean;
  public _isMove: boolean;
  private _isFade: boolean;
  public _changeFrame: boolean;
  private _isCountAbsolute: boolean;
  private _selfCanvas: HTMLCanvasElement;
  public texture: CanvasImageSource;
  public attachArray: GameObject[];
  public absolutePosition: XY;
  public absoluteRotation: number;
  public absoluteScale: XY;
  public absoluteOpacity: number;
  public systemLayer: number;
  public previousAbsolutePosition: Point;
  public previousWidth: number;
  public previousHeight: number;
  public rotation: number;
  public scale: XY;
  public position: XY;
  public opacity: number;
  public spriteParent?: GameObject; //TODO: check

  public get isObjectChanged(): boolean {
    let isParentChanged = false;
    /*if(!Framework.Util.isUndefined(this.spriteParent)) {
                  isParentChanged = this.spriteParent.isObjectChanged;
              }*/

    if (this.attachArray) {
      this.attachArray.forEach(function (ele) {
        if (ele.isObjectChanged) {
          isParentChanged = true;
        }
      });
    }
    return (
      this._isRotate ||
      this._isScale ||
      this._isFade ||
      this._isMove ||
      this._changeFrame ||
      isParentChanged
    );
  }

  public get isOnChangedRect(): boolean {
    const halfDiagonal = this.diagonal / 2;
    const thisRect = {
      x: this.absolutePosition.x - halfDiagonal,
      y: this.absolutePosition.y - halfDiagonal,
      x2: this.absolutePosition.x + halfDiagonal,
      y2: this.absolutePosition.y + halfDiagonal,
    };

    //TODO: change import
    const changedRect = Framework.Game.currentLevel.getChangedRect(
      Framework.Config.canvasWidth,
      Framework.Config.canvasHeight
    );

    if (
      (thisRect.x < changedRect.x2 && thisRect.y < changedRect.y2) ||
      (thisRect.x2 > changedRect.x && thisRect.y2 > changedRect.y) ||
      (thisRect.x2 > changedRect.x && thisRect.y2 < changedRect.y) ||
      (thisRect.x2 < changedRect.x && thisRect.y2 > changedRect.y)
    ) {
      return true;
    }
    return false;
  }

  public get width(): number {
    let height = 0; //this.texture.height;
    if (this.texture) {
      height = Number(this.texture.height);
    }
    /*if (this.row) {
                height = this.texture.height / this.row;
            }*/
    return Math.floor(height * this.absoluteScale.y);
  }

  public get height(): number {
    let height = 0; //this.texture.height;
    if (this.texture) {
      height = Number(this.texture.height);
    }
    /*if (this.row) {
                    height = this.texture.height / this.row;
                }*/
    return Math.floor(height * this.absoluteScale.y);
  }

  public get diagonal(): number {
    return Math.sqrt(this.width * this.width + this.height * this.height);
  }

  public get upperLeft(): XY {
    const oriX = -this.width / 2,
      oriY = -this.height / 2,
      positionDif = this.countRotatePoint(
        { x: oriX, y: oriY },
        this.absoluteRotation
      );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get upperRight(): XY {
    const oriX = this.width / 2,
      oriY = -this.height / 2,
      positionDif = this.countRotatePoint(
        { x: oriX, y: oriY },
        this.absoluteRotation
      );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get lowerLeft(): XY {
    const oriX = -this.width / 2,
      oriY = this.height / 2,
      positionDif = this.countRotatePoint(
        { x: oriX, y: oriY },
        this.absoluteRotation
      );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get lowerRight(): XY {
    const oriX = this.width / 2,
      oriY = this.height / 2,
      positionDif = this.countRotatePoint(
        { x: oriX, y: oriY },
        this.absoluteRotation
      );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public set layer(v: number) {
    this.systemLayer = v;

    if (this.attachArray) {
      this.attachArray.forEach(function (o: GameObject) {
        o.layer = v + 1;
      });
    }
  }

  public get layer(): number {
    return this.systemLayer;
  }

  public get canvas(): HTMLCanvasElement {
    if (this._selfCanvas) {
      return this._selfCanvas;
    }

    this._selfCanvas = document.createElement("canvas");
    // const diagonalLength = Math.ceil(
    //   Math.sqrt(Math.pow(this.height, 2) + Math.pow(this.width, 2))
    // );
    // this._selfCanvas.width = diagonalLength;
    // this._selfCanvas.height = diagonalLength;
    this._selfCanvas.width = this.width;
    this._selfCanvas.height = this.height;
    if (this.width === 0 && this.height === 0) {
      /*this._selfCanvas = Framework.Game._canvas;
                return this._selfCanvas;*/
      this._selfCanvas.width = Framework.Game.canvas.width;
      this._selfCanvas.height = Framework.Game.canvas.height;
    }
    return this._selfCanvas;
  }

  public get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d");
  }

  public clearDirtyFlag(): void {
    this._isRotate = false;
    this._isScale = false;
    this._isMove = false;
    this._isFade = false;
    this._changeFrame = false;
  }

  public pushSelfToLevel(): void {
    Framework.Game.pushGameObj(this);
  }

  public countAbsoluteProperty(): void {
    this.previousAbsolutePosition.x = this.absolutePosition.x;
    this.previousAbsolutePosition.y = this.absolutePosition.y;
    this.previousWidth = this.width;
    this.previousHeight = this.height;

    if (this.absoluteRotation !== this.rotation) {
      this._isRotate = true;
    }

    if (this.absoluteScale !== this.scale) {
      this._isScale = true;
    }

    if (
      this.absolutePosition.x !== this.position.x ||
      this.absolutePosition.y !== this.position.y
    ) {
      this._isMove = true;
    }

    if (this.absoluteOpacity !== this.opacity) {
      this._isFade = true;
    }

    this.rotation %= 360;
    this.absoluteRotation = this.rotation;
    this.absoluteScale = this.scale;
    this.absoluteOpacity = this.opacity;

    this.absolutePosition.x = this.position.x;
    this.absolutePosition.y = this.position.y;

    if (Array.isArray(this.attachArray)) {
      this.attachArray.forEach(function (ele) {
        if (ele.countAbsoluteProperty) {
          ele.countAbsoluteProperty();
        }
      });
    }
  }

  public countRotatePoint(point: XY, angle: number): XY {
    const currentRotate = (angle / 180) * Math.PI;
    const cosRatio = Math.cos(currentRotate);
    const sinRatio = Math.sin(currentRotate);
    const pointX = point.x * cosRatio - point.y * sinRatio;
    const pointY = point.x * sinRatio + point.y * cosRatio;
    return { x: pointX, y: pointY };
  }

  public load(): void {
    return;
  }
  public initialize(): void {
    return;
  }
  public update(): void {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public draw(_ctx: CanvasRenderingContext2D | GameObject): void {
    return;
  }
  public teardown(): void {
    return;
  }
  public toString(): string {
    return "[GameObject Object]";
  }

  public initTexture(): void {
    return;
  }
}

export interface XY {
  x: number;
  y: number;
}
