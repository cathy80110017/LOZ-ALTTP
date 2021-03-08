export default class AudioManager {
  constructor(mainPlaylist: Map<string, string>) {
    this.audioInstanceObj = new Map<string, HTMLAudioElement>();
    this.mainPlaylist = mainPlaylist ?? new Map<string, string>();
  }

  public audioInstanceObj: Map<string, HTMLAudioElement>;
  public errorEvent = (): void => {
    return;
  };
  // key: music name, value: music path
  public mainPlaylist: Map<string, string>;

  public addSongs(playlist: Map<string, string>): void {
    playlist.forEach((v, k) => {
      this.mainPlaylist.set(k, v);
    });
  }

  public removeSong(songName: string): void {
    this.mainPlaylist.delete(songName);
  }

  public removeSongs(songsName: string[]): void {
    for (let i = 0; i < songsName.length; i++) {
      this.removeSong(songsName[i]);
    }
  }

  public getAudioInstance(songName: string): HTMLAudioElement {
    if (this.audioInstanceObj.has(songName)) {
      const audioInstance = this.audioInstanceObj.get(songName);
      audioInstance.currentTime = 0;
      return audioInstance;
    }

    const audioInstance = new Audio();
    audioInstance.preload = "auto";
    this.audioInstanceObj.set(songName, audioInstance);
    return audioInstance;
  }

  public play(audioArgs: { name: string; loop?: boolean }): void {
    const sourceTagStr = "source";
    const songName = audioArgs.name;
    const song = this.mainPlaylist.get(songName);
    if (!song) {
      throw "the playlist is not set or do not contain the song: " + songName;
    }
    const audio = this.getAudioInstance(songName);
    audio.addEventListener("error", this.errorEvent, false);
    audio.loop = audioArgs.loop;

    const tempSource = document.createElement(sourceTagStr);

    switch (song.split(".").pop()) {
      case "mp3":
        tempSource.type = "audio/mpeg";
        break;
      case "ogg":
        tempSource.type = "audio/ogg";
        break;
      case "wav":
        tempSource.type = "audio/wav";
        break;
    }
    tempSource.src = song;
    audio.appendChild(tempSource);

    const promise = audio.play();
    if (promise !== undefined) {
      promise.then(
        () => {
          return;
        },
        () => {
          console.log(
            "Autoplay Policy Changes!! User must have interacted with the domain (click, tap, etc.)."
          );
        }
      );
    }
  }

  public pause(audioName: string): void {
    const audio = this.audioInstanceObj.get(audioName);
    if (audio !== undefined && !audio.paused) {
      audio.pause();
    }
  }

  public pauseAll(): void {
    for (const k in this.audioInstanceObj.keys) {
      this.pause(k);
    }
  }

  public resume(audioName: string): void {
    const audio = this.audioInstanceObj.get(audioName);
    if (audio.paused) {
      audio.play();
    }
  }

  public resumeAll(): void {
    for (const k in this.audioInstanceObj.keys) {
      this.resume(k);
    }
  }

  public stop(audioName: string): void {
    const audio = this.audioInstanceObj.get(audioName);
    if (audio !== undefined && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  public stopAll(): void {
    for (const k in this.audioInstanceObj.keys) {
      this.stop(k);
    }
  }

  public setVolume(name: string, volumeValue: number): void {
    const audio = this.audioInstanceObj.get(name);
    audio.volume = volumeValue;
  }

  public manageMute(name: string, muted: boolean): void {
    const audio = this.audioInstanceObj.get(name);
    audio.muted = muted;
  }

  public openVolume(name: string): void {
    this.manageMute(name, false);
  }

  public openVolumeAll(): void {
    for (const k in this.audioInstanceObj.keys) {
      this.openVolume(k);
    }
  }

  public mute(name: string): void {
    this.manageMute(name, true);
  }

  public muteAll(): void {
    for (const k in this.audioInstanceObj.keys) {
      this.mute(k);
    }
  }
}
