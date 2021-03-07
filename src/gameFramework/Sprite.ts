import Framework from ".";
import GameObject from "./GameObject";
import Point from "./Point";
import { isAbout } from "./Utils";
import { xy } from "./interface";

export default class Sprite extends GameObject {
  constructor(
    Framework: Framework,
    source: string | CanvasImageSource,
    options?: SpriteOptions
  ) {
    super(Framework);
    this.options = {
      isDrawBoundry: options?.isDrawBoundry ?? false,
      isDrawPace: options?.isDrawPace ?? false,
      isStartDrawingFromLeftTop: options?.isStartDrawingFromLeftTop ?? false,
      /*-------------------------------------*/
      isSection: options?.isSection ?? false,
    };

    if (typeof source === "string") {
      this.id = source;
      this.Framework.resourceManager.loadImage({ id: source, url: source });
      this.type = "image";
      this.pushSelfToLevel();
    } else if (source instanceof HTMLCanvasElement) {
      this.texture = source;
      this.type = "canvas";
    } else if (source instanceof HTMLImageElement) {
      this.texture = source;
      this.type = "image";
    } else if (source) {
      this.Framework.debugInfo.Log.error("Sprite 不支援的參數" + source);
    }
  }

  public id: string;
  public type: string;
  public options: SpriteOptions;
  public _changeFrame: boolean;

  public initTexture(): void {
    if (!this.texture) {
      this.texture = this.Framework.resourceManager.getResource(
        this.id
      ) as CanvasImageSource;
    }
  }

  public draw(painter: CanvasRenderingContext2D | GameObject): void {
    super.draw(painter);
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
    painter = painter || this.Framework.game.context;
    let pos;
    let realWidth;
    let realHeight;
    if (this.type === "image" || this.type === "canvas") {
      // 計算縮放後的大小
      if (this.isObjectChanged) {
        if (
          !isAbout(this.absoluteOpacity, 1, 0.00001) ||
          !isAbout(this.absoluteScale.x, 1, 0.00001) ||
          !isAbout(this.absoluteScale.y, 1, 0.00001) ||
          !isAbout(this.absoluteRotation, 0, 0.001)
        ) {
          realWidth = Number(this.texture.width) * this.scale.x;
          realHeight = Number(this.texture.height) * this.scale.y;
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
          this.context.scale(this.absoluteScale.x, this.absoluteScale.y);
          // 設定透明度
          this.context.globalAlpha = this.absoluteOpacity;
          // 產生圖像
          this.context.drawImage(
            this.texture,
            (this.canvas.width - realWidth) / 2 / this.absoluteScale.x,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale.y
          );
        }

        // 畫到主Canvas上
        if (this.options.isDrawBoundry) {
          this.context.rect(
            (this.canvas.width - realWidth) / 2 / this.absoluteScale.x,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale.y,
            Number(this.texture.width),
            Number(this.texture.height)
          );
          this.context.stroke();
        }

        if (this.options.isDrawPace) {
          this.context.rect(
            this.absolutePosition.x,
            this.absolutePosition.y,
            1,
            1
          );
          this.context.stroke();
        }
      }

      pos = this.options.isStartDrawingFromLeftTop
        ? new Point(this.absolutePosition.x, this.absolutePosition.y)
        : new Point(
            this.absolutePosition.x - this.canvas.width / 2,
            this.absolutePosition.y - this.canvas.height / 2
          );
      if (painter instanceof GameObject) {
        painter = painter.context; //表示傳進來的其實是GameObject或其 Concrete Class
      }
      if (
        !isAbout(this.absoluteOpacity, 1, 0.00001) ||
        !isAbout(this.absoluteScale.x, 1, 0.00001) ||
        !isAbout(this.absoluteScale.y, 1, 0.00001) ||
        !isAbout(this.absoluteRotation, 0, 0.001)
      ) {
        painter.drawImage(this.canvas, pos.x, pos.y);
      } else {
        painter.drawImage(
          this.texture,
          this.absolutePosition.x - Number(this.texture.width) / 2,
          this.absolutePosition.y - Number(this.texture.height) / 2
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
          !isAbout(this.absoluteScale.x, 1, 0.00001) ||
          !isAbout(this.absoluteScale.y, 1, 0.00001) ||
          !isAbout(this.absoluteRotation, 0, 0.001)
        ) {
          realWidth = Number(this.texture.width) * this.scale.x;
          realHeight = Number(this.texture.height) * this.scale.y;
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
          this.context.scale(this.absoluteScale.x, this.absoluteScale.y);
          // 畫圖
          this.context.drawImage(
            this.texture,
            (this.canvas.width - realWidth) / 2 / this.absoluteScale.x,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale.y
          );
        }

        // 再畫到主Canvas上
        if (this.options.isDrawBoundry) {
          this.context.rect(
            (this.canvas.width - realWidth) / 2 / this.absoluteScale.x,
            (this.canvas.height - realHeight) / 2 / this.absoluteScale.y,
            Number(this.texture.width),
            Number(this.texture.height)
          );
          this.context.stroke();
        }

        if (this.options.isDrawPace) {
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
        !isAbout(this.absoluteScale.x, 1, 0.00001) ||
        !isAbout(this.absoluteScale.y, 1, 0.00001) ||
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

  public getSection(upperLeft: xy, bottomRight: xy): Sprite {
    const tmpCanvas = document.createElement("canvas");
    //取得局部圖片大小
    const realWidth = bottomRight.x - upperLeft.x;
    const realHeight = bottomRight.y - upperLeft.y;
    //目前canvas跟局部圖片大小一樣
    tmpCanvas.width = realWidth;
    tmpCanvas.height = realHeight;
    const tmpContext = tmpCanvas.getContext("2d");
    //因canvas跟局部圖片大小一樣，就直接從局部圖片的左上角的-x, -y開始畫
    tmpContext.drawImage(this.texture, -upperLeft.x, -upperLeft.y);
    return new Sprite(this.Framework, tmpCanvas);
  }

  public clone(): Sprite {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = Number(this.texture.width);
    tmpCanvas.height = Number(this.texture.height);
    tmpCanvas.getContext("2d").drawImage(this.texture, 0, 0);
    return new Sprite(this.Framework, tmpCanvas);
  }

  public cloneImage(): Sprite {
    const tmpImage = document.createElement("img");
    tmpImage.src = this.id;
    return new Sprite(this.Framework, tmpImage);
  }
}

interface SpriteOptions {
  isDrawBoundry: boolean;
  isDrawPace: boolean;
  isStartDrawingFromLeftTop: boolean;
  /*-------------------------------------*/
  isSection: boolean;
}
