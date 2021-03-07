import Config from "./Config";
import $ from "jquery";
import FpsAnalysis from "./FpsAnalysis";
import Recorder from "./Recorder";
import Level from "./Level";
import Point from "./Point";
import { findValueByKey } from "./Utils";
import GameObject from "./GameObject";
import Framework from ".";
import { key, xy, script } from "./interface";

export default class Game {
  constructor(Framework: Framework, isRecordMode = false, isTestMode = false) {
    this.config = Framework.config;
    this.fps = this.config.fps;
    this.canvasWidth = this.config.canvasWidth;
    this.canvasHeight = this.config.canvasHeight;
    this.isBackwardCompatible = this.config.isBackwardCompatible;
    this.widthRatio = 1;
    this.heightRatio = 1;
    this.isFullScreen = false;
    this.isRecording = false;
    this.isRecordMode = isRecordMode;
    this.isTestMode = isTestMode;
    this.isTestReady = false;
    this.isReplay = false;
    this.isContinue = false;
    this.isInit = false;
    this.isRunning = false;
    this.fpsContext = undefined;
    this.fpsAnalysis = new FpsAnalysis();
    this.drawfpsAnalysis = new FpsAnalysis();
    this.runInstance = undefined;
    this.levels = [];
    this.testScripts = [];
    this.currentLevel = undefined;
    this.context = null;
    this.currentTestScript = undefined;
    this.currentReplay = undefined;
    this.ideaWidth = this.config.canvasWidthRatio || 9;
    this.ideaHeight = this.config.canvasHeightRatio || 16;
    this.timelist = [];
    this.record = new Recorder();
    this.tempUpdate = () => {
      return;
    };
    this.tempDraw = () => {
      return;
    };
    this.stopLoop = this.stopAnimationFrame;
    //this.stopLoop = this.stopInterval

    this.mainContainer = document.createElement("div");
    this.mainContainer.setAttribute("id", "main-container");
    $(this.mainContainer).css({
      backgroundColor: "#000000",
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    });
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("id", "game-canvas");
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    $(this.canvas).css({ backgroundColor: "#000000" });
    this.context = this.canvas.getContext("2d");
    this.mainContainer.appendChild(this.canvas);
  }
  public config: Config;
  private fps: number;
  private canvasWidth: number;
  private canvasHeight: number;
  public isBackwardCompatible: boolean;
  public widthRatio: number;
  public heightRatio: number;
  private isFullScreen: boolean;
  private isRecording: boolean;
  private isRecordMode: boolean;
  private isTestMode: boolean;
  public isTestReady: boolean;
  public isReplay: boolean;
  public isContinue: boolean;
  private isInit: boolean;
  private isRunning: boolean;
  private fpsContext: HTMLElement; // ?
  private fpsAnalysis: FpsAnalysis;
  private drawfpsAnalysis: FpsAnalysis;
  private runInstance: number;
  private levels: { name: string; level: Level }[];
  private testScripts: script[];
  public currentLevel: Level;
  public context: CanvasRenderingContext2D;
  private currentTestScript: any;
  private currentReplay: any;
  private ideaWidth: number;
  private ideaHeight: number;
  private timelist: number[];
  private record: Recorder;
  private tempUpdate: () => void;
  private tempDraw: (ctx: CanvasRenderingContext2D) => void;
  private stopLoop: () => void;
  public mainContainer: HTMLDivElement;
  public canvas: HTMLCanvasElement;
  private skipTicks: number;
  private Framework: Framework;

