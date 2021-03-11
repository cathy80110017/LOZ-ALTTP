import Framework from ".";
import GameObject from "./GameObject";
import Sprite from "./Sprite";

export default class AnimationSprite extends GameObject {
  constructor(Framework: Framework, options: AnimationSpriteOption) {
    super(Framework);

    // 建構子參數判斷
    if (options.url) {
      if (typeof options.url === "string") {
        this._id = options.url;
        if (
          typeof options.col === "undefined" ||
          typeof options.row === "undefined"
        ) {
          this.Framework.debugInfo.Log.error(
            "AnimationSprite Error : 建構子參數錯誤，需指定col、row"
          );
          throw new SyntaxError("AnimationSprite constructor arguments error");
        } else {
          this.col = options.col;
          this.row = options.row;
          this.maxIndex = this.col * this.row - 1;
        }
      } else if (Array.isArray(options.url)) {
        this.maxIndex = options.url.length - 1;
        this.row = options.url.length;
      } else {
        this.Framework.debugInfo.Log.error(
          "AnimationSprite Error : 建構子參數錯誤，url格式不正確"
        );
        throw new SyntaxError("AnimationSprite constructor arguments error");
      }
    } else {
      this.Framework.debugInfo.Log.error(
        "AnimationSprite Error : 建構子參數錯誤"
      );
      throw new SyntaxError("AnimationSprite constructor arguments error");
    }
    this.speed = options.speed ?? 24;
    this.loop = options?.loop ?? true;

    if (typeof options.url === "string") {
      //單張圖片切割
      this.Framework.resourceManager.loadImage({
        id: options.url,
        url: options.url,
      });
      this._type = "one";
    } else if (Array.isArray(options.url)) {
      //一堆圖片串成動畫
      this._id = [];
      this._type = "more";
      this._id = options.url;
      options.url.forEach((src: string) => {
        this._sprites.push(new Sprite(this.Framework, src));
      });
      this._isLoadSprite = true;
    } else if (options) {
      this.Framework.debugInfo.Log.error(
        "AnimationSprite 不支援的參數 " + options
      );
    }

    this.pushSelfToLevel();
  }

  // Define variable
  // private
  private _id: string | string[];
  private _type: string;
  private _isLoadSprite = false;
  private _sprites: Sprite[] = [];
  private _previousTime = new Date().getTime();
  private _start = false;
  // public
  public isDrawBoundry: boolean;
  public isDrawPace: boolean;
  public col = 1;
  public row = 1;
  public from = 0;
  public to = 0;
  public _index = 0;
  public speed = 10;
  public loop = true;
  public maxIndex = 0;
  public speedCounter = 0;
  public userInputFrom: number;
  public userInputTo: number;
  public finishPlaying = function (): void {
    return;
  };

  public set index(v: number) {
    this._index = v;
    this._changeFrame = true;
  }

  public get index(): number {
    return this._index;
  }

  private _nextFrame(): void {
    if (this._start) {
      this.index++;
      this._changeFrame = true;
      if (this.index > this.to) {
        if (this.loop) {
          this.index = this.from;
        } else {
          this.index = this.to;
          this._start = false;
          this.finishPlaying.call(this);
        }
      }
      /*if(this.to === -1){
                if(this.index >= this.maxIndex){
                    this._start = this.loop;
                    if(this._start){
                        this.index = this.from;
                    }else{
                        this.index = this.maxIndex-1;
                    }
                }
            }else{
                if(this.index > this.to){
                    this._start = this.loop;
                    this.index = this.from;
                }
            }*/
    }
  }

  public initTexture(): void {
    return;
  }

  /**
   *
   * 開始播放設定好的AnimationSprite
   * @method start
   * @param {Object} options options.from和options.to表示要從第幾張播放到第幾張,
   * 若to < from表示要倒著播放, 可以在此設定要被播放的速度和是否重複播放,
   * finishPlaying可以設定播放完畢後是否要有callback
   * (loop: true時, 此callback永遠不會被執行)
   * @example
   *     start({from:3, to: 5}); //從第三張圖片播放到第五張
   *     start({from:6, to: 1}); //倒著從第六張圖片播放到第一張
   *     start({from:6, to: 1, loop: false, speed: 1, finishPlaying: function(){
   *         console.log('finish');
   *     }});
   */
  public start(option?: startOption): void {
    this.from = option?.from ?? 0;
    this.to = option?.to ?? this.maxIndex;
    this.speed = option?.speed ?? this.speed;
    this.loop = option?.loop ?? this.loop;

    this._start = true;
    this._previousTime = new Date().getTime();
    this.finishPlaying =
      option?.finishPlaying ??
      function () {
        return;
      };
    this.userInputFrom = this.from;
    this.userInputTo = this.to;
    if (this.userInputFrom > this.userInputTo) {
      this.from = this.maxIndex - this.from;
      this.to = this.maxIndex - this.to;
      if (this._type === "more") {
        this._sprites.reverse();
      }
    }
    this.index = this.from;
  }

