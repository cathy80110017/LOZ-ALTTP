import Config from "./Config";
import DebugInfo from "./DebugInfo";
import Game from "./Game";
import KeyBoardManager from "./KeyboardManager";
import MouseManager from "./MouseManager";
import Replayer from "./Replayer";
import ResourceManager from "./ResourceManager";
import TouchManager from "./TouchManager";

export default class Framework {
  constructor() {
    this.config = new Config();
    this.debugInfo = new DebugInfo();
    this.resourceManager = new ResourceManager();
    this.game = new Game(this);
    this.mouseManager = new MouseManager(this.game);
    this.keyboardManager = new KeyBoardManager();
    this.touchManager = new TouchManager(this.game);
    this.replayer = new Replayer(this.game);
  }
  public config: Config;
  public game: Game;
  public replayer: Replayer;
  public debugInfo: DebugInfo;
  public resourceManager: ResourceManager;
  public mouseManager: MouseManager;
  public keyboardManager: KeyBoardManager;
  public touchManager: TouchManager;
}
