import QUnit from "qunit";
import EqualCondition from "./EqualCondition";
import Game from "./Game";
import { script } from "./interface";
class ReplayItem {
  constructor() {
    this.isDone = false;
  }

  public replayFunction: () => void;
  public infoString: string;
  private failString: string;
  private x: number;
  private y: number;
  private isDone: boolean;

  execute() {
    try {
      // console.log(this.infoString)
      this.replayFunction();
    } catch (err) {
      // console.error('Action Fail:' + this.infoString + "\n" + err)
      // Framework.Game.pause()
    }
    this.isDone = true;
  }
}

class AssertionItem {
  constructor(replayer: Replayer) {
    this.replayer = replayer;
  }

  public targetValue: string;
  public assertValue: any;
  public infoString: string;
  private failString: string;
  public delta: number;
  private replayer: Replayer;

  execute() {
    let isEqual: boolean;
    let assertMessage;

    if (typeof this.delta === "undefined") {
      this.delta = 0;
    }
    if (typeof this.assertValue === "number") {
      isEqual =
        this.assertValue - this.delta <=
          this.replayer.evaluate(this.targetValue) &&
        this.replayer.evaluate(this.targetValue) <=
          this.assertValue + this.delta;
    } else {
      isEqual = this.assertValue === this.replayer.evaluate(this.targetValue);
    }
    if (isEqual) {
      assertMessage = "Passed!";
      QUnit.assert.ok(isEqual, assertMessage);
    } else {
      assertMessage =
        "Assert Fail! targetValue: " +
        this.replayer.evaluate(this.targetValue) +
        ", assertValue: " +
        this.assertValue;
      assertMessage += "\nFail at " + this.infoString;
      QUnit.assert.ok(isEqual, assertMessage);
      //Framework.Game.pause()
    }
  }
}

export default class Replayer {
  /**
   * 自動測試重播系統
   *
   * @class Replayer
   *
   */

  constructor(game: Game) {
    this.game = game;
    this.cycleCount = 0;
    this.replayList = [];
    this.isStart = false;
    this.isWaiting = false;
    this.pollingFunction;
    this.waitingCounter = 0;
    this.waitingCondition;
    this.isReady = false;
    this.isTestEnd = false;
    this.isContinue = false;
    this.waitForTimeoutSecond = 30;
    this.waitForTimeout = 600;
    this.isQUnitStart = true;
    this.hasExecuteCommand = false;
    this.useGoToLevel = false;
    this.GREEN_LOG = "color: #6cbd45";
  }

  private cycleCount: number;
  private replayList: canExecute[];
  private isStart: boolean;
  private isWaiting: boolean;
  private pollingFunction: unknown;
  private waitingCounter: number;
  private waitingCondition: number | EqualCondition;
  private isReady: boolean;
  private isTestEnd: boolean;
  private isContinue: boolean;
  private waitForTimeoutSecond: number;
  private waitForTimeout: number;
  private isQUnitStart: boolean;
  private hasExecuteCommand: boolean;
  private useGoToLevel: boolean;
  private GREEN_LOG: string;
  private game: Game;

  public setGameReady(): void {
    if (this.useGoToLevel) {
      this.useGoToLevel = false;
      this.ready();
    } else {
      this.startQUnit();
      this.ready();
    }
  }

  public ready(scriptInfo?: script): void {
    //console.log('%c ----------------------------',this.GREEN_LOG)
    //console.log('%c Run Test:' + scriptInfo.name,this.GREEN_LOG)
    //if (! this.isReady) { // 2018.01.03 從下方搬上來, 無效
    //Framework.Game.resume() // <-- 追看看會不會造成cycleCount的差異
    //}
    this.isReady = true;
    this.isTestEnd = false;
    //Framework.Game.resume() // <-- 追看看會不會造成cycleCount的差異
  }

  public stopReplay(): void {
    this.cycleCount = 0;
    this.replayList = [];
    this.isReady = false;
    this.isTestEnd = true;
    this.game.pause();
    console.error("Test Stop");
  }

  public update(): void {
    if (this.isReady) {
      // <- 會不會跟這裡有關? Game.start().runFunction() (636) call Framework.Replayer.setGameReady();
      this.cycleCount++;
      //console.log("Cycle count = " + this.cycleCount)
      if (this.isWaiting == false) {
        if (this.replayList.length > 0) {
          this.hasExecuteCommand = true;
          this.executeCommand();
        } else {
          if (!this.isTestEnd) {
            if (this.hasExecuteCommand) {
              console.log("%c Test Case Success", this.GREEN_LOG);
              console.log("%c ----------------------------", this.GREEN_LOG);
              //Framework.Game.pause()
              this.isTestEnd = true;
              this.hasExecuteCommand = false;
              QUnit.start();
            }
          }
        }
      } else {
        this.waitLoop();
      }
      // if (this.replayList.length > 0) {
      //     if (this.isWaiting == false) {
      //         this.replayList[0].execute();
      //         this.replayList.shift();
      //     } else {
      //         this.waitLoop();
      //     }
      // }else
      // {
      //     if(!this.isTestEnd){
      //         console.log('%c Test Case Success',this.GREEN_LOG);
      //         console.log('%c ----------------------------',this.GREEN_LOG);
      //         Framework.Game.pause();
      //         this.isTestEnd = true;
      //     }
      // }
    }
  }

  public resetCycleCount(): void {
    this.cycleCount = 0;
  }

  public getCycleCount(): number {
    return this.cycleCount;
  }

  public resetWaitingCounter(): void {
    this.waitingCounter = 0;
  }

