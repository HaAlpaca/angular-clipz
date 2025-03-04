import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit, OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;

  // alert
  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded.';
  alertColor = 'blue';
  isSubmission = false;

  percentage = 0;
  showPercentage = false;

  screenshots: string[] = [];
  selectedScreenshot = '';

  user: firebase.User | null = null;

  task?: AngularFireUploadTask;
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => {
      this.user = user;
    });
    this.ffmpegService.init();
  }
  ngOnDestroy(): void {
    this.task?.cancel();
  }
  ngOnInit(): void {}
  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }
    this.isDragover = false;
    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }
  async uploadFile() {
    this.uploadForm.disable();

    this.showAlert = true;
    this.isSubmission = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenshot
    );

    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = (total as number) / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        last(),
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenShotUrl] = urls;

          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            filename: `${clipFileName}.mp4`,
            url: clipURL,
            screenShotUrl,
            screenShotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipService.createClip(clip);
          this.alertColor = 'green';
          this.alertMsg = 'Your clip has been uploaded successfully!';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['/clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.alertColor = 'red';
          this.alertMsg = 'There was an error uploading your clip.';
          this.showPercentage = false;
          this.isSubmission = true;
          console.log(error);
        },
      });
  }
}
