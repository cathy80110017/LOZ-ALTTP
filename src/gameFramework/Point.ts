export default class Point {
  constructor(x = 0, y = 0) {
    this._x = Math.floor(x);
    this._y = Math.floor(y);
  }
  private _x: number;
  private _y: number;

  public set x(v: number) {
    this._x = Math.floor(v);
  }
  public get x(): number {
    return this._x;
  }

  public set y(v: number) {
    this._y = Math.floor(v);
  }
  public get y(): number {
    return this._y;
  }
}
