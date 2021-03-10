// By Raccoon
"use strict";

import Framework from ".";
import { xy } from "./interface";
import Point from "./Point";
import Sprite from "./Sprite";

export default class GameObject {
  constructor(Framework: Framework) {
    this.Framework = Framework;

    this.relativePosition = new Point();
    this.relativeRotation = 0;
    this.relativeScale = 1;

    this.absolutePosition = { x: 0, y: 0 };
    this.absoluteRotation = 0;
    this.absoluteScale = 1;
    this.systemLayer = 1;
    //this.spriteParent = {}
    this.previousAbsolutePosition = new Point();
    this.previousWidth = 0;
    this.previousHeight = 0;

    this.rotation = 0;
    this.scale = 1;
    this.position = { x: 0, y: 0 };

    this._isRotate = true;
    this._isScale = true;
    this._isMove = true;
    this._changeFrame = true;
    this._isCountAbsolute = false;
  }

  private relativePosition: Point;
  private relativeRotation: number;
  private relativeScale: number;

  public _isRotate: boolean;
  public _isScale: boolean;
  public _isMove: boolean;
  public _changeFrame: boolean;
  private _isCountAbsolute: boolean;
  private _selfCanvas: HTMLCanvasElement;
  public texture: CanvasImageSource | Sprite;
  public attachArray: GameObject[];
  public absolutePosition: xy;
  public absoluteRotation: number;
  public absoluteScale: number;
  public systemLayer: number;
  public previousAbsolutePosition: Point;
  public previousWidth: number;
  public previousHeight: number;
  public spriteParent?: GameObject; //TODO: check
  protected Framework: Framework;

  public get isObjectChanged(): boolean {
    let isParentChanged = false;
    /*if(!Framework.Util.isUndefined(this.spriteParent)) {
                  isParentChanged = this.spriteParent.isObjectChanged;
              }*/

    if (this.attachArray) {
      this.attachArray.forEach((ele) => {
        if (ele.isObjectChanged) {
          isParentChanged = true;
        }
      });
    }
    return (
      this._isRotate ||
      this._isScale ||
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

    const changedRect = this.Framework.game.currentLevel.getChangedRect(
      this.Framework.config.canvasWidth,
      this.Framework.config.canvasHeight
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

  public set position(newValue: xy) {
    if (newValue.x) {
      this.relativePosition.x = Math.floor(newValue.x);
      //this._isMove = true;
    }

    if (newValue.y) {
      this.relativePosition.y = Math.floor(newValue.y);
      //this._isMove = true;
    }
  }

  public get position(): xy {
    return this.relativePosition;
  }

  public set rotation(v: number) {
    this.relativeRotation = v;
  }

  public get rotation(): number {
    return this.relativeRotation;
  }

  public set scale(v: number) {
    this.relativeScale = v;
  }
  public get scale(): number {
    return this.relativeScale;
  }

  public get width(): number {
    let width = 0; //this.texture.height;
    if (this.texture) {
      width = Number(this.texture.width);
    }
    /*if (this.row) {
                height = this.texture.height / this.row;
            }*/
    return Math.floor(width * this.absoluteScale);
  }

  public get height(): number {
    let height = 0; //this.texture.height;
    if (this.texture) {
      height = Number(this.texture.height);
    }
    /*if (this.row) {
                    height = this.texture.height / this.row;
                }*/
    return Math.floor(height * this.absoluteScale);
  }

  public get diagonal(): number {
    return Math.sqrt(this.width * this.width + this.height * this.height);
  }

  public get upperLeft(): xy {
    const oriX = -this.width / 2;
    const oriY = -this.height / 2;
    const positionDif = this.countRotatePoint(
      { x: oriX, y: oriY },
      this.absoluteRotation
    );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get upperRight(): xy {
    const oriX = this.width / 2;
    const oriY = -this.height / 2;
    const positionDif = this.countRotatePoint(
      { x: oriX, y: oriY },
      this.absoluteRotation
    );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get lowerLeft(): xy {
    const oriX = -this.width / 2;
    const oriY = this.height / 2;
    const positionDif = this.countRotatePoint(
      { x: oriX, y: oriY },
      this.absoluteRotation
    );

    return {
      x: Math.floor(this.absolutePosition.x + positionDif.x),
      y: Math.floor(this.absolutePosition.y + positionDif.y),
    };
  }

  public get lowerRight(): xy {
    const oriX = this.width / 2;
    const oriY = this.height / 2;
    const positionDif = this.countRotatePoint(
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
    const diagonalLength = Math.ceil(
      Math.sqrt(Math.pow(this.height, 2) + Math.pow(this.width, 2))
    );
    this._selfCanvas.width = diagonalLength;
    this._selfCanvas.height = diagonalLength;

    if (this.width === 0 && this.height === 0) {
      /*this._selfCanvas = Framework.Game._canvas;
                return this._selfCanvas;*/
      this._selfCanvas.width = this.Framework.game.canvas.width;
      this._selfCanvas.height = this.Framework.game.canvas.height;
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
    this._changeFrame = false;
  }

  public pushSelfToLevel(): void {
    this.Framework.game.pushGameObj(this);
  }

  public countAbsoluteProperty(): void {
    let parentRotation = 0,
      parentScale = 1,
      parentPositionX = 0,
      parentPositionY = 0;

    this.previousAbsolutePosition.x = this.absolutePosition.x;
    this.previousAbsolutePosition.y = this.absolutePosition.y;
    this.previousWidth = this.width;
    this.previousHeight = this.height;

    if (this.spriteParent) {
      parentRotation = this.spriteParent.absoluteRotation;
      parentScale = this.spriteParent.absoluteScale;
      parentPositionX = this.spriteParent.absolutePosition.x;
      parentPositionY = this.spriteParent.absolutePosition.y;
    }

    const rad = (parentRotation / 180) * Math.PI;

    const changedRotate = this.rotation + parentRotation;
    const changedScale = this.scale * parentScale;
    const changedPositionX =
      Math.floor(
        this.relativePosition.x * Math.cos(rad) -
          this.relativePosition.y * Math.sin(rad)
      ) *
        parentScale +
      parentPositionX;
    const changedPositionY =
      Math.floor(
        this.relativePosition.x * Math.sin(rad) +
          this.relativePosition.y * Math.cos(rad)
      ) *
        parentScale +
      parentPositionY;

    if (this.absoluteRotation !== changedRotate) {
      this._isRotate = true;
    }

    if (this.absoluteScale !== changedScale) {
      this._isScale = true;
    }

    if (
      this.absolutePosition.x !== changedPositionX ||
      this.absolutePosition.y !== changedPositionY
    ) {
      this._isMove = true;
    }

    this.absoluteRotation = changedRotate;
    this.absoluteScale = changedScale;
    this.absolutePosition.x = changedPositionX;
    this.absolutePosition.y = changedPositionY;

    if (Array.isArray(this.attachArray)) {
      this.attachArray.forEach((ele) => {
        if (ele.countAbsoluteProperty) {
          ele.countAbsoluteProperty();
        }
      });
    }
  }

  public countRotatePoint(point: xy, angle: number): xy {
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

  public afterCreate(): void {
    return;
  }
}
