import { key, keydown } from "./interface";
import Level from "./Level";
export default class KeyBoardManager {
  constructor() {
    this.timeoutID = 0;
    this.clearHistoryTime = 1000;
    this.keydownList = new Map<string, keydown>();
    this.keypressHistory = [];
    this.userKeydownEvent = () => {
      return;
    };
    this.userKeyupEvent = () => {
      return;
    };
    window.addEventListener("keydown", (e) => this.keydownEvent(e), false);
    window.addEventListener("keyup", (e) => this.keyupEvent(e), false);
    this.clearHistory();
  }

  private timeoutID: number;
  private clearHistoryTime: number;
  private keydownList: Map<string, keydown>;
  private keypressHistory: unknown[];
  public userKeydownEvent: (e?: key) => void;
  public userKeyupEvent: (e?: key) => void;
  public subject: Level;

  public keydownEvent(e: KeyboardEvent): void {
    if (e.key === "F11" || e.key === "F5" || e.key === "F12") {
      return;
    }
    e.preventDefault();
    const keyCode = e.key;
    if (this.keydownList.has(keyCode)) {
      const ele = this.keydownList.get(keyCode);
      ele.lastTimeDiff = e.timeStamp - ele.firstTimeStamp;
    } else {
      this.keydownList.set(keyCode, {
        key: keyCode,
        firstTimeStamp: e.timeStamp,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        lastTimeDiff: 0,
      });
      this.userKeydownEvent.call(
        this.subject,
        this.keydownList.get(keyCode),
        this.keydownList,
        e
      );
    }
  }

  public keyupEvent(e: KeyboardEvent): void {
    e.preventDefault();
    const keyCode = e.key;
    const ele = this.keydownList.get(keyCode);
    this.keypressHistory.push(ele);
    this.keydownList.delete(keyCode);
    for (const tempKeydown in this.keydownList) {
      if ((this.keydownList.get(tempKeydown) as any)[keyCode]) {
        (this.keydownList.get(tempKeydown) as any)[keyCode] = false;
      }
    }
    this.userKeyupEvent.call(
      this.subject,
      this.keypressHistory[this.keypressHistory.length - 1],
      this.keypressHistory
    );
  }

  public asciiToChar(ascii: number, str: string): boolean {
    return String.fromCharCode(ascii) === str.toUpperCase();
  }

  public clearHistory(): void {
    this.keypressHistory.length = 0; //empty array
    clearTimeout(this.timeoutID);
    this.timeoutID = window.setTimeout(
      () => this.clearHistory(),
      this.clearHistoryTime
    );
  }
}
