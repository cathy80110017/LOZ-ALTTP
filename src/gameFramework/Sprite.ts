import DebugInfo from "./DebugInfo";
import GameObject, { XY } from "./GameObject";
import Point from "./Point";
import ResourceManager from "./ResourceManager";

export default class Sprite extends GameObject {
  constructor(source: string | CanvasImageSource, options?: SpriteOptions) {
    super();
    this.options = {
      isDrawBoundry: options?.isDrawBoundry ?? false,
      isDrawPace: options?.isDrawPace ?? false,
      isStartDrawingFromLeftTop: options?.isStartDrawingFromLeftTop ?? false,
      /*-------------------------------------*/
      isSection: options?.isSection ?? false,
    };

    //TODO: change import
    if (typeof source === "string") {
      this.id = source;
      ResourceManager.getInstance().loadImage({ id: source, url: source });
      this.type = "image";
      this.pushSelfToLevel();
    } else if (source instanceof HTMLCanvasElement) {
      this.texture = source;
      this.type = "canvas";
    } else if (source instanceof HTMLImageElement) {
      this.texture = source;
      this.type = "image";
    } else if (source) {
      DebugInfo.getInstance().Log.error("Sprite 不支援的參數" + source);
    }
  }

  public id: string;
  public type: string;
  public options: SpriteOptions;
  public _changeFrame: boolean;

  public initTexture(): void {
    if (!this.texture) {
      this.texture = ResourceManager.getInstance().getResource(
        this.id
      ) as CanvasImageSource;
    }
  }

  public draw(painter: CanvasRenderingContext2D | GameObject): void {
    super.draw(painter);
    this.countAbsoluteProperty();
    if (!this.texture) {
      this.texture = ResourceManager.getInstance().getResource(
        this.id
      ) as CanvasImageSource;
    }
    if (Framework.Game.isBackwardCompatiable) {
      this.testDraw(painter);
      return;
    }
    painter = painter || Framework.Game._context;
    let pos;
    let realWidth;
    let realHeight;
    if (this.type === "image" || this.type === "canvas") {
      // 計算縮放後的大小
      if (this.isObjectChanged) {
        if (
          //TODO: change import
          !Framework.Util.isAbout(this.absoluteOpacity, 1, 0.00001) ||
          !Framework.Util.isAbout(this.absoluteScale.x, 1, 0.00001) ||
          !Framework.Util.isAbout(this.absoluteScale.y, 1, 0.00001) ||
          !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)
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
        !Framework.Util.isAbout(this.absoluteOpacity, 1, 0.00001) ||
        !Framework.Util.isAbout(this.absoluteScale.x, 1, 0.00001) ||
        !Framework.Util.isAbout(this.absoluteScale.y, 1, 0.00001) ||
        !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)
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
    painter = painter || Framework.Game._context;
    this.countAbsoluteProperty();
    let realWidth, realHeight;
    if (!this.texture) {
      this.texture = ResourceManager.getInstance().getResource(
        this.id
      ) as CanvasImageSource;
    }
    if (this.type === "image" || this.type === "canvas") {
      // 計算縮放後的大小
      if (this.isObjectChanged) {
        if (
          !Framework.Util.isAbout(this.absoluteScale.x, 1, 0.00001) ||
          !Framework.Util.isAbout(this.absoluteScale.y, 1, 0.00001) ||
          !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)
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
        !Framework.Util.isAbout(this.absoluteScale.x, 1, 0.00001) ||
        !Framework.Util.isAbout(this.absoluteScale.y, 1, 0.00001) ||
        !Framework.Util.isAbout(this.absoluteRotation, 0, 0.001)
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
      ResourceManager.getInstance().destroyResource(this.id);
    }
  }

  public getSection(upperLeft: XY, bottomRight: XY): Sprite {
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
    return new Sprite(tmpCanvas);
  }

  public clone(): Sprite {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = Number(this.texture.width);
    tmpCanvas.height = Number(this.texture.height);
    tmpCanvas.getContext("2d").drawImage(this.texture, 0, 0);
    return new Sprite(tmpCanvas);
  }

  public cloneImage(): Sprite {
    const tmpImage = document.createElement("img");
    tmpImage.src = this.id;
    return new Sprite(tmpImage);
  }
}

interface SpriteOptions {
  isDrawBoundry: boolean;
  isDrawPace: boolean;
  isStartDrawingFromLeftTop: boolean;
  /*-------------------------------------*/
  isSection: boolean;
}