  public getWaitingCounter(): number {
    return this.waitingCounter;
  }

  public pause(): void {
    const item = new ReplayItem();
    item.replayFunction = function () {
      this.game.pause();
      //console.log("Replay pause at " + this.cycleCount + "th cycle")
    };
    this.replayList.push(item);
  }

  public resume(): void {
    const item = new ReplayItem();
    item.replayFunction = function () {
      this.game.resume();
    };
    this.replayList.push(item);
  }

  public assertEqual(
    targetValue: string,
    assertValue: any,
    delta?: number
  ): void {
    const item = new AssertionItem(this);
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.targetValue = targetValue;
    item.assertValue = assertValue;
    item.delta = delta;
    this.replayList.push(item);
  }

  public evaluate(objectString: string): any {
    return (this.game.currentLevel as { [key: string]: any })[objectString];
  }

  public executeCommand(): void {
    while (
      this.replayList.length > 0 &&
      this.isWaiting == false &&
      this.isReady == true &&
      this.game.isContinue == false
    ) {
      this.replayList[0].execute();
      this.replayList.shift();
    }
  }

  public waitFor(condition: number | EqualCondition): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;

    item.replayFunction = function () {
      if (typeof condition !== "number") {
        //console.log("wait start")
        condition.infoString = splliString;
      }
      this.waitForTimeout =
        this.waitForTimeoutSecond * this.game.getUpdateFPS();
      this.waitingCounter = 1;
      //this.waitingCounter = 0  // 2017.12.07 modify
      //this.waitingCounter = -2  // 2017.12.28 modify
      this.isWaiting = true;
      this.waitingCondition = condition;
    };
    this.replayList.push(item);
  }

  public waitLoop(): void {
    this.waitingCounter++;
    if (typeof this.waitingCondition === "number") {
      if (this.waitingCounter >= this.waitingCondition) {
        this.isWaiting = false;
        this.executeCommand();
      }
    } else {
      if (this.waitingCondition.isFitCondition()) {
        this.isWaiting = false;
        this.executeCommand();
      }
    }

    if (this.waitingCounter > this.waitForTimeout) {
      let timeoutMessage = "Wait For Timeout" + this.waitingCondition;
      if (typeof this.waitingCondition !== "number") {
        timeoutMessage += "\nFail at " + this.waitingCondition.infoString;
      }
      QUnit.assert.ok(false, timeoutMessage);
      this.game.pause();
    }
  }

  public mouseClick(x: number, y: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: x,
        y: y,
      };
      this.game.click(e);
    };
    this.replayList.push(item);
  }

  public mouseDown(x: number, y: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: x,
        y: y,
      };
      this.game.mousedown(e);
    };
    this.replayList.push(item);
  }

  public mouseUp(x: number, y: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: x,
        y: y,
      };
      this.game.mouseup(e); // 2017.02.21 added
    };
    this.replayList.push(item);
  }

  public mouseClickProperty(positionString: string): void {
    const item = new ReplayItem();

    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: this.evaluate(positionString).x,
        y: this.evaluate(positionString).y,
      };
      //console.log("Click " + e.x + " " + e.y)
      this.game.click(e);
    };
    this.replayList.push(item);
  }

  public mouseClickObject(objectString: string): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: this.evaluate(objectString).position.x,
        y: this.evaluate(objectString).position.y,
      };
      this.game.click(e);
    };
    this.replayList.push(item);
  }

  public mouseMove(x: number, y: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        x: x,
        y: y,
      };
      this.game.mousemove(e);
    };
    this.replayList.push(item);
  }

  public keyDown(key: string): void {
    const item = new ReplayItem();

    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        key: key,
      };
      this.game.keydown(e);
    };
    this.replayList.push(item);
  }

  public keyUp(key: string): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        key: key,
      };
      this.game.keyup(e);
    };
    this.replayList.push(item);
  }

  public keyPress(key: string): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      const e = {
        key: key,
      };
      this.game.keypress(e);
    };
    this.replayList.push(item);
  }

  public keyPressAndWait(key: string, cycle: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      this.keyDown(key);
      this.waitFor(cycle);
      this.keyUp(key);
    };
    this.replayList.push(item);
  }

  public startQUnit(): void {
    if (!this.isQUnitStart) {
      this.isQUnitStart = true;
      QUnit.start();
    }
  }

  public start(): void {
    // 從未被呼叫過?!
    this.game.isTestReady = true;
    this.game.isReplay = true; // 2017.12.13
    this.game.currentLevel = null;
    this.game.start();
    console.log("set up test");
  }

  public stop(): void {
    this.game.stop();
    console.log("tear down test");
  }

  public goToLevel(levelName: string): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      this.isReady = false;
      this.useGoToLevel = true;
      this.game.goToLevel(levelName);
    };
    this.replayList.push(item);
  }

  public executeFunction(functionName: string): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      this.evaluate(functionName);
    };
    this.replayList.push(item);
  }

  public setFPS(fps: number): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      this.game.setUpdateFPS(fps);
      this.game.setDrawFPS(fps);
    };
    this.replayList.push(item);
  }

  public resetFPS(): void {
    const item = new ReplayItem();
    const callStack = new Error().stack;
    const splliString = callStack
      .split("    at ")[2]
      .split("(")[1]
      .replace(")", "");
    item.infoString = splliString;
    item.replayFunction = () => {
      this.game.setUpdateFPS(this.game.config.fps);
      this.game.setDrawFPS(this.game.config.fps);
    };
    this.replayList.push(item);
  }
}

interface canExecute {
  execute: () => void;
}