  public recordStart(): void {
    if (document.getElementById("start_btn").getAttribute("enable") == "true") {
      if (this.isRecordMode) {
        this.isRecording = true;
        document.getElementById("start_btn").setAttribute("enable", "false");
        document.getElementById("pause_btn").setAttribute("enable", "true");
        document.getElementById("stop_btn").setAttribute("enable", "true");
        document.getElementById("type_btn").setAttribute("enable", "true");
        document.getElementById("replay_btn").setAttribute("enable", "true");
        document.getElementById("letiable_btn").setAttribute("enable", "false");
        this.btnEnable();
        this.record.start();
        this.resume();
      }
      // ↓如果在replay mode下按了 Record btn, 應該要停止後續的replay動作, 同時放棄後續的腳本, 重新錄製新的腳本才對吧!
      // 試試在這裡把isReplay設為false, 看看 updateFunc() 能不能過.
      // 2017.12.13 : 在Recording mode下replay, Record.waitCounter 和 Replay._waitingCounter 似乎可以調齊了,
      // 但在 _isTestMode = true 下Replay, 仍然快一個cycle,
      // to do  : 1. 錄製時, assertion game.cycleCount, 2. dump cyclecount 來比較
      if (this.isReplay) {
        this.isReplay = false; // 2017.12.13 增加
        this.isContinue = true; // <-- 只有在 Replay.executeCommend()裡被用到一次
        this.isRecordMode = true;
        document.getElementById("start_btn").setAttribute("enable", "false");
        document.getElementById("pause_btn").setAttribute("enable", "true");
        document.getElementById("stop_btn").setAttribute("enable", "true");
        document.getElementById("type_btn").setAttribute("enable", "true");
        document.getElementById("replay_btn").setAttribute("enable", "true");
        document.getElementById("letiable_btn").setAttribute("enable", "false");
        this.btnEnable();
      }
    }
  }

  public recordPause(): void {
    if (document.getElementById("pause_btn").getAttribute("enable") == "true") {
      if (this.isRecordMode) {
        this.isRecording = false;
        document.getElementById("start_btn").setAttribute("enable", "true");
        document.getElementById("pause_btn").setAttribute("enable", "false");
        document.getElementById("stop_btn").setAttribute("enable", "true");
        document.getElementById("type_btn").setAttribute("enable", "true");
        document.getElementById("replay_btn").setAttribute("enable", "false");
        document.getElementById("letiable_btn").setAttribute("enable", "true");
        this.btnEnable();
        this.record.pause();
        this.pause();
      }
    }
  }

  public recordStop(): void {
    if (document.getElementById("stop_btn").getAttribute("enable") == "true") {
      if (this.isRecordMode) {
        this.isRecording = false;
        document.getElementById("start_btn").setAttribute("enable", "false");
        document.getElementById("pause_btn").setAttribute("enable", "false");
        document.getElementById("stop_btn").setAttribute("enable", "false");
        document.getElementById("type_btn").setAttribute("enable", "false");
        document.getElementById("replay_btn").setAttribute("enable", "true");
        document.getElementById("letiable_btn").setAttribute("enable", "false");
        this.btnEnable();
        this.record.stop();
      }
    }
  }

  public recordInput(): void {
    if (document.getElementById("type_btn").getAttribute("enable") == "true") {
      const command = prompt("Please enter comment", "");

      if (command != null) {
        this.record.inputCommand("//" + command);
      }
    }
  }

  public recordReplay(): void {
    if (
      document.getElementById("replay_btn").getAttribute("enable") == "true"
    ) {
      this.isReplay = true;
      this.teardown();
      this.currentLevel = null;
      this.isRecordMode = false;
      this.isTestMode = true;
      this.record.isRecording = false; // 為了讓 Record.start() 進入記錄 recordString 的區塊
      this.isContinue = false;

      this.Framework.replayer.resetCycleCount();
      this.Framework.replayer.resetWaitingCounter();
      const replayScript = document.getElementById("record_div").innerText;
      document.getElementById("record_div").innerText = "";

      this.getReplayScript(replayScript);
      this.record.start();
      this.isRecording = true;
      this.start();
      //this.isRecording = true
      if (document.getElementById("letiable_list") != null) {
        const div = document.getElementById("letiable_list");
        div.parentNode.removeChild(div);
      }
      document.getElementById("start_btn").setAttribute("enable", "true");
      document.getElementById("pause_btn").setAttribute("enable", "false");
      document.getElementById("stop_btn").setAttribute("enable", "false");
      document.getElementById("type_btn").setAttribute("enable", "true");
      document.getElementById("replay_btn").setAttribute("enable", "false");
      document.getElementById("letiable_btn").setAttribute("enable", "false");
      this.btnEnable();
    }
  }

