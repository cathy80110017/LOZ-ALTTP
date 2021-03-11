import { myGameLevel1 } from "./demo/myGameLevel1";
import myMenu from "./demo/myMenu";
import Framework from "./gameFramework";
import "../assets/scss/index.scss";
const framework = new Framework();

framework.game.addNewLevel({ menu: new myMenu(framework) });
framework.game.addNewLevel({ level1: new myGameLevel1(framework) });

framework.game.start();
