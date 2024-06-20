import {
  createDefaultSpace,
  tryUpgrade,
  type MigrateOperation,
  type MigrationClient,
  type MigrationUpgradeClient
} from '@hcengineering/model'
import { surveysId } from '@hcengineering/surveys'
import surveys from './plugin'

export const surveysOperation: MigrateOperation = {
  async migrate (client: MigrationClient): Promise<void> {},
  async upgrade (client: MigrationUpgradeClient): Promise<void> {
    await tryUpgrade(client, surveysId, [
      {
        state: 'create-defaults-space_surveys1',
        func: async (client) => {
          await createDefaultSpace(client, surveys.space.Surveys, { name: 'Surveys', description: 'Space for all surveys' })
        }
      }
    ])
  }
}
