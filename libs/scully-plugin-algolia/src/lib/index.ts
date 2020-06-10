import { registerPlugin, getPluginConfig } from "@scullyio/scully"
import { log, logWarn, orange, green, red, logError } from "@scullyio/scully"
import { default as searchClient } from 'algoliasearch'

import { SearchClient, SearchIndex } from 'algoliasearch/dist/algoliasearch';

declare var process;
declare var require;

export interface IAlgoliaPluginSettings {
  indexName: string;
  extra?: {}
  appId: string;
  apiKey: string;
  dryRun: boolean;
}

const AlgoliaPlugin = 'updateAlgoliaIndex'

export const updateAlgoliaIndex = async (html: string, options: any): Promise<string> => {
  try {

  const {
    dryRun = false,
    indexName = options.route.split('/')[1],
    appId,
    apiKey,
    extra = {}
  } = getPluginConfig<IAlgoliaPluginSettings>(AlgoliaPlugin);

    if (!dryRun && process.env.NODE_ENV !== 'production') {
    logWarn(orange("Not performing index, set dryRun to false and NODE_ENV to production"))
      return html;
    }


    log(green(`Using index ${indexName} from route`))
    const client = initAlgoliaClient(appId, apiKey)
    const payload = buildPayload(options)

    const index = client.initIndex(indexName)

    log(`Using [${index.indexName}]`)

    const { taskID: savedObjectTask } = await index.saveObject(payload)
    await index.waitTask(savedObjectTask)

    if (extra) {
      const { taskID: settingsTask } = await index.setSettings(extra)
      await index.waitTask(settingsTask)
    }

    log(green(`Updated index for [${payload.title}]`))
  } catch (e) {
    logError(JSON.stringify(e))
  }

  return html
}

function initAlgoliaClient(appId: string, apiKey: string): SearchClient {
  let isError = false
  if (!appId) {
    logError(red(`appId configuration not set`))
    isError = true
  }
  if (!apiKey) {
    logError(red(`apiKey configuration not set`))
    isError = true
  }
  if (isError) {
    throw new Error("Make sure configuration variables are set")
  }

  return searchClient(appId, apiKey)
}

/***
 * Use the title as the object id for record.
 * @param options
 */
function buildPayload(options) {
  const crypto = require("crypto")
  const hash = crypto.createHash("sha256")
  const { data } = options
  hash.update(data.title, "utf8")
  return {
    ...data,
    objectID: parseInt(hash.digest("hex").slice(0, 15), 16),
    createIfNotExists: true,
  }
}


async function indexExists(index: SearchIndex) {
  try {
    const { nbHits } = await index.search('')
    return nbHits > 0
  } catch (e) {
    return false
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
      scope: ["settings", "synonyms", "rules"],
    },
  )
  return targetIndex.waitTask(taskID)
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
    targetIndex.indexName,
  )
  return targetIndex.waitTask(taskID)
}

const validator = (config: IAlgoliaPluginSettings) => {
  if (!config.appId || !config.apiKey) {
    return [
      `[scully-plugin-algolia] apiKey and appId cannot be null`,
    ];
  }
  return false;
};

registerPlugin("render", "updateAlgoliaIndex", updateAlgoliaIndex, validator)
