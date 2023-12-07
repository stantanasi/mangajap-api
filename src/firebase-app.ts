import * as admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, StorageReference, uploadString } from "firebase/storage";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT!)),
});

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBERviz4ObXOcBPCHiY8weoU_zdA8UNcIk",
  authDomain: "mangajap.firebaseapp.com",
  projectId: "mangajap",
  storageBucket: "mangajap.appspot.com",
  messagingSenderId: "765459541968",
  appId: "1:765459541968:web:fd5acd1ab2ba4d4c1193d5",
  measurementId: "G-P784KGM19T",
});

export default firebaseApp

export const auth = admin.auth();

export const storage = getStorage(firebaseApp);

export const uploadFile = async (storageRef: StorageReference, file: string | null) => {
  if (file === null) {
    return deleteObject(storageRef)
      .then(() => null)
      .catch(() => null);
  } else {
    file = file.replace(/(\r\n|\n|\r)/gm, '');

    if (file.startsWith('data')) {
      return uploadString(
        storageRef,
        file,
        'data_url',
        { contentType: 'image/jpeg' },
      ).then((result) => getDownloadURL(result.ref));
    } else {
      return uploadString(
        storageRef,
        file,
        'base64',
        { contentType: 'image/jpeg' },
      ).then((result) => getDownloadURL(result.ref));
    }
  }
}