  public getReplayScript(script: string): void {
    script = script.replace(/\n/g, "");
    const start = script.indexOf("{", 0) + 1;
    let end = script.indexOf("}", 0);
    if (end === -1) end = script.length;
    const mainScript = script.substring(start, end).split(";");
    for (let i = 0; i < mainScript.length; i++) {
      mainScript[i] = mainScript[i].replace("\u00a0\u00a0\u00a0\u00a0", "");
      // if(mainScript[i].indexOf("//", 0) === -1){
      // comment 的部分被直接pass掉, 但是仍然會耗一個cycle, asserting 應該也是, 要怎麼補回來?
      if (mainScript[i].indexOf("replay.assertEqual") != 0) {
        eval(mainScript[i]); // <- 接著會進入 Replay.waitFor() why?
      }
      // }
    }
  }

  public showletiable(): void {
    const maindiv = document.getElementById("main");
    if (
      document.getElementById("letiable_list") == null &&
      document.getElementById("letiable_btn").getAttribute("enable") == "true"
    ) {
      const letiableDiv = document.createElement("div");
      letiableDiv.id = "letiable_list";
      letiableDiv.style.cssText =
        "width:100%;height:30%;background-color:#d3e0e6;overflow:auto;font-size:20;";
      maindiv.appendChild(letiableDiv);
    } else {
      const div = document.getElementById("letiable_list");
      if (div != null) {
        div.parentNode.removeChild(div);
      }
    }
    listMember("Framework.Game.currentLevel", "&nbsp", "letiable_list");
  }

  public btnMouseOver(button: HTMLImageElement): void {
    if (button.getAttribute("enable") === "true") {
      if (button.id == "start_btn")
        button.src = "../../src/image/play_over.png";
      if (button.id == "pause_btn")
        button.src = "../../src/image/pause_over.png";
      if (button.id == "stop_btn") button.src = "../../src/image/stop_over.png";
      if (button.id == "type_btn")
        button.src = "../../src/image/addComment_over.png";
      if (button.id == "replay_btn")
        button.src = "../../src/image/replay_over.png";
      if (button.id == "letiable_btn")
        button.src = "../../src/image/letiable_over.png";
    }
  }

  public btnMouseOut(button: HTMLImageElement): void {
    if (button.getAttribute("enable") === "true") {
      if (button.id == "start_btn") button.src = "../../src/image/play.png";
      if (button.id == "pause_btn") button.src = "../../src/image/pause.png";
      if (button.id == "stop_btn") button.src = "../../src/image/stop.png";
      if (button.id == "type_btn")
        button.src = "../../src/image/addComment.png";
      if (button.id == "replay_btn") button.src = "../../src/image/replay.png";
      if (button.id == "letiable_btn")
        button.src = "../../src/image/letiable.png";
    }
  }

  public btnEnable(): void {
    if (document.getElementById("start_btn").getAttribute("enable") === "true")
      (document.getElementById("start_btn") as HTMLImageElement).src =
        "../../src/image/play.png";
    else
      (document.getElementById("start_btn") as HTMLImageElement).src =
        "../../src/image/play_disable.png";

    if (document.getElementById("pause_btn").getAttribute("enable") === "true")
      (document.getElementById("pause_btn") as HTMLImageElement).src =
        "../../src/image/pause.png";
    else
      (document.getElementById("pause_btn") as HTMLImageElement).src =
        "../../src/image/pause_disable.png";

    if (document.getElementById("stop_btn").getAttribute("enable") === "true")
      (document.getElementById("stop_btn") as HTMLImageElement).src =
        "../../src/image/stop.png";
    else
      (document.getElementById("stop_btn") as HTMLImageElement).src =
        "../../src/image/stop_disable.png";

    if (document.getElementById("type_btn").getAttribute("enable") === "true")
      (document.getElementById("type_btn") as HTMLImageElement).src =
        "../../src/image/addComment.png";
    else
      (document.getElementById("type_btn") as HTMLImageElement).src =
        "../../src/image/addComment_disable.png";

    if (document.getElementById("replay_btn").getAttribute("enable") === "true")
      (document.getElementById("replay_btn") as HTMLImageElement).src =
        "../../src/image/replay.png";
    else
      (document.getElementById("replay_btn") as HTMLImageElement).src =
        "../../src/image/replay_disable.png";

    if (
      document.getElementById("letiable_btn").getAttribute("enable") === "true"
    )
      (document.getElementById("letiable_btn") as HTMLImageElement).src =
        "../../src/image/letiable.png";
    else
      (document.getElementById("letiable_btn") as HTMLImageElement).src =
        "../../src/image/letiable_disable.png";
  }

