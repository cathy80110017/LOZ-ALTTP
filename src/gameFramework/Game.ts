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
    this.Framework = Framework;
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
    this.ideaWidth = this.config.canvasWidthRatio || 16;
    this.ideaHeight = this.config.canvasHeightRatio || 9;
    this.timelist = [];
    this.record = new Recorder();
    this.tempUpdate = () => {
      return;
    };
    this.tempDraw = () => {
      return;
    };
    //this.stopLoop = this.stopInterval

    this.mainContainer = document.createElement("div");
    if (this.isRecordMode) {
      this.mainContainer.style.position = "relative";
      this.mainContainer.style.float = "left";
      this.mainContainer.style.width = "70%";
      this.mainContainer.style.height = "100%";
      this.mainContainer.style.display = "table";
    } else if (this.isTestMode) {
      this.mainContainer.style.position = "relative";
      this.mainContainer.style.float = "left";
      this.mainContainer.style.width = "70%";
      this.mainContainer.style.height = "100%";
    } else {
      this.mainContainer.style.width = "100%";
      this.mainContainer.style.height = "100%";
      this.mainContainer.style.display = "table";
    }

    this.mainContainer.style.backgroundColor = "#000";
    this.canvasContainer = document.createElement("div");
    this.canvasContainer.style.display = "table-cell";
    this.canvasContainer.style.textAlign = "center";
    this.canvasContainer.style.verticalAlign = "middle";
    this.canvas = document.createElement("canvas");
    this.canvas.style.backgroundColor = "#fff";
    this.canvas.setAttribute("id", "__game_canvas__");
    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;
    this.canvasContainer.appendChild(this.canvas);
    this.mainContainer.appendChild(this.canvasContainer);
    this.context = this.canvas.getContext("2d");

    this.stopLoop = this.stopAnimationFrame;
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
  public canvasContainer: HTMLDivElement;
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
      // ????????????replay mode????????? Record btn, ????????????????????????replay??????, ???????????????????????????, ?????????????????????????????????!
      // ??????????????????isReplay??????false, ?????? updateFunc() ????????????.
      // 2017.12.13 : ???Recording mode???replay, Record.waitCounter ??? Replay._waitingCounter ?????????????????????,
      // ?????? _isTestMode = true ???Replay, ???????????????cycle,
      // to do  : 1. ?????????, assertion game.cycleCount, 2. dump cyclecount ?????????
      if (this.isReplay) {
        this.isReplay = false; // 2017.12.13 ??????
        this.isContinue = true; // <-- ????????? Replay.executeCommend()??????????????????
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
      this.record.isRecording = false; // ????????? Record.start() ???????????? recordString ?????????
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
      // comment ??????????????????pass???, ????????????????????????cycle, asserting ????????????, ???????????????????
      if (mainScript[i].indexOf("replay.assertEqual") != 0) {
        eval(mainScript[i]); // <- ??????????????? Replay.waitFor() why?
      }
      // }
    }
  }

  public showVariable(): void {
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
        button.src = "/assets/demo/image/play_over.png";
      if (button.id == "pause_btn")
        button.src = "/assets/demo/image/pause_over.png";
      if (button.id == "stop_btn")
        button.src = "/assets/demo/image/stop_over.png";
      if (button.id == "type_btn")
        button.src = "/assets/demo/image/addComment_over.png";
      if (button.id == "replay_btn")
        button.src = "/assets/demo/image/replay_over.png";
      if (button.id == "letiable_btn")
        button.src = "/assets/demo/image/letiable_over.png";
    }
  }

  public btnMouseOut(button: HTMLImageElement): void {
    if (button.getAttribute("enable") === "true") {
      if (button.id == "start_btn") button.src = "/assets/demo/image/play.png";
      if (button.id == "pause_btn") button.src = "/assets/demo/image/pause.png";
      if (button.id == "stop_btn") button.src = "/assets/demo/image/stop.png";
      if (button.id == "type_btn")
        button.src = "/assets/demo/image/addComment.png";
      if (button.id == "replay_btn")
        button.src = "/assets/demo/image/replay.png";
      if (button.id == "letiable_btn")
        button.src = "/assets/demo/image/letiable.png";
    }
  }

  public btnEnable(): void {
    if (document.getElementById("start_btn").getAttribute("enable") === "true")
      (document.getElementById("start_btn") as HTMLImageElement).src =
        "/assets/demo/image/play.png";
    else
      (document.getElementById("start_btn") as HTMLImageElement).src =
        "/assets/demo/image/play_disable.png";

    if (document.getElementById("pause_btn").getAttribute("enable") === "true")
      (document.getElementById("pause_btn") as HTMLImageElement).src =
        "/assets/demo/image/pause.png";
    else
      (document.getElementById("pause_btn") as HTMLImageElement).src =
        "/assets/demo/image/pause_disable.png";

    if (document.getElementById("stop_btn").getAttribute("enable") === "true")
      (document.getElementById("stop_btn") as HTMLImageElement).src =
        "/assets/demo/image/stop.png";
    else
      (document.getElementById("stop_btn") as HTMLImageElement).src =
        "/assets/demo/image/stop_disable.png";

    if (document.getElementById("type_btn").getAttribute("enable") === "true")
      (document.getElementById("type_btn") as HTMLImageElement).src =
        "/assets/demo/image/addComment.png";
    else
      (document.getElementById("type_btn") as HTMLImageElement).src =
        "/assets/demo/image/addComment_disable.png";

    if (document.getElementById("replay_btn").getAttribute("enable") === "true")
      (document.getElementById("replay_btn") as HTMLImageElement).src =
        "/assets/demo/image/replay.png";
    else
      (document.getElementById("replay_btn") as HTMLImageElement).src =
        "/assets/demo/image/replay_disable.png";

    if (
      document.getElementById("letiable_btn").getAttribute("enable") === "true"
    )
      (document.getElementById("letiable_btn") as HTMLImageElement).src =
        "/assets/demo/image/letiable.png";
    else
      (document.getElementById("letiable_btn") as HTMLImageElement).src =
        "/assets/demo/image/letiable_disable.png";
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

  public draw(ctx?: CanvasRenderingContext2D): void {
    this.currentLevel.draw(); //?
  }

  public teardown(): void {
    this.currentLevel.autodelete();
    this.isInit = false;
  }

  public stop(): void {
    this.pause();
    this.teardown();
  }

  // public getCanvasTopLeft(): Point {
  //   return new Point(this.canvas.offsetLeft, this.canvas.offsetTop);
  // }

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

  public addNewLevel(leveldata: { [key: string]: Level }): void {
    for (const i in leveldata) {
      if (leveldata.hasOwnProperty(i)) {
        if (!this.findLevel(i)) {
          this.levels.push({ name: i, level: leveldata[i] });
          leveldata[i].afterLevelLoad();
        } else {
          this.Framework.debugInfo.Log.error("Game : ????????????????????????");
          throw new Error("Game: already has same level name");
        }
      }
    }
  }

  // public changeLevelData(levelName: string, levelObj: Level): void {
  //   let toChange: number;
  //   this.levels.forEach((level, index) => {
  //     if (level.name === levelName) {
  //       toChange = index;
  //     }
  //   });
  //   delete this.levels[toChange];
  //   this.levels[toChange] = { name: levelName, level: levelObj };
  // }

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
      this.Framework.debugInfo.Log.error("Game : Script??????????????????");
      throw new Error("Game: already has same script name");
    }
  }

  public goToLevel(levelName: string): void {
    this.pause();
    this.teardown();
    this.currentLevel = this.findLevel(levelName);
    this.Framework.replayer.resetCycleCount();
    if (!this.currentLevel) {
      this.Framework.debugInfo.Log.error("Game : ???????????????");
      throw new Error("Game : levelName not found.");
    }
    if (this.isRecordMode) {
      this.record.inputCommand("// Change Level :" + levelName + ";");
    }
    this.start();
  }

  // public reLoadLevel(): void {
  //   this.pause();
  //   this.teardown();
  //   this.Framework.replayer.resetCycleCount();
  //   this.start();
  // }

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
    this.Framework.debugInfo.Log.error("Game : ????????????");
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
    this.Framework.debugInfo.Log.error("Game : ????????????");
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
      window.addEventListener("resize", () => this.resizeEvent(), false);
    }
    this.initializeProgressResource();

    const runFunction = () => {
      this.isRunning = true;
      this.pause();
      this.initialize();
      this.draw = this.currentLevel.draw.bind(this.currentLevel);
      this.update = this.currentLevel.update.bind(this.currentLevel);
      this.Framework.replayer.setGameReady();
      this.run();
    };
    const initFunction = () => {
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
    };

    this.Framework.resourceManager.setSubjectFunction(() => {
      if (!this.isInit) {
        initFunction();
        return;
      }
      if (!this.isRunning) {
        runFunction();
      }
    });

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

    const updateFunc = () => {
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
            // ok, ???game???cycleCount???????????????
            this.record.update(); // ????????????????????????? ??????????????? game ?????????????????????update???? ?????????????
            // ??????????????????????????? this.isReplay = true ??????, ???Replay.cycleCount???>0?????????record.update()?
          }
          //console.log("record update")  ???????????? Record???cycleCount?
        }
        if (this.isReplay) {
          this.Framework.replayer.update();
        }
        nextGameTick += this.skipTicks;
      }
    };

    const drawFunc = () => {
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
    };
    const gameLoopFunc = () => {
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
    };

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
    const _run = () => {
      gameLoopFunc();
      if (this.isRunning) {
        this.runInstance = requestAnimationFrame(_run);
      }
    };
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
      this.canvasContainer.innerHTML = "";
      this.canvasContainer.appendChild(this.canvas);
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

  public fullScreen(ele?: HTMLElement): void {
    ele = ele ?? this.canvas;

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

    scaledWidth = Math.round(base * this.ideaWidth);
    scaledHeight = Math.round(base * this.ideaHeight);
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
    if (!this.currentLevel) {
      this.currentLevel = this.levels[0].level;
    }
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
        "/assets/demo/image/arrow_over.png"
      )
    ) {
      (document.getElementById(divId + "_check") as HTMLImageElement).src =
        "/assets/demo/image/arrow.png";
    } else {
      (document.getElementById(divId + "_check") as HTMLImageElement).src =
        "/assets/demo/image/arrow_over.png";
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
            checkBox.setAttribute("src", "/assets/demo/image/arrow.png");
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
