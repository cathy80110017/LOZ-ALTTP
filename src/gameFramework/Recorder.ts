import { key, xy } from "./interface";

export default class Recorder {
  constructor() {
    this.record = [];
    this.waitCounter = 0;
    this.recordDiv;
    this.isRecording = false;
    this.isPause = false;
  }

  private record: any[];
  private waitCounter: number;
  private recordDiv: any;
  public isRecording: boolean;
  private isPause: boolean;

  public resetWaitCounter(): void {
    // 2017.11, ����work
    this.waitCounter = 0;
  }

  public getWaitCounter(): number {
    // 2017.12
    return this.waitCounter;
  }

  public inputCommand(command: any): void {
    this.recordWait();
    this.record.push(command);
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
  }

  public start(): void {
    this.waitCounter = 0;
    if (this.isRecording === false) {
      this.isRecording = true;
      this.isPause = false;
      const recordString =
        'QUnit.asyncTest( "Test Script", function( assert ) {<br>';
      this.addDivString(recordString);
    } else {
      if (this.isPause) {
        this.isPause = false;
      }
    }
  }

  public pause(): void {
    if (this.isRecording) {
      this.recordWait(); // 2016.10.27 added by cbh
      this.isPause = true;
    }
  }

  public stop(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.isPause = false;
      this.addDivString("});<br>");
    }
  }

  public addDivString(addString: string): void {
    document.getElementById("record_div").innerHTML += addString;
  }

  public update(): void {
    this.waitCounter++;
  }

  public click(e: xy): void {
    this.recordWait();
    this.record.push("Framework.replayer.mouseClick(" + e.x + "," + e.y + ");"); // 2017.04.18 marked
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  public mousedown(e: xy): void {
    this.recordWait();
    this.record.push("Framework.replayer.mouseDown(" + e.x + "," + e.y + ");"); // 2017.02.21 added
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  public mouseup(e: xy): void {
    this.recordWait();
    this.record.push("Framework.replayer.mouseUp(" + e.x + "," + e.y + ");"); // 2017.02.21 added
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  public mousemove(e: xy): void {
    this.recordWait();
    this.record.push("Framework.replayer.mouseMove(" + e.x + "," + e.y + ");");
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  //keyboard Event
  public keydown(e: key): void {
    this.recordWait();
    this.record.push("Framework.replayer.keyDown('" + e.key + "');");
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  public keyup(e: key): void {
    this.recordWait();
    this.record.push("Framework.replayer.keyUp('" + e.key + "');");
    this.addDivString(
      "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[this.record.length - 1] + "<br>"
    );
    this.scrollToBottom();
  }

  public keypress(e: key): void {
    this.recordWait();
  }

  public recordWait(): void {
    if (this.waitCounter > 0) {
      this.waitCounter++;
      this.record.push("Framework.replayer.waitFor(" + this.waitCounter + ");");
      this.addDivString(
        "&nbsp;&nbsp;&nbsp;&nbsp;" +
          this.record[this.record.length - 1] +
          "<br>"
      );
      this.waitCounter = 0;
    }
  }

  public callFunction(inForm: any, agrs: any): void {
    // TestCount++;
    // if (IsFunction(inForm.SetRecordData)) {
    // } else {
    //     if (TestCount <= 10) {
    //         setTimeout(function() { CallFunction(inForm, agrs); }, 1000);
    //     } else {
    //         alert("���");
    //     }
    // }
    inForm.SetRecordData(agrs);
  }

  public save(): void {
    let recordString =
      'QUnit.asyncTest( "Test Script", function( assert ) {<br>';
    for (let i = 0; i < this.record.length; i++) {
      recordString += "&nbsp;&nbsp;&nbsp;&nbsp;" + this.record[i] + "<br>";
    }
    recordString += "});<br>";
    const form = window.open("record.html", "form2", "_blank", false);
    setTimeout(function () {
      this.callFunction(form, recordString);
    }, 1000);

    //document.getElementById('recordscript').innerHTML = recordString
  }

  public insertCommand(command: any): void {
    this.recordWait();
    this.record.push(command);
  }

  public scrollToBottom(): void {
    document.getElementById("record_div").scrollTop = document.getElementById(
      "record_div"
    ).scrollHeight;
  }
}
