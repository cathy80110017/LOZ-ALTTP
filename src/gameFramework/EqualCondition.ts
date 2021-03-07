// By Raccoon
// include namespace

import Replayer from "./Replayer";

export default class EqualCondition {
  constructor(
    replayer: Replayer,
    targetProperty: string,
    targetValue: number | boolean,
    delta: number
  ) {
    this.replayer = replayer;
    this.targetProperty = targetProperty;
    this.targetValue = targetValue;
    this.delta = delta;
    this._infoString = "";
  }

  private _infoString: string;
  private replayer: Replayer;
  private targetProperty: string;
  private targetValue: number | boolean;
  private delta: number;

  public set infoString(v: string) {
    this._infoString = v;
  }

  public get infoString(): string {
    return this._infoString;
  }

  public isFitCondition(): boolean {
    const objectValue = this.replayer.evaluate(this.targetProperty);
    if (typeof this.targetValue === "number") {
      if (
        objectValue >= this.targetValue - this.delta &&
        objectValue <= this.targetValue + this.delta
      ) {
        return true;
      }
    } else if (typeof this.targetValue === "boolean") {
      if (objectValue === this.targetValue) {
        return true;
      }
    }
  }
}
