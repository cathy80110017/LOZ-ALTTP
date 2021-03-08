export interface xy {
  x: number;
  y: number;
}

export interface key {
  key: string;
}

export interface script {
  targetLevel: string;
  name: string;
  script: string;
}

export interface keydown {
  key: string;
  firstTimeStamp: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  lastTimeDiff: number;
}

export interface requestInfo {
  request: number;
  response: number;
  percent: number;
}
