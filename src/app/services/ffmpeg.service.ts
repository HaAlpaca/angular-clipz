import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg;
  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }
  async init() {
    if (this.isReady) {
      return;
    }
    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true;
    const data = await fetchFile(file);
    this.ffmpeg.FS('writeFile', file.name, data);
    const seconds = [1, 2, 3];
    const commands: string[] = [];
    seconds.forEach((second) => {
      commands.push(
        // input
        '-i',
        file.name,
        // output option
        '-ss',
        `00:00:0${second}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=501:-1',

        //output
        `output_0${second}.png`
      );
    });
    await this.ffmpeg.run(...commands);
    const screenShots: string[] = [];
    seconds.forEach((second) => {
      const screenShotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );
      const screenShotBlob = new Blob([screenShotFile.buffer], {
        type: 'image/png',
      });
      const screenShotUrl = URL.createObjectURL(screenShotBlob);
      screenShots.push(screenShotUrl);
    });
    this.isRunning = false;
    return screenShots;
  }
  async blobFromUrl(url: string) {
    const respone = await fetch(url);
    const blob = await respone.blob();
    return blob;
  }
}
