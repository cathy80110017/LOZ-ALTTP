import Framework from ".";
import Level from "./Level";

export default class GameMainMenu extends Level {
  constructor(Framework: Framework) {
    super(Framework);
    this.autoDelete = false;
  }
}