  public click(e: xy): void {
    this.currentLevel.click(e);
    if (this.isRecording) {
      this.record.click(e);
    }
  }

  public mousedown(e: xy): void {
    this.currentLevel.mousedown(e);
    if (this.isRecording) {
      this.record.mousedown(e);
    }
  }

  public mouseup(e: xy): void {
    this.currentLevel.mouseup(e);
    if (this.isRecording) {
      this.record.mouseup(e);
    }
  }

  public mousemove(e: xy): void {
    this.currentLevel.mousemove(e);
    if (this.isRecording) {
      this.record.mousemove(e);
    }
  }

  public touchstart(e: TouchEvent): void {
    this.currentLevel.touchstart(e);
  }

  public touchend(e: TouchEvent): void {
    this.currentLevel.touchend(e);
  }

  public touchmove(e: TouchEvent): void {
    this.currentLevel.touchmove(e);
  }

  public keydown(e: key): void {
    this.currentLevel.keydown(e);
    if (this.isRecording) {
      this.record.keydown(e);
    }
  }

  public keyup(e: key): void {
    this.currentLevel.keyup(e);
    if (this.isRecording) {
      this.record.keyup(e);
    }
  }

  public keypress(e: key): void {
    this.currentLevel.keypress(e);
    if (this.isRecording) {
      this.record.keypress(e);
    }
  }

  public initializeProgressResource(): void {
    this.currentLevel.initializeProgressResource();
  }

  public load(): void {
    this.currentLevel.load();
    if (this.isBackwardCompatible) {
      this.currentLevel.initialize();
    }
  }

  public loadingProgress(context: CanvasRenderingContext2D): void {
    this.currentLevel.loadingProgress(context, {
      request: this.Framework.resourceManager.getRequestCount(),
      response: this.Framework.resourceManager.getResponseCount(),
      percent: this.Framework.resourceManager.getFinishedRequestPercent(),
    });
    if (this.isBackwardCompatible) {
      this.initializeProgressResource();
    }
  }

  public initialize(): void {
    this.currentLevel.initialize();
    this.initializeTestScript(this.currentLevel);
  }

  public initializeTestScript(level: Level): void {
    const levelName = this.findLevelNameByLevel(level);
    for (let i = 0, l = this.testScripts.length; i < l; i++) {
      if (this.testScripts[i].targetLevel === levelName) {
        this.Framework.replayer.ready(this.testScripts[i]);
        return;
      }
    }
  }

  public update(): void {
    this.currentLevel.update();
  }

  public draw(): void {
    this.currentLevel.draw(this.context); // ?
  }

  public teardown(): void {
    this.currentLevel.autodelete();
    this.isInit = false;
  }

  public stop(): void {
    this.pause();
    this.teardown();
  }

  public getCanvasTopLeft(): Point {
    return new Point(this.canvas.offsetLeft, this.canvas.offsetTop);
  }

  public getCanvasWidth(): number {
    return this.canvas.width;
  }

  public getCanvasHeight(): number {
    return this.canvas.height;
  }

  public findLevel(name: string): Level {
    const result = findValueByKey(this.levels, name);
    if (result === null) {
      return null;
    } else {
      return result.level;
    }
  }

