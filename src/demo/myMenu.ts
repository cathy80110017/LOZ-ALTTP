import Framework from "../gameFramework";
import AnimationSprite from "../gameFramework/AnimationSprite";
import GameMainMenu from "../gameFramework/GameMainMenu";
import { requestInfo, xy } from "../gameFramework/interface";
import Scene from "../gameFramework/Scene";
import Sprite from "../gameFramework/Sprite";

const imgPath = "./assets/demo/image/";

export default class myMenu extends GameMainMenu {
  constructor(Framework: Framework) {
    super(Framework);
  }
  private loading: Sprite;
  private scrollBar: Sprite;
  private rightArrow: Sprite;
  private photo: AnimationSprite;
  private isTouchArrow: boolean;
  private previousTouch: xy;
  private currentTouch: xy;
  private center: Scene;

  public initializeProgressResource(): void {
    this.loading = new Sprite(this.Framework, imgPath + "loading.jpg");
    this.loading.position = {
      x: this.Framework.game.getCanvasWidth() / 2,
      y: this.Framework.game.getCanvasHeight() / 2,
    };
  }
  public loadingProgress(
    ctx: CanvasRenderingContext2D,
    requestInfo: requestInfo
  ): void {
    //console.log(Framework.ResourceManager.getFinishedRequestPercent())
    this.loading.draw(ctx);
    ctx.font = "90px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(
      Math.round(requestInfo.percent) + "%",
      ctx.canvas.width / 2,
      ctx.canvas.height / 2 + 300
    );
  }

  public load(): void {
    //Animation Sprite會用到的圖片資源
    const photoLink = [
      imgPath + "image1.png",
      imgPath + "image2.png",
      imgPath + "image3.png",
      imgPath + "image4.png",
      imgPath + "image5.png",
    ];

    this.scrollBar = new Sprite(this.Framework, imgPath + "scrollBar.png");
    this.rightArrow = new Sprite(this.Framework, imgPath + "rightArrow.png");
    this.photo = new AnimationSprite(this.Framework, {
      url: photoLink,
      loop: true,
      speed: 0.05,
    });

    this.isTouchArrow = false;
    this.previousTouch = { x: 0, y: 0 };
    this.currentTouch = { x: 0, y: 0 };

    //為了讓之後的位置較好操控, new出一個位於中心點且可以黏貼任何東西的容器
    //注意, Position都是用中心點
    this.center = new Scene(this.Framework);
    this.center.position = {
      x: this.Framework.game.getCanvasWidth() / 2,
      y: this.Framework.game.getCanvasHeight() / 2,
    };

    //由於scrollBar將會被attach到this.center上
    //故x設為0, 表示x也是要正中心
    this.scrollBar.position = {
      x: this.Framework.game.getCanvasWidth() / 2,
      y: (this.Framework.game.getCanvasHeight() / 4) * 3,
    };

    this.photo.position = {
      x: 0,
      y: 0,
    };

    //Framework支援scale, rotation等功能
    this.rightArrow.scale = 0.35;
    this.rightArrow.position = {
      x: this.Framework.game.getCanvasWidth() / 2 - 500,
      y: (this.Framework.game.getCanvasHeight() / 4) * 3,
    };

    this.center.attach(this.photo);

    //rootScene為系統預設的容器, 由於其他東西都被attach到center上
    //將物件attach到center上, 順序是會影響繪製出來的效果的
    this.rootScene.attach(this.center);
    this.rootScene.attach(this.scrollBar);
    this.rootScene.attach(this.rightArrow);

    //讓AnimationSprite開始被播放
    this.photo.start();
  }

  public initialize(): void {
    return;
  }

  public update(): void {
    this.rootScene.update();
    //this.rootScene.update();

    //目前的Framework, 當任何一個GameObject不做attach時, 則必須要自行update
    // this.center.update();
    this.scrollBar.update();
  }

  public draw(parentCtx: CanvasRenderingContext2D): void {
    //this.rootScene.draw();一定要在第一行
    this.rootScene.draw(parentCtx);
  }

  public mouseup(): void {
    this.isTouchArrow = false;
  }

  public mousedown(e?: xy): void {
    if (e) {
      console.log(e.x, e.y);
    }

    this.previousTouch = { x: e.x, y: e.y };
    if (
      this.previousTouch.x > this.rightArrow.upperLeft.x &&
      this.previousTouch.x < this.rightArrow.upperRight.x &&
      this.previousTouch.y > this.rightArrow.upperLeft.y &&
      this.previousTouch.y < this.rightArrow.lowerLeft.y
    ) {
      this.isTouchArrow = true;
    }
  }

  public mousemove(e?: xy): void {
    if (this.isTouchArrow) {
      this.currentTouch = { x: e.x, y: e.y };
      if (
        this.currentTouch.x > this.previousTouch.x &&
        this.currentTouch.y < this.rightArrow.lowerLeft.y &&
        this.currentTouch.y > this.rightArrow.upperLeft.y
      ) {
        //當arrow被Touch到時, 會跟隨著觸控的位置移動
        this.rightArrow.position.x =
          this.rightArrow.position.x +
          this.currentTouch.x -
          this.previousTouch.x;
        if (
          this.currentTouch.x >
          this.Framework.game.getCanvasWidth() - this.rightArrow.width
        ) {
          //當要換關時, 可以呼叫goToNextLevel, goToPreviousLevel, goToLevel(levelName)
          this.Framework.game.goToNextLevel();
        }
      }
    }
    this.previousTouch = this.currentTouch;
  }

  public touchstart(e: TouchEvent): void {
    //為了要讓Mouse和Touch都有一樣的事件
    //又要減少Duplicated code, 故在Touch事件被觸發時, 去Trigger Mouse事件
    this.mousedown({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  public touchend(): void {
    this.mouseup();
  }

  public touchmove(e: TouchEvent): void {
    this.mousemove({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }
}
