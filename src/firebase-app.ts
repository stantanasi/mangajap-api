import * as admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, ref, uploadString } from "firebase/storage";

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

export const uploadFile = async (path: string, data: string | null): Promise<string | null> => {
  const storageRef = ref(storage, path);

  if (data === null) {
    return deleteFile(path)
      .then(() => null)
      .catch(() => null);
  } else {
    data = data.replace(/(\r\n|\n|\r)/gm, '');

    if (data.startsWith('data')) {
      return uploadString(
        storageRef,
        data,
        'data_url',
        { contentType: 'image/jpeg' },
      ).then((result) => getDownloadURL(result.ref));
    } else {
      return uploadString(
        storageRef,
        data,
        'base64',
        { contentType: 'image/jpeg' },
      ).then((result) => getDownloadURL(result.ref));
    }
  }
}

export const deleteFile = async (path: string) => {
  const storageRef = ref(storage, path);

  return deleteObject(storageRef)
    .catch(() => { });
}
