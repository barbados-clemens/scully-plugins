import {
  getMyConfig,
  green,
  HandledRoute,
  log,
  logError,
  logWarn,
  orange,
  red,
  registerPlugin
} from '@scullyio/scully';
import { getDb } from './db';

export const AddPostToFirebase = 'addPostToFirebase';

export async function addPostToFirebasePlugin(html: string, route: HandledRoute): Promise<string> {
  try {
    const config = getMyConfig<IFirebasePluginSettings>(addPostToFirebasePlugin);

    const {
      serviceAccount,
      databaseUrl,
      isDryRun = false,
      isDebug = false
    } = config;

    const db = getDb(config);

    if (isDebug) {
      console.log(JSON.stringify(config, null, 2));
    }

    if (!serviceAccount || !databaseUrl) {
      logError(red('service account and/or databaseUrl configurations are not set for the firebase plugin'));
      return;
    }


    if (isDryRun) {
      logWarn(orange('Not performing firestore update, set isDryRun to false'));
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
  isDryRun?: boolean;
  isDebug?: boolean;
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
