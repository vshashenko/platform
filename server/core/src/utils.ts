import core, {
  AccountRole,
  WorkspaceEvent,
  generateId,
  getTypeOf,
  systemAccountEmail,
  type Account,
  type BackupClient,
  type Branding,
  type BrandingMap,
  type BulkUpdateEvent,
  type Class,
  type Client,
  type Doc,
  type DocInfo,
  type MeasureContext,
  type ModelDb,
  type Ref,
  type SessionData,
  type TxWorkspaceEvent,
  type WorkspaceIdWithUrl
} from '@hcengineering/core'
import platform, { PlatformError, Severity, Status, unknownError } from '@hcengineering/platform'
import { createHash, type Hash } from 'crypto'
import fs from 'fs'
import { BackupClientOps } from './storage'
import type { Pipeline } from './types'

/**
 * Return some estimation for object size
 */
export function estimateDocSize (_obj: any): number {
  let result = 0
  const toProcess = [_obj]
  while (toProcess.length > 0) {
    const obj = toProcess.shift()
    if (typeof obj === 'undefined') {
      continue
    }
    if (typeof obj === 'function') {
      continue
    }
    for (const key in obj) {
      // include prototype properties
      const value = obj[key]
      const type = getTypeOf(value)
      result += key.length

      switch (type) {
        case 'Array':
          result += 4
          toProcess.push(value)
          break
        case 'Object':
          toProcess.push(value)
          break
        case 'Date':
          result += 24 // Some value
          break
        case 'string':
          result += (value as string).length
          break
        case 'number':
          result += 8
          break
        case 'boolean':
          result += 1
          break
        case 'symbol':
          result += (value as symbol).toString().length
          break
        case 'bigint':
          result += (value as bigint).toString().length
          break
        case 'undefined':
          result += 1
          break
        case 'null':
          result += 1
          break
        default:
          result += value.toString().length
      }
    }
  }
  return result
}
/**
 * Return some estimation for object size
 */
export function updateHashForDoc (hash: Hash, _obj: any): void {
  const toProcess = [_obj]
  while (toProcess.length > 0) {
    const obj = toProcess.shift()
    if (typeof obj === 'undefined') {
      continue
    }
    if (typeof obj === 'function') {
      continue
    }
    for (const key in obj) {
      // include prototype properties
      const value = obj[key]
      const type = getTypeOf(value)
      hash.update(key)

      switch (type) {
        case 'Array':
          toProcess.push(value)
          break
        case 'Object':
          toProcess.push(value)
          break
        case 'Date':
          hash.update(value.toString())
          break
        case 'string':
          hash.update(value)
          break
        case 'number':
          hash.update((value as number).toString(16))
          break
        case 'boolean':
          hash.update((value as boolean) ? '1' : '0')
          break
        case 'symbol':
          hash.update((value as symbol).toString())
          break
        case 'bigint':
          hash.update((value as bigint).toString())
          break
        case 'undefined':
          hash.update('und')
          break
        case 'null':
          hash.update('null')
          break
        default:
          hash.update(value.toString())
      }
    }
  }
}

export function getUser (modelDb: ModelDb, userEmail: string | undefined, admin?: boolean): Account {
  if (userEmail === undefined) {
    throw new PlatformError(new Status(Severity.ERROR, platform.status.Forbidden, {}))
  }
  const account = modelDb.getAccountByEmail(userEmail)
  if (account === undefined) {
    if (userEmail === systemAccountEmail || admin === true) {
      return {
        _id: core.account.System,
        _class: core.class.Account,
        role: AccountRole.Owner,
        email: systemAccountEmail,
        space: core.space.Model,
        modifiedBy: core.account.System,
        modifiedOn: 0
      }
    }
    throw new PlatformError(new Status(Severity.ERROR, platform.status.Forbidden, {}))
  }
  return account
}

export class SessionDataImpl implements SessionData {
  _account: Account | undefined

  constructor (
    readonly userEmail: string,
    readonly sessionId: string,
    readonly admin: boolean | undefined,
    readonly broadcast: SessionData['broadcast'],
    readonly workspace: WorkspaceIdWithUrl,
    readonly branding: Branding | null,
    readonly isAsyncContext: boolean,
    readonly removedMap: Map<Ref<Doc>, Doc>,
    readonly contextCache: Map<string, any>,
    readonly modelDb: ModelDb,
    readonly rawAccount?: Account
  ) {}

