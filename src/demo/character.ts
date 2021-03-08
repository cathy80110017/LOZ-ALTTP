import Framework from "../gameFramework";
import AnimationSprite from "../gameFramework/AnimationSprite";
import { xy } from "../gameFramework/interface";

export default class character {
  constructor(Framework: Framework, file: string, options: options) {
    this.options = options;
    this.url = file;
    //AnimationSprite當圖片是一整張圖片(連續圖), 而非Array時一定要給col, row三個(url是一定要的)
    this.sprite = new AnimationSprite(Framework, {
      url: this.url,
      col: 10,
      row: 7,
      loop: true,
      speed: 2,
    });
    //以下這句話的意思是當options.position為undefined時this.sprite.position = x: 0, y: 0}
    //若options.position有值, 則this.sprite.position = options.position
    //原因是在JS中, undefined會被cast成false
    this.sprite.position = options.position || { x: 0, y: 0 };
    this.sprite.scale = options.scale || 1;

    //由於0會被cast成false, 故不能用上面的方法來簡化
    this.sprite.rotation = options.rotation ?? 0;
    this.run();
  }

  private url: string;
  public sprite: AnimationSprite;
  private options: options;

  public run(): void {
    this.sprite.start({
      from: this.options.run.from,
      to: this.options.run.to,
      loop: true,
    });
  }

  public beHit(finishPlaying: () => void): void {
    //AnimationSprite.start可以指定要播放的張數(可倒著播放), 並且可以設定當播放完動作後, 要發生的事件
    this.sprite.start({
      from: this.options.beHit.from,
      to: this.options.beHit.to,
      loop: false,
      finishPlaying: finishPlaying,
    });
  }

  public hit(finishPlaying: () => void): void {
    this.sprite.start({
      from: this.options.hit.from,
      to: this.options.hit.to,
      loop: false,
      finishPlaying: finishPlaying,
    });
  }

  public collide(target: character): boolean {
    if (
      this.sprite.upperLeft.y <= target.sprite.lowerRight.y &&
      this.sprite.lowerLeft.y >= target.sprite.upperLeft.y &&
      this.sprite.upperLeft.x <= target.sprite.lowerRight.x &&
      this.sprite.lowerRight.x >= target.sprite.upperLeft.x
    ) {
      return true;
    }
  }
}

interface options {
  position?: xy;
  scale?: number;
  rotation?: number;
  run?: { from: number; to: number };
  beHit?: {
    from: number;
    to: number;
  };
  hit?: {
    from: number;
    to: number;
  };
}
