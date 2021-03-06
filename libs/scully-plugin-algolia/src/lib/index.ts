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
import { default as searchClient } from 'algoliasearch';

import { SearchClient, SearchIndex } from 'algoliasearch/dist/algoliasearch';

declare var require;

export interface IAlgoliaPluginConfig {
  indexName: string;
  extra?: {}
  appId: string;
  apiKey: string;
  isDryRun: boolean;
}

export const UpdateAlgoliaIndex = 'updateAlgoliaIndex';

export const AlgoliaPluginDefaultConfig: IAlgoliaPluginConfig = {
  indexName: 'blog',
  appId: null,
  apiKey: null,
  isDryRun: false
};

export async function updateAlgoliaIndexPlugin(html: string, options: HandledRoute): Promise<string> {
  try {

    const {
      isDryRun = AlgoliaPluginDefaultConfig.isDryRun,
      indexName = AlgoliaPluginDefaultConfig.indexName,
      appId,
      apiKey,
      extra = {}
    } = getMyConfig<IAlgoliaPluginConfig>(updateAlgoliaIndexPlugin);

    if (isDryRun) {
      logWarn(orange('Not performing index, set dryRun to false'));
      return html;
    }


    log(green(`Using index ${indexName} from route`));
    const client = initAlgoliaClient(appId, apiKey);
    const payload = buildPayload(options);

    const index = client.initIndex(indexName);

    log(`Using [${index.indexName}]`);

    const { taskID: savedObjectTask } = await index.saveObject(payload);
    await index.waitTask(savedObjectTask);

    if (extra) {
      const { taskID: settingsTask } = await index.setSettings(extra);
      await index.waitTask(settingsTask);
    }

    log(green(`Updated index for [${payload.title}]`));
  } catch (e) {
    logError(JSON.stringify(e, null, 2));
  }

  return html;
};

function initAlgoliaClient(appId: string, apiKey: string): SearchClient {
  let isError = false;
  if (!appId) {
    logError(red(`appId configuration not set`));
    isError = true;
  }
  if (!apiKey) {
    logError(red(`apiKey configuration not set`));
    isError = true;
  }
  if (isError) {
    throw new Error('Make sure configuration variables are set');
  }

  return searchClient(appId, apiKey);
}

/***
 * Use the title as the object id for record.
 * @param options
 */
function buildPayload(options) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  const { data } = options;
  hash.update(data.title, 'utf8');
  return {
    ...data,
    objectID: parseInt(hash.digest('hex').slice(0, 15), 16),
    createIfNotExists: true
  };
}


async function indexExists(index: SearchIndex) {
  try {
    const { nbHits } = await index.search('');
    return nbHits > 0;
  } catch (e) {
    return false;
  }
}


/**
 * Copy the settings, synonyms, and rules of the source index to the target index
 * @param client
 * @param sourceIndex
 * @param targetIndex
 * @return {Promise}
 */
async function scopedCopyIndex(client: SearchClient, sourceIndex: SearchIndex, targetIndex: SearchIndex): Promise<void> {
  const { taskID } = await client.copyIndex(
    sourceIndex.indexName,
    targetIndex.indexName,
    {
      scope: ['settings', 'synonyms', 'rules']
    }
  );
  return targetIndex.waitTask(taskID);
}


/**
 * moves the source index to the target index
 * @param client
 * @param sourceIndex
 * @param targetIndex
 * @return {Promise}
 */
async function moveIndex(client: SearchClient, sourceIndex: SearchIndex, targetIndex: SearchIndex): Promise<void> {
  const { taskID } = await client.moveIndex(
    sourceIndex.indexName,
    targetIndex.indexName
  );
  return targetIndex.waitTask(taskID);
}

const validator = (config: IAlgoliaPluginConfig) => {
  if (!config.appId || !config.apiKey) {
    return [
      `[scully-plugin-algolia] apiKey and appId cannot be null`
    ];
  }
  return false;
};


registerPlugin('render', UpdateAlgoliaIndex, updateAlgoliaIndexPlugin, validator);