  get account (): Account {
    this._account = this.rawAccount ?? this._account ?? getUser(this.modelDb, this.userEmail, this.admin)
    return this._account
  }

  getAccount (account: Ref<Account>): Account | undefined {
    return this.modelDb.findObject(account)
  }
}

export function createBroadcastEvent (classes: Ref<Class<Doc>>[]): TxWorkspaceEvent<BulkUpdateEvent> {
  return {
    _class: core.class.TxWorkspaceEvent,
    _id: generateId(),
    event: WorkspaceEvent.BulkUpdate,
    params: {
      _class: classes
    },
    modifiedBy: core.account.System,
    modifiedOn: Date.now(),
    objectSpace: core.space.DerivedTx,
    space: core.space.DerivedTx
  }
}

export function loadBrandingMap (brandingPath?: string): BrandingMap {
  let brandings: BrandingMap = {}
  if (brandingPath !== undefined && brandingPath !== '') {
    brandings = JSON.parse(fs.readFileSync(brandingPath, 'utf8'))

    for (const [host, value] of Object.entries(brandings)) {
      const protocol = value.protocol ?? 'https'
      value.front = `${protocol}://${host}/`
    }
  }

  return brandings
}

export function toDocInfo (d: Doc, bulkUpdate: Map<Ref<Doc>, string>, recheck?: boolean): DocInfo {
  let digest: string | null = (d as any)['%hash%']
  if ('%hash%' in d) {
    delete d['%hash%']
  }
  const pos = (digest ?? '').indexOf('|')
  const oldDigest = digest
  if (digest == null || digest === '' || recheck === true) {
    const size = estimateDocSize(d)

    const hash = createHash('sha256')
    updateHashForDoc(hash, d)
    digest = hash.digest('base64')
    const newDigest = `${digest}|${size.toString(16)}`

    if (recheck !== true || oldDigest !== newDigest) {
      bulkUpdate.set(d._id, `${digest}|${size.toString(16)}`)
    }
    return {
      id: d._id,
      hash: digest,
      size
    }
  } else {
    return {
      id: d._id,
      hash: digest.slice(0, pos),
      size: parseInt(digest.slice(pos + 1), 16)
    }
  }
}

export function wrapPipeline (
  ctx: MeasureContext,
  pipeline: Pipeline,
  wsUrl: WorkspaceIdWithUrl
): Client & BackupClient {
  const contextData = new SessionDataImpl(
    systemAccountEmail,
    'backup',
    true,
    { targets: {}, txes: [] },
    wsUrl,
    null,
    false,
    new Map(),
    new Map(),
    pipeline.context.modelDb
  )
  ctx.contextData = contextData
  if (pipeline.context.lowLevelStorage === undefined) {
    throw new PlatformError(unknownError('Low level storage is not available'))
  }
  const backupOps = new BackupClientOps(pipeline.context.lowLevelStorage)

  return {
    findAll: async (_class, query, options) => {
      return await pipeline.findAll(ctx, _class, query, options)
    },
    findOne: async (_class, query, options) => {
      return (await pipeline.findAll(ctx, _class, query, { ...options, limit: 1 })).shift()
    },
    clean: async (domain, docs) => {
      await backupOps.clean(ctx, domain, docs)
    },
    close: async () => {},
    closeChunk: async (idx) => {
      await backupOps.closeChunk(ctx, idx)
    },
    getHierarchy: () => {
      return pipeline.context.hierarchy
    },
    getModel: () => {
      return pipeline.context.modelDb
    },
    loadChunk: async (domain, idx, recheck) => {
      return await backupOps.loadChunk(ctx, domain, idx, recheck)
    },
    loadDocs: async (domain, docs) => {
      return await backupOps.loadDocs(ctx, domain, docs)
    },
    upload: async (domain, docs) => {
      await backupOps.upload(ctx, domain, docs)
    },
    searchFulltext: async (query, options) => {
      return {
        docs: [],
        total: 0
      }
    },
    sendForceClose: async () => {},
    tx: async (tx) => {
      return {}
    },
    notify: (...tx) => {}
  }
}