  public findScript(name: string): string {
    const result = findValueByKey(this.testScripts, name);

    if (result === null) {
      return null;
    } else {
      return result.script;
    }
  }

  public findLevelNameByLevel(level: Level): string {
    for (let i = 0, l = this.levels.length; i < l; i++) {
      if (this.levels[i].level === level) {
        return this.levels[i].name;
      }
    }
  }

  public addNewLevel(leveldata: Level[]): void {
    for (const i in leveldata) {
      if (leveldata.hasOwnProperty(i)) {
        if (!this.findLevel(i)) {
          this.levels.push({ name: i, level: leveldata[i] });
        } else {
          /*Framework.DebugInfo.Log.error('Game : 關卡名稱不能重複')
                    throw new Error('Game: already has same level name')*/
          this.changeLevelData(i, leveldata[i]);
        }
      }
    }
  }

  public changeLevelData(levelName: string, levelObj: Level): void {
    let toChange: number;
    this.levels.forEach((level, index) => {
      if (level.name === levelName) {
        toChange = index;
      }
    });
    delete this.levels[toChange];
    this.levels[toChange] = { name: levelName, level: levelObj };
  }

  public addNewTestScript(
    levelName: string,
    scriptName: string,
    scriptInstance: string
  ): void {
    /*let levelName = levelName
        let scriptName = scriptName
        let scriptInstance = scriptInstance*/
    if (!this.findScript(scriptName)) {
      this.testScripts.push({
        targetLevel: levelName,
        name: scriptName,
        script: scriptInstance,
      });
    } else {
      this.Framework.debugInfo.Log.error("Game : Script名稱不能重複");
      throw new Error("Game: already has same script name");
    }
  }

  public goToLevel(levelName: string): void {
    this.pause();
    this.teardown();
    this.currentLevel = this.findLevel(levelName);
    this.Framework.replayer.resetCycleCount();
    if (!this.currentLevel) {
      this.Framework.debugInfo.Log.error("Game : 找不到關卡");
      throw new Error("Game : levelName not found.");
    }
    if (this.isRecordMode) {
      this.record.inputCommand("// Change Level :" + levelName + ";");
    }
    this.start();
  }

  public reLoadLevel(): void {
    this.pause();
    this.teardown();
    this.Framework.replayer.resetCycleCount();
    this.start();
  }

  public goToNextLevel(): void {
    this.pause();
    this.teardown();
    let flag = false;
    this.Framework.replayer.resetCycleCount();
    this.Framework.replayer.resetWaitingCounter();
    for (const i in this.levels) {
      if (flag) {
        this.currentLevel = this.levels[i].level;
        if (this.isRecordMode) {
          const levelName = this.findLevelNameByLevel(this.currentLevel);
          this.record.inputCommand("// Change Level :" + levelName + ";");
        }
        this.start();
        return;
      }
      if (this.levels[i].level === this.currentLevel) {
        flag = true;
      }
    }
    this.Framework.debugInfo.Log.error("Game : 無下一關");
    throw new Error("Game : can't goto next level.");
  }

  public goToPreviousLevel(): void {
    this.pause();
    this.teardown();
    const flag = false;
    let prev = undefined;
    this.Framework.replayer.resetCycleCount();
    for (const i in this.levels) {
      if (this.levels[i].level === this.currentLevel) {
        if (!prev) {
          this.currentLevel = prev;
          if (this.isRecordMode) {
            const levelName = this.findLevelNameByLevel(this.currentLevel);
            this.record.inputCommand("// Change Level To : " + levelName + ";");
          }
          this.start();
          return;
        }
        break;
      }
      prev = this.levels[i].level;
    }
    this.Framework.debugInfo.Log.error("Game : 無前一關");
    throw new Error("Game : can't goto previous level.");
  }

