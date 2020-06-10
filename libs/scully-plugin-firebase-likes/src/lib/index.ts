import { getPluginConfig, green, log, logError, logWarn, orange, red, registerPlugin } from '@scullyio/scully';
import * as admin from 'firebase-admin';

export interface IFirebasePluginSettings {
  serviceAccount: any;
  databaseUrl: string
  dryRun?: boolean;
}

const firebasePlugin = 'addPostToFirebase';
const {
  serviceAccount,
  databaseUrl,
  dryRun = false
} = getPluginConfig<IFirebasePluginSettings>(firebasePlugin);

const db = admin.initializeApp({
  credential: serviceAccount,
  databaseURL: databaseUrl
})
  .firestore();

const addPostToFirebase = async (html: string, route: any) => {
  try {
    if (!dryRun && process.env.NODE_ENV !== 'production') {
      logWarn(orange('Not performing firestore update, set dryRun to false and NODE_ENV to production'));
      return html;
    }

    // TODO get rid of all null values
    route.data.name = route.data.title;

    await db.doc(`${route.route}`).set(route, { merge: true });

    log(green(`Added ${route.route} to Firestore`));

  } catch (e) {
    logError(red(`Issue adding ${route.route} to Firestore`));
    logError(red(e));
  }
  return html;
};

const validator = (config: IFirebasePluginSettings) => {
  if (!config.serviceAccount || !config.databaseUrl) {
    return [
      `[scully-plugin-algolia] apiKey and appId cannot be null`
    ];
  }
  return false;
};

registerPlugin('render', firebasePlugin, addPostToFirebase, validator);
