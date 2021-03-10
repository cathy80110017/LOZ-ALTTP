import Framework from ".";
import GameObject from "./GameObject";
import { isAbout } from "./Utils";

export default class Sprite extends GameObject {
  constructor(Framework: Framework, source: string | CanvasImageSource) {
    super(Framework);

    this._tmpCanvas = document.createElement("canvas");
    this._tmpContext = this._tmpCanvas.getContext("2d");
    this.isDrawBoundry = false;
    this.isDrawPace = false;

    if (typeof source === "string") {
      this.id = source;
      this.Framework.resourceManager.loadImage({ id: source, url: source });
      this.type = "image";
      this.pushSelfToLevel();
    } else if (source instanceof HTMLCanvasElement) {
      this.texture = source;
      this.type = "canvas";
    } else if (source) {
      this.Framework.debugInfo.Log.error("Sprite 不支援的參數" + source);
    }
  }

  public id: string;
  public type: string;
  public _changeFrame: boolean;
  public isDrawBoundry: boolean;
  public isDrawPace: boolean;
  private _tmpCanvas: HTMLCanvasElement;
  private _tmpContext: CanvasRenderingContext2D;
  public texture: CanvasImageSource;

  public initTexture(): void {
    if (!this.texture) {
      this.texture = this.Framework.resourceManager.getResource(
        this.id
      ) as CanvasImageSource;
    }
  }

  public draw(painter: CanvasRenderingContext2D | GameObject): void {
    this.countAbsoluteProperty();
    if (!this.texture) {
      this.texture = this.Framework.resourceManager.getResource(
        this.id
      ) as CanvasImageSource;
    }

    if (this.Framework.game.isBackwardCompatible) {
      this.testDraw(painter);
      return;
    }

    painter = painter ?? this.Framework.game.context;

    let realWidth;
    let realHeight;
    if (this.type === "image" || this.type === "canvas") {
      // 計算縮放後的大小
      if (this.isObjectChanged) {
        if (
          !isAbout(this.absoluteScale, 1, 0.00001) ||
          !isAbout(this.absoluteRotation, 0, 0.001)
        ) {
          realWidth = Number(this.texture.width) * this.scale;
          realHeight = Number(this.texture.height) * this.scale;

          // 將canvas 放大才不會被切到
          const diagonalLength = Math.ceil(
            Math.sqrt(Math.pow(realHeight, 2) + Math.pow(realWidth, 2))
          );
          this.canvas.width = diagonalLength;
          this.canvas.height = diagonalLength;

          const tranlateX = this.canvas.width / 2;
          const tranlateY = this.canvas.height / 2;

          // 將Canvas 中心點移動到左上角(0,0)
          this.context.translate(tranlateX, tranlateY);
          // 旋轉Canvas
          this.context.rotate((this.absoluteRotation / 180) * Math.PI);
          // 移回來
          this.context.translate(-tranlateX, -tranlateY);
          // 縮放
          this.context.scale(this.absoluteScale, this.absoluteScale);
          // 設定透明度
          // this.context.globalAlpha = this.absoluteOpacity;
          // 產生圖像
          this.context.drawImage(
            this.texture,
            (this.canvas.width - realWidth) / 2 / this.absoluteScale,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale
          );
        }

        // 畫到主Canvas上
        if (this.isDrawBoundry) {
          this.context.rect(
            (this.canvas.width - realWidth) / 2 / this.absoluteScale,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale,
            Number(this.texture.width),
            Number(this.texture.height)
          );
          this.context.stroke();
        }

        if (this.isDrawPace) {
          this.context.rect(
            this.absolutePosition.x,
            this.absolutePosition.y,
            1,
            1
          );
          this.context.stroke();
        }
      }

      if (painter instanceof GameObject) {
        painter = painter.context; //表示傳進來的其實是GameObject或其 Concrete Class
      }
      if (
        !isAbout(this.absoluteScale, 1, 0.00001) ||
        !isAbout(this.absoluteRotation, 0, 0.001)
      ) {
        painter.drawImage(
          this.canvas,
          this.absolutePosition.x - this.canvas.width / 2,
          this.absolutePosition.y - this.canvas.height / 2
        );
      } else {
        painter.drawImage(
          this.texture,
          this.absolutePosition.x,
          this.absolutePosition.y
        );
      }
    }
  }

  public testDraw(painter: CanvasRenderingContext2D | GameObject): void {
    painter = painter || this.Framework.game.context;

    this.countAbsoluteProperty();

    let realWidth, realHeight;
    if (!this.texture) {
      this.texture = this.Framework.resourceManager.getResource(
        this.id
      ) as CanvasImageSource;
    }

    if (this.type === "image" || this.type === "canvas") {
      // 計算縮放後的大小
      if (this.isObjectChanged) {
        if (
          !isAbout(this.absoluteScale, 1, 0.00001) ||
          !isAbout(this.absoluteRotation, 0, 0.001)
        ) {
          realWidth = Number(this.texture.width) * this.scale;
          realHeight = Number(this.texture.height) * this.scale;

          // 將canvas 放大才不會被切到
          const diagonalLength = Math.floor(
            Math.sqrt(Math.pow(realHeight, 2) + Math.pow(realWidth, 2))
          );
          this.canvas.width = diagonalLength;
          this.canvas.height = diagonalLength;

          const tranlateX = this.canvas.width / 2;
          const tranlateY = this.canvas.height / 2;

          // 將Canvas 中心點移動到左上角(0,0)
          this.context.translate(tranlateX, tranlateY);
          // 旋轉Canvas
          this.context.rotate((this.absoluteRotation / 180) * Math.PI);
          // 移回來
          this.context.translate(-tranlateX, -tranlateY);
          // 縮放
          this.context.scale(this.absoluteScale, this.absoluteScale);
          // 畫圖
          this.context.drawImage(
            this.texture,
            (this.canvas.width - realWidth) / 2 / this.absoluteScale,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale
          );
        }

        // 再畫到主Canvas上
        if (this.isDrawBoundry) {
          this.context.rect(
            (this.canvas.width - realWidth) / 2 / this.absoluteScale,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale,
            Number(this.texture.width),
            Number(this.texture.height)
          );
          this.context.stroke();
        }

        if (this.isDrawPace) {
          this.context.rect(
            this.absolutePosition.x,
            this.absolutePosition.y,
            1,
            1
          );
          this.context.stroke();
        }
      }

      if (painter instanceof GameObject) {
        painter = painter.context; //表示傳進來的其實是GameObject或其 Concrete Class
      }
      if (
        !isAbout(this.absoluteScale, 1, 0.00001) ||
        !isAbout(this.absoluteRotation, 0, 0.001)
      ) {
        painter.drawImage(
          this.canvas,
          this.absolutePosition.x - this.canvas.width / 2,
          this.absolutePosition.y - this.canvas.height / 2
        );
      } else {
        painter.drawImage(
          this.texture,
          this.absolutePosition.x - Number(this.texture.width) / 2,
          this.absolutePosition.y - Number(this.texture.height) / 2
        );
      }
    }
  }

  public toString(): string {
    return "[Sprite Object]";
  }

  public teardown(): void {
    if (this.type === "image") {
      this.Framework.resourceManager.destroyResource(this.id);
    }
  }
}
