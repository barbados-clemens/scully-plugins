import {
  getMyConfig,
  green, HandledRoute,
  log,
  logError,
  logWarn,
  orange,
  red,
  registerPlugin
} from '@scullyio/scully';
import * as admin from 'firebase-admin';

export const AddPostToFirebase = 'addPostToFirebase';

export async function addPostToFirebasePlugin(html: string, route: HandledRoute): Promise<string> {
  try {
    const {
      serviceAccount,
      databaseUrl,
      dryRun = false,
      debug,
    } = getMyConfig<IFirebasePluginSettings>(AddPostToFirebase);

    console.log(`Service Account => ${serviceAccount}`)
    console.log(`DatabaseUrl => ${databaseUrl}`)

    if (!serviceAccount || !databaseUrl) {
      logError(red('service account and/or databaseUrl configurations are not set for the firebase plugin'));
      return;
    }


    const db = admin.initializeApp({
      credential: serviceAccount,
      databaseURL: databaseUrl
    })
      .firestore();

    if (!dryRun) {
      logWarn(orange('Not performing firestore update, set dryRun to false and NODE_ENV to production'));
      return html;
    }

    const cleanedObj = removeEmpty(route);

    await db.doc(`${route.route}`).set(cleanedObj, { merge: true });

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
      `[scully-plugin-firebase-likes] serviceAccount and databaseUrl cannot be null`
    ];
  }
  return false;
};

registerPlugin('render', AddPostToFirebase, addPostToFirebasePlugin, validator);

export interface IFirebasePluginSettings {
  serviceAccount: any;
  databaseUrl: string
  dryRun?: boolean;
  debug?: boolean;
}


function removeEmpty(obj: object): object {
  const newObj = {};

  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      newObj[key] = removeEmpty(obj[key]); // recurse
    } else if (obj[key] != null) {
      newObj[key] = obj[key]; // copy value
    }
  });

  return newObj;
}
