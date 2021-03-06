export default class Point {
  constructor(x = 0, y = 0) {
    this._x = Math.floor(x);
    this._y = Math.floor(y);

    Object.defineProperty(this, "x", {
      set: function (newValue) {
        this._x = Math.floor(newValue);
      },
      get: function () {
        return this._x;
      },
    });

    Object.defineProperty(this, "y", {
      set: function (newValue) {
        this._y = Math.floor(newValue);
      },
      get: function () {
        return this._y;
      },
    });
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
