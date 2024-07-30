//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { RateLimiter, systemAccountEmail, type BaseWorkspaceInfo, type Data, type MeasureContext, type Tx, type Version } from '@hcengineering/core'
import { type MigrateOperation, type ModelLogger } from '@hcengineering/model'
import { getMongoClient } from '@hcengineering/mongo'
import { getPendingWorkspace } from '@hcengineering/server-client'
import { generateToken } from '@hcengineering/server-token'
import { FileModelLogger } from '@hcengineering/server-tool'
import path from 'path'
import { upgradeWorkspace } from './ws-operations'

export type UpgradeErrorHandler = (workspace: BaseWorkspaceInfo, error: any) => Promise<void>

export interface WorkspaceOptions {
  errorHandler: (workspace: BaseWorkspaceInfo, error: any) => Promise<void>
  force: boolean
  console: boolean
  logs: string

  ignore?: string
  waitTimeout: number
}

export class WorkspaceWorker {
  rateLimit: RateLimiter
  constructor (
    readonly version: Data<Version>,
    readonly txes: Tx[],
    readonly migrationOperation: [string, MigrateOperation][],
    readonly productId: string,
    readonly region: string,
    limit: number,
    readonly dbUri: string
  ) {
    this.rateLimit = new RateLimiter(limit)
  }

  canceled = false

  st: number = Date.now()
  total: number = 0
  toProcess: number = 0
  eta: number = 0

  updateResponseStatistics (response: any): void {
    response.upgrade = {
      toProcess: this.toProcess,
      total: this.total,
      elapsed: Date.now() - this.st,
      eta: this.eta
    }
  }

  async close (): Promise<void> {
    this.canceled = true
  }

  private async _upgradeWorkspace (ctx: MeasureContext, ws: BaseWorkspaceInfo, opt: WorkspaceOptions): Promise<void> {
    if (ws.disabled === true || (opt.ignore ?? '').includes(ws.workspace)) {
      return
    }
    const t = Date.now()

    const ctxModelLogger: ModelLogger = {
      log (msg: string, data: any): void {
        ctx.info(msg, data)
      },
      error (msg: string, data: any): void {
        ctx.error(msg, data)
      }
    }

    const logger = opt.console ? ctxModelLogger : new FileModelLogger(path.join(opt.logs, `${ws.workspace}.log`))

    const avgTime = (Date.now() - this.st) / (this.total - this.toProcess + 1)
    this.eta = Math.floor(avgTime * this.toProcess)
    ctx.info('----------------------------------------------------------\n---UPGRADING----', {
      pending: this.toProcess,
      eta: this.eta,
      workspace: ws.workspace
    })
    this.toProcess--
    const mongoClient = getMongoClient(this.dbUri)
    try {
      const db = await mongoClient.getClient()
      const version = await upgradeWorkspace(
        ctx,
        this.version,
        this.txes,
        this.migrationOperation,
        this.productId,
        db,
        ws.workspaceUrl ?? ws.workspace,
        logger,
        opt.force
      )
      ctx.info('---done---------', {
        pending: this.toProcess,
        time: Date.now() - t,
        workspace: ws.workspace,
        version
      })
    } catch (err: any) {
      await opt.errorHandler(ws, err)

      logger.log('error', err)

      if (!opt.console) {
        ctx.error('error', { err })
      }

      ctx.info('---failed---------', {
        pending: this.toProcess,
        time: Date.now() - t,
        workspace: ws.workspace
      })
    } finally {
      mongoClient.close()
      if (!opt.console) {
        ;(logger as FileModelLogger).close()
      }
    }
  }

  wakeup: () => void = () => {}
  async start (ctx: MeasureContext, opt: WorkspaceOptions): Promise<void> {
    while (true) {
      const token = generateToken(systemAccountEmail, { name: '-', productId: this.productId }, { service: 'workspace' })
      const workspace = await ctx.with(
        'get-pending-workspace',
        {},
        async (ctx) =>
          await getPendingWorkspace(token, this.region, this.version)
      )
      if (workspace === undefined) {
        await this.doSleep(ctx, opt)
      } else {
        await this.rateLimit.exec(async () => {
          await this.doWorkspaceOperation(ctx, workspace, opt)
        })
      }
    }
  }

  private async doWorkspaceOperation (ctx: MeasureContext, workspace: BaseWorkspaceInfo, opt: WorkspaceOptions): Promise<void> {
    switch (workspace.mode) {
      case 'creating':
        // It seem, it stuck on workspace creation on previoous attempt, so we need to delete it first and re-create,
        break
      case 'pending-creation':
        // We need to start workspace creation
        break
      case 'upgrading':
      case 'active':
        // It seem version upgrade is required, or upgrade is not finished on previoous iteration.
        await this._upgradeWorkspace(ctx, workspace, opt)
        break
      case 'deleting':
        // Seems we failed to delete, so let's restore deletion.
        break
    }
  }

  private async doSleep (ctx: MeasureContext, opt: WorkspaceOptions): Promise<void> {
    ctx.info('sleeping for next upcoming request')
    await new Promise<void>((resolve) => {
      const to = setTimeout(resolve, opt.waitTimeout) // 30 seconds for next operation, or wakeup event.
      this.wakeup = () => {
        clearTimeout(to)
        resolve()
      }
    })
  }
}
