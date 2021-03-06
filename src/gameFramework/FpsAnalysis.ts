export default class FpsAnalysis {
  constructor() {
    this.timeData = new Array(60);
    this.fpsData = new Array(60);
    for (let i = 0; i < this.fpsData.length; i++) {
      this.timeData[i] = 0;
      this.fpsData[i] = 0;
    }
    this.currentPoint = 1;
    this.fps = 0;
    this.timeData[0] = new Date().getTime();
  }

  private timeData: number[];
  private fpsData: number[];
  private currentPoint: number;
  private fps: number;

  public update(): void {
    this.timeData[this.currentPoint] = new Date().getTime();
    this.fps -= this.fpsData[this.currentPoint];
    this.fpsData[this.currentPoint] =
      this.timeData[this.currentPoint] -
      (this.currentPoint === 0
        ? this.timeData[this.timeData.length - 1]
        : this.timeData[this.currentPoint - 1]);
    this.fps += this.fpsData[this.currentPoint];
    this.currentPoint = ++this.currentPoint % this.fpsData.length;
    //console.log(Math.floor((1000 / (this.fps / this.fpsData.length)) * 10) / 10)
  }

  public getUpdateFPS(): number {
    return Math.floor((1000 / (this.fps / this.fpsData.length)) * 10) / 10;
  }

  public toString(): string {
    return "[FpsAnalysis Object]";
  }
}
