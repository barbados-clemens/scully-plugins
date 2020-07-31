import { IFirebasePluginSettings } from './index';
import * as admin from 'firebase-admin';

let db: FirebaseFirestore.Firestore;

export function getDb({ serviceAccount, databaseUrl }: IFirebasePluginSettings): FirebaseFirestore.Firestore {
  if (db) {
    return db;
  }
  db = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseUrl
  })
    .firestore();
  return db;
}
