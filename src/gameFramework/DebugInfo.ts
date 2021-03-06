export default class DebugInfo {
  constructor() {
    this.showDebugInfo = true;
    this.containerAppended = false;
    this.debugInfo = document.createElement("div");
    this.debugInfo.style.width = "500px";
    this.debugInfo.style.height = "200px";
    this.debugInfo.style.backgroundColor = "#f0f0f0";
    this.debugInfo.style.position = "absolute";
    this.debugInfo.style.top = "10px";
    this.debugInfo.style.border = "1px solid #000";
    this.debugInfo.style.right = "10px";
    this.debugInfo.style.zIndex = "99999";
    this.debugInfo.style.overflowY = "scroll";
    this.Log = new Log(this.debugInfo, this.showDebugInfo);
  }

  private showDebugInfo: boolean;
  private containerAppended: boolean;
  private debugInfo: HTMLDivElement;
  private static instance: DebugInfo;
  public Log: Log;

  public static getInstance(): DebugInfo {
    if (!this.instance) {
      this.instance = new DebugInfo();
    }
    return this.instance;
  }

  public show(dom: HTMLElement): void {
    this.debugInfo.style.visibility = "visible";
    this.debugInfo.style.width = "500px";
    this.debugInfo.style.height = "200px";
    this.debugInfo.style.border = "1px solid #000";

    if (!this.containerAppended) {
      const container = dom || document.body;
      container.appendChild(this.debugInfo);
    }
  }

  public hide(): void {
    const zeroPxStr = "0px";
    this.debugInfo.style.visibility = "hidden";
    this.debugInfo.style.border = zeroPxStr;
    this.debugInfo.style.width = zeroPxStr;
    this.debugInfo.style.height = zeroPxStr;
  }
}

class Log {
  constructor(debugInfo: HTMLDivElement, showDebugInfo: boolean) {
    this.debugInfo = debugInfo;
    this.showDebugInfo = showDebugInfo;
  }

  private debugInfo: HTMLDivElement;
  private showDebugInfo: boolean;

  public prepareLog(state: number | string, str: string) {
    const newLog = document.createElement("p");
    newLog.style.margin = "0";
    newLog.style.minWidth = "600px"; //In order to fill the background color
    newLog.style.padding = "2px 0 2px 5px";
    const logTxt = document.createTextNode(
      "[" +
        dateFormate(new Date(), "hh:mm:ss") +
        "] " +
        "[" +
        state +
        "] " +
        str
    );
    newLog.appendChild(logTxt);
    this.debugInfo.appendChild(newLog);
    this.debugInfo.scrollTop = this.debugInfo.scrollHeight;
    return newLog;
  }

  public info(str: string) {
    this.prepareLog("Info", str).style.backgroundColor = "#80ffff";
  }

  public error(str: string) {
    this.prepareLog("Error", str).style.backgroundColor = "#ff8080";
  }

  public warning(str: string) {
    this.prepareLog("Warning", str).style.backgroundColor = "#ffff80";
  }

  public console(str: string) {
    if (this.showDebugInfo) {
      console.log(str);
    }
  }
}

function dateFormate(date: Date, format: string) {
  const o: { [key: string]: number } = {
    "M+": date.getMonth() + 1, //month
    "d+": date.getDate(), //day
    "h+": date.getHours(), //hour
    "m+": date.getMinutes(), //minute
    "s+": date.getSeconds(), //second
    "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
    S: date.getMilliseconds(), //millisecond
  };

  if (/(y+)/.test(format))
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (const k in o)
    if (new RegExp("(" + k + ")").test(format))
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? String(o[k])
          : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return format;
}
