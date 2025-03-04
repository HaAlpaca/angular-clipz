import firebase from 'firebase/compat/app';
export interface IClip {
  docID?: string;
  uid: string;
  displayName: string;
  title: string;
  filename: string;
  url: string;
  timestamp: firebase.firestore.FieldValue;
  screenShotUrl: string;
  screenShotFileName: string;
}