  public start(): void {
    if (!this.isReplay) {
      if (this.isTestMode && this.isTestReady === false) {
        return;
      }
    }
    if (!this.currentLevel) {
      this.currentLevel = this.levels[0].level;
    }
    if (!this.isInit) {
      this.resizeEvent();
      document.body.appendChild(this.mainContainer);
      window.addEventListener("resize", this.resizeEvent, false);
    }
    this.initializeProgressResource();
    const runFunction = function () {
      this.isRunning = true;
      this.pause();
      this.initialize();
      this.draw = this.currentLevel.draw.bind(this.currentLevel);
      this.update = this.currentLevel.update.bind(this.currentLevel);
      this.Framework.replayer.setGameReady();
      this.run();
    }.bind(this);
    const initFunction = function () {
      if (
        this.Framework.resourceManager.getRequestCount() !==
        this.Framework.resourceManager.getResponseCount()
      ) {
        return;
      }
      this.isInit = true;
      this.draw = this.loadingProgress;
      this.update = () => {
        return;
      };
      this.run();
      this.isRunning = false;
      this.load();
      if (
        this.Framework.resourceManager.getRequestCount() ===
        this.Framework.resourceManager.getResponseCount()
      ) {
        runFunction();
      }
    }.bind(this);
    const a = function () {
      if (!this.isInit) {
        initFunction();
        return;
      }
      if (!this.isRunning) {
        runFunction();
      }
    }.bind(this);
    this.Framework.resourceManager.setSubjectFunction(a);
    initFunction();
    this.Framework.touchManager.subject = this.currentLevel;
    this.Framework.touchManager.userTouchstartEvent = this.touchstart;
    this.Framework.touchManager.userTouchendEvent = this.touchend;
    this.Framework.touchManager.userTouchmoveEvent = this.touchmove;

    this.Framework.mouseManager.userClickEvent = (e) => this.click(e);
    this.Framework.mouseManager.userMouseDownEvent = (e) => this.mousedown(e);
    this.Framework.mouseManager.userMouseUpEvent = (e) => this.mouseup(e);
    this.Framework.mouseManager.userMouseMoveEvent = (e) => this.mousemove(e);
    //Framework.MouseManager.userContextMenuEvent = this.contextmenu;

    this.Framework.keyboardManager.subject = this.currentLevel;
    this.Framework.keyboardManager.userKeyupEvent = this.keyup;
    this.Framework.keyboardManager.userKeydownEvent = this.keydown;
  }

  public run(): void {
    const nowFunc = function () {
      return new Date().getTime();
    };
    const updateTicks = 1000 / this.fps;
    const drawTicks = 1000 / this.fps;
    const previousUpdateTime = nowFunc();
    const previousDrawTime = previousUpdateTime;
    let now = previousDrawTime;
    let nextGameTick = now;
    let nextGameDrawTick = now;
    this.skipTicks = Math.round(1000 / this.fps);
    const updateFunc = function () {
      now = nowFunc();
      if (now > nextGameTick) {
        this.fpsAnalysis.update();
        if (this.fpsContext) {
          this.fpsContext.innerHTML =
            "update FPS:" +
            this.fpsAnalysis.getUpdateFPS() +
            "<br />draw FPS:" +
            this.drawfpsAnalysis.getUpdateFPS();
        }
        this.update();

        if (this.isRecording) {
          if (
            this.isReplay == false ||
            this.Framework.replayer.getWaitingCounter() > 0
          ) {
            // ok, 但game的cycleCount還是不一致
            this.record.update(); // 哪裡會多做一次呢? 怎麼知道是 game 啟動時第一次的update嗎? 來跳過去?
            // 或者是如果同時也是 this.isReplay = true 的話, 看Replay.cycleCount若>0才允許record.update()?
          }
          //console.log("record update")  為了同步 Record的cycleCount?
        }
        if (this.isReplay) {
          this.Framework.replayer.update();
        }
        nextGameTick += this.skipTicks;
      }
    }.bind(this);
    const drawFunc = function () {
      if (now >= nextGameDrawTick) {
        this.draw(this.context);
        this.drawfpsAnalysis.update();
        if (this.fpsContext) {
          this.fpsContext.innerHTML =
            "update FPS:" +
            this.fpsAnalysis.getUpdateFPS() +
            "<br />draw FPS:" +
            this.drawfpsAnalysis.getUpdateFPS();
        }
        nextGameDrawTick += this.skipTicks;
      }
    }.bind(this);
    const gameLoopFunc = function () {
      /*let currentUpdate = Date.now()
            if(this.lastUpdate) {
                console.log(currentUpdate - this.lastUpdate + ' ms')
            }
            this.lastUpdate = currentUpdate*/
      const preDraw = Date.now();
      updateFunc();
      drawFunc();

      const drawTime = Date.now() - preDraw;
      if (drawTime > 5) {
        this.timelist.push(drawTime);
      }
      if (this.timelist.length >= 30) {
        const average = this.countAverage(this.timelist);
        this.timelist = [];
      }
    }.bind(this);
    this.isRunning = true;
    this.runAnimationFrame(gameLoopFunc);
    //this.runInterval(gameLoopFunc)
  }

