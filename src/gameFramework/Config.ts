export default class Config {
  constructor() {
    this.fps = 60;
    this.isBackwardCompatible = false;
    this.isOptimize = false; // 2017.02.20, from V3.1.1
    this.isMouseMoveRecorded = false;
    this.canvasWidth = 1920;
    this.canvasHeight = 1080;
  }

  public fps: number;
  public isBackwardCompatible: boolean;
  public isOptimize: boolean;
  public isMouseMoveRecorded: boolean;
  public canvasWidth: number;
  public canvasHeight: number;
  public canvasWidthRatio?: number;
  public canvasHeightRatio?: number;
}
