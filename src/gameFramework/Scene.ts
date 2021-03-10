import Framework from ".";
import GameObject from "./GameObject";

export default class Scene extends GameObject {
  constructor(Framework: Framework) {
    super(Framework);
    this.attachArray = [];
  }

  public load(): void {
    this.attachArray.forEach(function (ele) {
      ele.load();
    }, this);
  }

  public initTexture(): void {
    this.attachArray.forEach((ele) => {
      if (typeof ele.initTexture !== "undefined") {
        ele.initTexture();
      }
    });
  }

  public update(): void {
    this.attachArray.forEach((ele) => {
      ele.update();
    });
  }

  public draw(painter?: GameObject | CanvasRenderingContext2D): void {
    painter = painter ?? this.Framework.game.context;
    //this.countAbsoluteProperty1();

    //if(this.isObjectChanged) {
    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.attachArray.forEach((ele) => {
      ele.draw(painter);
    });
    //}
  }

  /**
   * 將一個Object放進Scene中, 使其可以跟著連動
   * @method attach
   * @param {Object} target 必須是具有update和draw的物件,
   * 若不符合規定會throw exception
   * @example
   *     var sprite = new Sprite('clock.jpg'),
   *         scene = new Framework.Scene();
   *     sprite.position = { x: 100, y: 100 };
   *     scene.position = { x: 100, y: 100 };
   *     scene.attach(sprite);     //如此則Sprite的絕對位置會是在(200, 200)
   */
  public attach(target: GameObject): void {
    //if (Framework.Util.isUndefined(target.relativePosition)) {
    //    target.relativePosition = target.position || { x: 0, y: 0 };
    //}
    //if (Framework.Util.isUndefined(target.selfRotation)) {
    //    target.selfRotation = target.rotation || 0;
    //}
    //if (Framework.Util.isUndefined(target.selfScale)) {
    //    target.selfScale = target.scale || 1;
    //}
    if (typeof target === "undefined") {
      throw "target is undefined.";
    }

    if (
      typeof target.draw === "undefined" ||
      typeof target.update === "undefined"
    ) {
      throw "target.draw or target.update is undefined.";
    }

    if (this.layer > target.layer && target.spriteParent) {
      throw "target is the child of the object which be attached.";
    }

    this.attachArray.push(target);
    target.spriteParent = this;
    target.layer = this.layer + 1;
  }

  /**
   * 將一個Object移開Scene中, 使其不再跟著連動
   * @method detach
   * @param {Object} target 已經被attach的物件
   * @example
   *     detach(spriteInstace);
   */
  public detach(target: GameObject): void {
    let index = -1;
    for (let i = 0; i < this.attachArray.length; i++) {
      if (this.attachArray[i] === target) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      this.attachArray.splice(index, 1);
      target.spriteParent = undefined;
      target.layer = 1; //default
    }
  }

  public toString(): string {
    return "[Scene Object]";
  }

  public afterCreate(): void {
    super.afterCreate();
    this.pushSelfToLevel();
  }
}