  /**
   * 停止播放AnimationSprite, 若已經停止, 則不會發生任何事情
   * @method stop
   */
  public stop(): void {
    this._start = false;
  }

  /**
   * 繼續播放AnimationSprite, 若未曾停止, 則不會發生任何事情
   * @method resume
   */
  public resume(): void {
    if (!this._start) {
      this._previousTime = new Date().getTime();
      this._start = true;
    }
  }

  public load(): void {
    if (typeof this._id === "string") {
      this.Framework.resourceManager.loadImage({ id: this._id, url: this._id });
    } else if (Array.isArray(this._id)) {
      this._id.forEach(function (src) {
        this.Framework.resourceManager.loadImage({ id: src, url: src });
      }, this);
    }
  }

  public initialize(): void {
    //if(this._type === 'one') {
    // 故意用 closures 隔離變數的scope
    //(function() {
    if (!Array.isArray(this._id)) {
      this.texture = this.Framework.resourceManager.getResource(
        this._id
      ) as CanvasImageSource;

      for (let i = 0; i < this.col * this.row; i++) {
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = Number(this.texture.width) / this.col;
        tmpCanvas.height = Number(this.texture.height) / this.row;

        const tmpContext = tmpCanvas.getContext("2d");
        tmpContext.drawImage(
          this.texture,
          -(Number(this.texture.width) / this.col) * (i % this.col),
          -(Number(this.texture.height) / this.row) * Math.floor(i / this.col)
        );
        this._sprites.push(new Sprite(this.Framework, tmpCanvas));
      }
      if (this.userInputFrom > this.userInputTo) {
        this._sprites.reverse();
      }
    } else {
      this._id.forEach((imgId) => {
        const tmpCanvas = document.createElement("canvas");
        const tmpImg = this.Framework.resourceManager.getResource(
          imgId
        ) as CanvasImageSource;
        const realWidth = Number(tmpImg.width) * this.scale;
        const realHeight = Number(tmpImg.height) * this.scale;
        tmpCanvas.width = realWidth;
        tmpCanvas.height = realHeight;
        const tmpContext = tmpCanvas.getContext("2d");
        tmpContext.drawImage(tmpImg, 0, 0);
        this._sprites.push(new Sprite(this.Framework, tmpCanvas));
      });

      this.texture = this._sprites[this.index];
    }

    //}).call(this);
    this._isLoadSprite = true;

    // }
  }

  public update(): void {
    if (this._start) {
      const addFrame = this.speed / 30;
      this.speedCounter += addFrame;
      while (this.speedCounter > 1) {
        this._nextFrame();
        this.speedCounter -= 1;
      }
    }
  }

  public draw(painter: GameObject | CanvasRenderingContext2D): void {
    painter = painter ?? this.Framework.game.context;
    if (!this._sprites || this._sprites.length == 0) {
      this.initialize();
    }

    this.texture = this._sprites[this.index];
    this.texture.position = this.position;
    this.texture.absolutePosition = this.absolutePosition;
    this.texture.rotation = this.rotation;
    this.texture.absoluteRotation = this.absoluteRotation;

    this.texture.scale = this.scale;
    this.texture.absoluteScale = this.absoluteScale;

    this.texture.spriteParent = this.spriteParent;
    this.texture.layer = this.layer;
    this.texture.isDrawBoundry = this.isDrawBoundry;
    this.texture.isDrawPace = this.isDrawPace;
    this.texture._changeFrame = this._changeFrame;

    this.texture.draw(painter);
  }

  public toString(): string {
    return "[AnimationSprite Object]";
  }

  public teardown(): void {
    if (typeof this._id === "string") {
      this.Framework.resourceManager.destroyResource(this._id);
    } else if (this._type === "more") {
      this._sprites.forEach((s) => {
        s.teardown();
      });
    }
  }
}

interface AnimationSpriteOption {
  url?: string | string[];
  speed: number;
  loop: boolean;
  col?: number;
  row?: number;
}

interface startOption {
  from: number;
  to: number;
  speed?: number;
  loop: boolean;
  finishPlaying?: () => void;
}
