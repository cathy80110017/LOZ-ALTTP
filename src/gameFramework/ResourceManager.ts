import { overrideProperty } from "./Utils";

export default class ResourceManager {
  constructor(subjectFunction?: () => void) {
    this._requestCount = 0;
    this._responseCount = 0;
    this._timeountIDPrevious = 0;
    this._timeountID = 0;
    this._intervalID = 0;
    this.ajaxProcessing = false;
    this._responsedResource = new Map<string, resource>();

    if (subjectFunction) {
      this._subjectFunction = subjectFunction;
    }

    //_intervalID = setInterval(detectAjax, 50);
    this.finishLoading();
  }
  private _subjectFunction: () => void;
  private _requestCount: number;
  private _responseCount: number;
  private _timeountIDPrevious: number;
  private _timeountID: number;
  private ajaxProcessing: boolean;
  private _responsedResource: Map<string, resource>;
  private _intervalID: null | number;
  private static instance: ResourceManager;

  public static getInstance(): ResourceManager {
    if (!this.instance) {
      this.instance = new ResourceManager();
    }
    return this.instance;
  }

  public loadImage(requestOption: requestOption): resource {
    if (this._responsedResource.has(requestOption.id)) {
      return this._responsedResource.get(requestOption.id);
    }

    const imageObj = new Image();
    imageObj.src = requestOption["url"];
    this._requestCount++;
    if (this._intervalID === null) {
      this._intervalID = window.setInterval(this.detectAjax, 50);
      this.finishLoading();
    }
    imageObj.onload = () => {
      this._responseCount++;
      this._responsedResource.set(requestOption.id, {
        url: requestOption.url,
        response: imageObj,
      });
    };
  }

  public loadJSON(requestOption: requestOption): void {
    requestOption.systemSuccess = (responseText: string) => {
      const responseJSON = eval("(" + responseText.trim() + ")"); //因有可能是不合法的JSON, 故只能用eval了
      this._responsedResource.set(requestOption.id, {
        url: requestOption.url,
        response: responseJSON,
      });
      this._responseCount++;
    };

    this.minAjax(requestOption?.type, requestOption);
  }

  private minAjax(type: httpMethod, requestOption: requestOption) {
    const userSettings: xhrSetting = {};
    userSettings.type = type || "POST";

    if (requestOption.data) {
      userSettings["data"] = requestOption.data;
    }

    if (requestOption.systemSuccess) {
      userSettings["success"] = requestOption.systemSuccess;
    }

    this.ajax(requestOption, userSettings);
  }

  private ajax(requestOption: requestOption, userSettings: xhrSetting) {
    this._requestCount++;
    const defaultSettings: xhrSetting = {
      type: "POST",
      cache: false,
      async: true,
      contentType: "application/x-www-form-urlencoded; charset=UTF-8",
      error: () => {
        return;
      },
      //data: 'user=admin%20admin&password=12345' //需要自行encode, 且只接受string格式
      statusCode: {
        /*404: function() {},
            500: function() {},*/
        //這部分USER可以自行設定
      },
      success: () => {
        return;
      },
    };

    userSettings = userSettings ?? defaultSettings;
    userSettings = overrideProperty(
      defaultSettings,
      userSettings
    ) as xhrSetting;

    let xhr: XMLHttpRequest;

    //因IE9後才支援HTML5, 故不再做其他判斷
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            this._responsedResource.set(requestOption.id, {
              url: requestOption.url,
              response: xhr.responseText,
            });
            userSettings.success(xhr.responseText, xhr.statusText, xhr);
          } else {
            userSettings.error(xhr, xhr.statusText);
          }
        }
      };
    }

    if (
      !userSettings.cache &&
      !userSettings.data &&
      userSettings.type === "GET"
    ) {
      requestOption.url = requestOption.url + "?" + Math.random();
    } else if (userSettings.data && userSettings.data.trim() !== "") {
      requestOption.url = requestOption.url + "?" + userSettings.data.trim();
    }

    xhr.open(userSettings.type, requestOption.url, userSettings.async);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");

    if (userSettings.type === "GET") {
      xhr.send();
    } else {
      xhr.setRequestHeader("Content-Type", userSettings.contentType);
      xhr.send(userSettings.data);
    }
  }

  public destroyResource(id: string): void {
    if (!this._responsedResource.has(id)) {
      return;
    }
    this._responsedResource.delete(id);
  }

  public getResource(id: string): unknown {
    if (!this._responsedResource.has(id)) {
      throw "'" + id + "' is undefined Resource.";
    }
    return this._responsedResource.get(id).response;
  }

  public setSubjectFunction(v: () => void): void {
    this._subjectFunction = v;
  }

  public getFinishedRequestPercent(): number {
    return (this._responseCount / this._requestCount) * 100;
  }

  public getRequestCount(): number {
    return this._requestCount;
  }
  public getResponseCount(): number {
    return this._responseCount;
  }

  private finishLoading() {
    //由game來控制遊戲開始的時機, 需要是在發出所有request後, 再call這個funciton
    this.detectAjax();
    if (!this.ajaxProcessing) {
      this.stopDetectingAjax();
      this._subjectFunction();
      this.ajaxProcessing = false;
    } else {
      this._timeountIDPrevious = this._timeountID;
      this._timeountID = window.setTimeout(() => {
        this.finishLoading();
        window.clearTimeout(this._timeountIDPrevious);
      }, 500);
    }
  }

  private detectAjax() {
    //Constuctor即開始偵測
    //要有(_requestCount == 0)是為了避免一開始就去執行gameController.start
    this.ajaxProcessing =
      this._requestCount !== this._responseCount || this._requestCount === 0;
  }

  private stopDetectingAjax() {
    window.clearInterval(this._intervalID);
    this._intervalID = null;
  }
}

interface xhrSetting {
  type?: string;
  cache?: boolean;
  async?: boolean;
  contentType?: string;
  error?: (xmlHttpRequest: XMLHttpRequest, textStatus: string) => void;
  statusCode?: { [key: string]: () => void };
  success?: (
    data: string,
    textStatus: string,
    xmlHttpRequest: XMLHttpRequest
  ) => void;
  data?: string;
}

interface requestOption {
  id: string;
  url: string;
  type?: httpMethod;
  data?: string;
  systemSuccess?: (
    data: string,
    textStatus: string,
    xmlHttpRequest: XMLHttpRequest
  ) => void;
}

type httpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCh";

interface resource {
  url: string;
  response: unknown;
}
