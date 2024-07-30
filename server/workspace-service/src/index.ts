//
// Copyright © 2023 Hardcore Engineering Inc.
//

import account, {
  accountId
} from '@hcengineering/account'
import accountEn from '@hcengineering/account/lang/en.json'
import accountRu from '@hcengineering/account/lang/ru.json'
import { Analytics } from '@hcengineering/analytics'
import {
  type BrandingMap,
  type Data,
  type MeasureContext,
  type Tx,
  type Version
} from '@hcengineering/core'
import { type MigrateOperation } from '@hcengineering/model'
import platform, { addStringsLoader, setMetadata } from '@hcengineering/platform'
import serverClientPlugin from '@hcengineering/server-client'
import serverToken from '@hcengineering/server-token'
import toolPlugin from '@hcengineering/server-tool'
import { WorkspaceWorker } from './service'

/**
 * @public
 */
export function workspaceAccount (
  measureCtx: MeasureContext,
  version: Data<Version>,
  txes: Tx[],
  migrateOperations: [string, MigrateOperation][],
  productId: string,
  region: string,
  brandings: BrandingMap,
  onClose?: () => void
): void {
  console.log('Starting workspace service with brandings: ', brandings, ' on region:', region)

  const accountUri = process.env.ACCOUNTS_URL
  if (accountUri === undefined) {
    console.log('Please provide account url')
    process.exit(1)
  }
  setMetadata(serverClientPlugin.metadata.Endpoint, accountUri)

  const transactorUri = process.env.TRANSACTOR_URL
  if (transactorUri === undefined) {
    console.log('Please provide transactor url')
    process.exit(1)
  }

  const serverSecret = process.env.SERVER_SECRET
  if (serverSecret === undefined) {
    console.log('Please provide server secret')
    process.exit(1)
  }

  const dbUri = process.env.MONGO_URL
  if (dbUri === undefined) {
    console.log('Please provide mongodb url')
    process.exit(1)
  }

  addStringsLoader(accountId, async (lang: string) => {
    switch (lang) {
      case 'en':
        return accountEn
      case 'ru':
        return accountRu
      default:
        return accountEn
    }
  })

  const frontURL = process.env.FRONT_URL
  const lang = process.env.LANGUAGE ?? 'en'

  setMetadata(account.metadata.Transactors, transactorUri)
  setMetadata(platform.metadata.locale, lang)
  setMetadata(account.metadata.FrontURL, frontURL)

  setMetadata(serverToken.metadata.Secret, serverSecret)

  const initWS = process.env.INIT_WORKSPACE
  if (initWS !== undefined) {
    setMetadata(toolPlugin.metadata.InitWorkspace, initWS)
  }
  const initScriptUrl = process.env.INIT_SCRIPT_URL
  if (initScriptUrl !== undefined) {
    setMetadata(toolPlugin.metadata.InitScriptURL, initScriptUrl)
  }
  setMetadata(serverClientPlugin.metadata.UserAgent, 'AccountService')

  const worker = new WorkspaceWorker(version, txes, migrateOperations, productId, region, parseInt(process.env.PARALLEL ?? '1'), dbUri)

  void worker.start(measureCtx, {
    errorHandler: async (ws, err) => {
      Analytics.handleError(err)
    },
    force: false,
    console: false,
    logs: 'upgrade-logs',
    waitTimeout: 30000
  })

  process.on('uncaughtException', (e) => {
    measureCtx.error('uncaughtException', { error: e })
  })

  process.on('unhandledRejection', (reason, promise) => {
    measureCtx.error('Unhandled Rejection at:', { reason, promise })
  })
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  process.on('exit', close)
}