  public countAverage(list: number[]): number {
    let sum = 0;
    for (let i = 0; i < list.length; i++) {
      sum += list[i];
    }
    return sum / list.length;
  }

  public stopInterval(): void {
    clearInterval(this.runInstance);
  }

  public stopAnimationFrame(): void {
    cancelAnimationFrame(this.runInstance);
  }

  public runAnimationFrame(gameLoopFunc: () => void): void {
    window.requestAnimationFrame =
      window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    const _run = function () {
      gameLoopFunc();
      if (this.isRunning) {
        this.runInstance = requestAnimationFrame(_run);
      }
    }.bind(this);
    _run();
    this.stopLoop = this.stopAnimationFrame;
  }

  public runInterval(gameLoopFunc: () => void): void {
    const drawTicks = 1000 / this.fps;

    this.runInstance = window.setInterval(gameLoopFunc, drawTicks);
    this.stopLoop = this.stopInterval;
  }

  public pause(): void {
    if (this.isRunning) {
      this.stopLoop();
      this.runInstance = null;
      this.isRunning = false;
    }
  }

  public resume(): void {
    if (!this.isRunning) {
      this.run();
    }
  }

  public setUpdateFPS(fps: number): void {
    if (fps > 60) {
      this.Framework.debugInfo.Log.warning("FPS must be smaller than 60.");
      throw "FPS must be smaller than 60.";
      fps = 60;
    }
    this.skipTicks = Math.round(1000 / this.fps);
    this.fps = fps;
    this.pause();
    this.run();
  }

  public getUpdateFPS(): number {
    return this.fps;
  }

  public setDrawFPS(fps: number): void {
    if (fps > 60) {
      this.Framework.debugInfo.Log.warning("FPS must be smaller than 60.");
      throw "FPS must be smaller than 60.";
      fps = 60;
    }
    this.fps = fps;
    this.pause();
    this.run();
  }

  public getDrawFPS(): number {
    return this.fps;
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    if (canvas) {
      this.canvas = null;
      this.context = null;
      this.canvas = canvas;
      this.mainContainer.innerHTML = "";
      this.mainContainer.appendChild(this.canvas);
      this.context = this.canvas.getContext("2d");
    }
  }

  public setContext(context: CanvasRenderingContext2D): void {
    if (!context) {
      this.context = null;
      this.canvas = null;
      this.context = context;
    } else {
      this.Framework.debugInfo.Log.error("Game SetContext Error");
    }
  }

  public getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  public fullScreen(ele: HTMLElement): void {
    ele = ele ?? this.mainContainer;

    // current working methods
    if (ele.requestFullscreen) {
      ele.requestFullscreen();
    } else if ((ele as any).msRequestFullscreen) {
      (ele as any).msRequestFullscreen();
    } else if ((ele as any).mozRequestFullScreen) {
      (ele as any).mozRequestFullScreen();
    } else if ((ele as any).webkitRequestFullscreen) {
      (ele as any).webkitRequestFullscreen((<any>Element).ALLOW_KEYBOARD_INPUT);
    }
  }

