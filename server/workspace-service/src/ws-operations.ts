import { Analytics } from '@hcengineering/analytics'
import { getWorkspaceId, systemAccountEmail, versionToString, type BaseWorkspaceInfo, type Branding, type Data, type MeasureContext, type Tx, type Version, type WorkspaceIdWithUrl } from '@hcengineering/core'
import { consoleModelLogger, type MigrateOperation, type ModelLogger } from '@hcengineering/model'
import { getTransactorEndpoint, updateWorkspaceInfo } from '@hcengineering/server-client'
import { type StorageConfiguration } from '@hcengineering/server-core'
import { buildStorageFromConfig, storageConfigFromEnv } from '@hcengineering/server-storage'
import { generateToken } from '@hcengineering/server-token'
import { initModel, upgradeModel } from '@hcengineering/server-tool'
import { type Db } from 'mongodb'
/**
 * @public
 */
export async function createWorkspace (
  ctx: MeasureContext,
  dbUri: string,
  version: Data<Version>,
  productId: string,
  branding: Branding | null,
  workspaceInfo: BaseWorkspaceInfo,
  txes: Tx[],
  migrationOperation: [string, MigrateOperation][]
): Promise<void> {
  const childLogger = ctx.newChild('createUserWorkspace', {}, { workspace: workspaceInfo.workspace })
  const ctxModellogger: ModelLogger = {
    log: (msg, data) => {
      childLogger.info(msg, data)
    },
    error: (msg, data) => {
      childLogger.error(msg, data)
    }
  }
  const model: Tx[] = []
  try {
    const wsUrl: WorkspaceIdWithUrl = {
      name: workspaceInfo.workspace,
      productId: workspaceInfo.productId,
      workspaceName: workspaceInfo.workspaceName ?? '',
      workspaceUrl: workspaceInfo.workspaceUrl ?? ''
    }

    const wsId = getWorkspaceId(workspaceInfo.workspace, productId)
    const token = generateToken(systemAccountEmail, wsId, { service: 'workspace' })

    await childLogger.withLog('init-workspace', {}, async (ctx) => {
      await initModel(ctx, wsId, txes, ctxModellogger, async (value) => {
        await updateWorkspaceInfo(token, workspaceInfo.workspace, 'progress', 10 + Math.round((Math.min(value, 100) / 100) * 10))
      })
    })

    const storageConfig: StorageConfiguration = storageConfigFromEnv()
    const storageAdapter = buildStorageFromConfig(storageConfig, dbUri)

    try {
      registerServerPlugins()
      registerStringLoaders()
      const factory: PipelineFactory = createServerPipeline(
        ctx,
        mongodbUri,
        {
          externalStorage: storageAdapter,
          fullTextUrl: 'http://localost:9200',
          indexParallel: 0,
          indexProcessing: 0,
          rekoniUrl: '',
          usePassedCtx: true
        },
        {
          fulltextAdapter: {
            factory: async () => new DummyFullTextAdapter(),
            url: '',
            stages: (adapter, storage, storageAdapter, contentAdapter) =>
              createIndexStages(
                ctx.newChild('stages', {}),
                wsUrl,
                branding,
                adapter,
                storage,
                storageAdapter,
                contentAdapter,
                0,
                0
              )
          }
        }
      )

      const pipeline = await factory(ctx, wsUrl, true, () => {}, null)
      const client = new TxOperations(wrapPipeline(ctx, pipeline, wsUrl), core.account.System)

      await updateModel(ctx, wsId, migrationOperation, client, ctxModellogger, async (value) => {
        await updateInfo({ createProgress: 20 + Math.round((Math.min(value, 100) / 100) * 10) })
      })

      await initializeWorkspace(ctx, branding, wsUrl, storageAdapter, client, ctxModellogger, async (value) => {
        await updateInfo({ createProgress: 30 + Math.round((Math.min(value, 100) / 100) * 70) })
      })
      await pipeline.close()
    } finally {
      await storageAdapter.close()
    }
  } catch (err: any) {
    Analytics.handleError(err)
    return { workspaceInfo, err, client: null as any }
  }

  if (postInitHandler !== undefined) {
    await ctx.withLog('post-handler', {}, async (ctx) => {
      await postInitHandler?.(workspaceInfo, model)
    })
  }

  childLogger.end()
  // Workspace is created, we need to clear disabled flag.
  await updateInfo({ createProgress: 100, disabled: false, creating: false })
  return { workspaceInfo, model }
}

function wrapPipeline (ctx: MeasureContext, pipeline: Pipeline, wsUrl: WorkspaceIdWithUrl): Client {
  const sctx = new SessionContextImpl(
    ctx,
    systemAccountEmail,
    'backup',
    true,
    { targets: {}, txes: [] },
    wsUrl,
    null,
    false
  )

  return {
    findAll: async (_class, query, options) => {
      return await pipeline.findAll(sctx, _class, query, options)
    },
    findOne: async (_class, query, options) => {
      return (await pipeline.findAll(sctx, _class, query, { ...options, limit: 1 })).shift()
    },
    close: async () => {
      await pipeline.close()
    },
    getHierarchy: () => {
      return pipeline.storage.hierarchy
    },
    getModel: () => {
      return pipeline.storage.modelDb
    },
    searchFulltext: async (query, options) => {
      return {
        docs: [],
        total: 0
      }
    },
    tx: async (tx) => {
      return await pipeline.tx(sctx, tx)
    },
    notify: (...tx) => {}
  }
}

/**
 * @public
 */
export async function upgradeWorkspace (
  ctx: MeasureContext,
  version: Data<Version>,
  txes: Tx[],
  migrationOperation: [string, MigrateOperation][],
  productId: string,
  db: Db,
  ws: BaseWorkspaceInfo,
  logger: ModelLogger = consoleModelLogger,
  forceUpdate: boolean = true,
  forceIndexes: boolean = false
): Promise<void> {
  const versionStr = versionToString(version)

  if (ws?.version !== undefined && !forceUpdate && versionStr === versionToString(ws.version)) {
    return
  }
  ctx.info('upgrading', {
    force: forceUpdate,
    currentVersion: ws?.version !== undefined ? versionToString(ws.version) : '',
    toVersion: versionStr,
    workspace: ws.workspace
  })
  const wsId = getWorkspaceId(ws.workspace, productId)
  const token = generateToken(systemAccountEmail, wsId, { service: 'workspace' })
  const progress = 0

  const intHandle = setInterval(() => {
    await updateWorkspaceInfo(token, ws.workspace, 'progress', progress)
  }, 5000)
  try {
    await upgradeModel(
      ctx,
      await getTransactorEndpoint(token, 'internal'),
      getWorkspaceId(ws.workspace, productId),
      txes,
      migrationOperation,
      logger,
      false,
      async (value) => {},
      forceIndexes
    )
  } finally {
    clearInterval(intHandle)
  }
}
