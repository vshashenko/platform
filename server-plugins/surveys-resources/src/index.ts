//
// Copyright © 2022 Hardcore Engineering Inc.
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

import core, {
  Class,
  Doc,
  DocumentQuery,
  FindOptions,
  FindResult,
  Hierarchy,
  Ref,
  Tx,
  TxCreateDoc,
  TxCUD,
  TxProcessor,
  TxRemoveDoc
} from '@hcengineering/core'
import { TriggerControl } from '@hcengineering/server-core'
import surveys, { SurveyElement, SurveyReference } from '@hcengineering/surveys'

/**
 * @public
 */
export async function SurveyElementRemove (
  doc: Doc,
  hierarchy: Hierarchy,
  findAll: <T extends Doc>(
    clazz: Ref<Class<T>>,
    query: DocumentQuery<T>,
    options?: FindOptions<T>
  ) => Promise<FindResult<T>>
): Promise<Doc[]> {
  if (!hierarchy.isDerived(doc._class, surveys.class.SurveyElement)) return []
  return await findAll(surveys.class.SurveyReference, { survey: doc._id as Ref<SurveyElement> })
}

/**
 * @public
 */
export async function onSurveyReference (tx: Tx, control: TriggerControl): Promise<Tx[]> {
  const actualTx = TxProcessor.extractTx(tx)
  const isCreate = control.hierarchy.isDerived(actualTx._class, core.class.TxCreateDoc)
  const isRemove = control.hierarchy.isDerived(actualTx._class, core.class.TxRemoveDoc)
  if (!isCreate && !isRemove) return []
  if (!control.hierarchy.isDerived((actualTx as TxCUD<Doc>).objectClass, surveys.class.SurveyReference)) return []
  if (isCreate) {
    const doc = TxProcessor.createDoc2Doc(actualTx as TxCreateDoc<SurveyReference>)
    const res = control.txFactory.createTxUpdateDoc(surveys.class.SurveyElement, surveys.space.Surveys, doc.survey, {
      $inc: { refCount: 1 }
    })
    return [res]
  }
  if (isRemove) {
    const ctx = actualTx as TxRemoveDoc<SurveyReference>
    const doc = control.removedMap.get(ctx.objectId) as SurveyReference
    if (doc !== undefined) {
      if (!control.removedMap.has(doc.survey)) {
        const res = control.txFactory.createTxUpdateDoc(surveys.class.SurveyElement, surveys.space.Surveys, doc.survey, {
          $inc: { refCount: -1 }
        })
        return [res]
      }
    }
  }
  return []
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default async () => ({
  trigger: {
    onSurveyReference
  },
  function: {
    SurveyElementRemove
  }
})