  public exitFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  public resizeEvent(): void {
    let base = 0;
    let baseWidth = window.innerWidth / this.ideaWidth;
    let baseHeight = window.innerHeight / this.ideaHeight;
    let scaledWidth = 0;
    let scaledHeight = 0;
    if (this.isTestMode || this.isRecordMode) {
      baseWidth = (window.innerWidth * 0.7) / this.ideaWidth;
      baseHeight = (window.innerHeight * 0.7) / this.ideaHeight;
    }
    if (baseWidth < baseHeight) {
      base = baseWidth;
    } else {
      base = baseHeight;
    }

    scaledWidth = base * this.ideaWidth;
    scaledHeight = base * this.ideaHeight;
    this.widthRatio = scaledWidth / this.canvas.width;
    this.heightRatio = scaledHeight / this.canvas.height;
    this.canvas.style.width = scaledWidth + "px";
    this.canvas.style.height = scaledHeight + "px";
    // Framework.HtmlElementUI.resize(); //TODO
    // if (this.currentLevel.map) {
    //   this.currentLevel.matter.render.canvas.style.width = scaledWidth + "px";
    //   this.currentLevel.matter.render.canvas.style.height = scaledHeight + "px";
    // }
  }

  public pushGameObj(ele: GameObject): void {
    this.currentLevel.allGameElement.push(ele);
  }

  public showAllElement(): void {
    this.currentLevel.showAllElement();
  }
}

function listMember(main: string, space: string, divId: string) {
  if (document.getElementById(divId + "_check")) {
    if (
      (document.getElementById(divId + "_check") as HTMLImageElement).src.match(
        "../../src/image/arrow_over.png"
      )
    ) {
      (document.getElementById(divId + "_check") as HTMLImageElement).src =
        "../../src/image/arrow.png";
    } else {
      (document.getElementById(divId + "_check") as HTMLImageElement).src =
        "../../src/image/arrow_over.png";
    }
  }
  const div = document.getElementById(divId);
  //    var length = div.childNodes.length;
  let length = 0;
  if (div != null && div.childNodes != null) {
    length = div.childNodes.length;
  }
  if (length > 4) {
    for (let i = 4; i < length; i++) {
      div.removeChild(div.childNodes[4]);
    }
  } else {
    for (const key in eval(main)) {
      //not function
      try {
        if (eval(main)[key].toString().indexOf("function", 0) === -1) {
          if (
            key != "rootScene" &&
            key != "autoDelete" &&
            key != "_firstDraw" &&
            key != "_allGameElement"
          ) {
            const varDiv = document.createElement("div");
            varDiv.id = key;
            varDiv.setAttribute("vertical-align", "baseline");
            const checkBox = document.createElement("img");
            checkBox.setAttribute("src", "../../src/image/arrow.png");
            checkBox.setAttribute("width", "5%");
            checkBox.setAttribute("id", key + "_check");
            let func: string;
            if (isNaN(Number(key))) {
              func =
                'listMember("' +
                main.toString() +
                "." +
                key.toString() +
                '", "' +
                space +
                "&nbsp&nbsp&nbsp" +
                '", "' +
                key +
                '")';
            } else {
              func =
                'listMember("' +
                main.toString() +
                "[" +
                key.toString() +
                ']", "' +
                space +
                "&nbsp&nbsp&nbsp" +
                '", "' +
                key +
                '")';
            }
            checkBox.setAttribute("onclick", func);
            varDiv.innerHTML += space;
            varDiv.appendChild(checkBox);
            varDiv.innerHTML += key + "&nbsp&nbsp&nbsp";
            if (!isNaN(eval(main)[key])) {
              const btn = document.createElement("input");
              btn.setAttribute("type", "button");
              btn.value = "Assert";
              func =
                'addAssertion("' +
                main.toString() +
                "." +
                key.toString() +
                '","' +
                eval(main)[key] +
                '")';
              btn.setAttribute("onclick", func);
              varDiv.appendChild(btn);
            }
            varDiv.innerHTML += "<br>";
            div.appendChild(varDiv);
            // console.log(key + ": " + eval(main)[key] + "\n");
          }
        }
      } catch (e) {}
    }
    space += "&nbsp&nbsp&nbsp";
  }
}
