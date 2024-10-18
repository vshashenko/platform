import core, {
  type Blob,
  type Client as CoreClient,
  type Doc,
  type DocIndexState,
  type Markup,
  type MeasureContext,
  type Ref,
  type TxMixin,
  type TxCreateDoc,
  type TxUpdateDoc,
  type WorkspaceId,
  SortingOrder,
  TxProcessor
} from '@hcengineering/core'
import { type StorageAdapter } from '@hcengineering/server-core'
import { connect } from '@hcengineering/server-tool'
import { isEmptyMarkup } from '@hcengineering/text'

export async function restoreLostMarkup (
  ctx: MeasureContext,
  workspaceId: WorkspaceId,
  transactorUrl: string,
  storageAdapter: StorageAdapter,
  { command }: { command: 'show' | 'restore' }
): Promise<void> {
  const connection = (await connect(transactorUrl, workspaceId, undefined, {
    mode: 'backup'
  })) as unknown as CoreClient

  try {
    const hierarchy = connection.getHierarchy()
    const classes = hierarchy.getDescendants(core.class.Doc)

    for (const _class of classes) {
      const isAttachedDoc = hierarchy.isDerived(_class, core.class.AttachedDoc)

      const attributes = hierarchy.getAllAttributes(_class)
      const attrs = Array.from(attributes.values()).filter((p) => p.type._class === core.class.TypeCollaborativeDoc)

      // ignore classes with no collaborative attributes
      if (attrs.length === 0) continue

      const docs = await connection.findAll(_class, { _class })
      for (const doc of docs) {
        for (const attr of attrs) {
          const value = hierarchy.isMixin(attr.attributeOf)
            ? ((doc as any)[attr.attributeOf]?.[attr.name] as Ref<Blob>)
            : ((doc as any)[attr.name] as Ref<Blob>)

          if (value == null) continue

          const stat = await storageAdapter.stat(ctx, workspaceId, value)
          if (stat !== undefined) continue

          const query = isAttachedDoc
            ? {
                'tx.objectId': doc._id,
                'tx._class': { $in: [core.class.TxCreateDoc, core.class.TxUpdateDoc] }
              }
            : {
                objectId: doc._id
              }

          let restored = false

          // try to restore by txes
          // we need last tx that modified the attribute

          const txes = await connection.findAll(isAttachedDoc ? core.class.TxCollectionCUD : core.class.TxCUD, query, {
            sort: { modifiedOn: SortingOrder.Descending }
          })
          for (const tx of txes) {
            const innerTx = TxProcessor.extractTx(tx)

            let markup: string | undefined
            if (innerTx._class === core.class.TxMixin) {
              const mixinTx = innerTx as TxMixin<Doc, Doc>
              markup = (mixinTx.attributes as any)[attr.name]
            } else if (innerTx._class === core.class.TxCreateDoc) {
              const createTx = innerTx as TxCreateDoc<Doc>
              markup = (createTx.attributes as any)[attr.name]
            } else if (innerTx._class === core.class.TxUpdateDoc) {
              const updateTex = innerTx as TxUpdateDoc<Doc>
              markup = (updateTex.operations as any)[attr.name]
            } else {
              continue
            }

            if (markup === undefined || !markup.startsWith('{')) continue
            if (isEmptyMarkup(markup)) continue

            console.log(doc._class, doc._id, attr.name, markup)
            if (command === 'restore') {
              console.warn('restore not supported yet')
              // TODO save to storage
              // const ydoc = markupToYDoc(markup, attr.name)
              // await saveCollaborativeDoc(ctx, storageAdapter, workspaceId, value, ydoc)
            }
            restored = true
            break
          }

          if (restored) continue

          // try to restore by doc index state
          const docIndexState = await connection.findOne(core.class.DocIndexState, {
            _id: doc._id as Ref<DocIndexState>
          })
          if (docIndexState !== undefined) {
            // document:class:Document%content#content#base64
            const attrName = `${doc._class}%${attr.name}#content#base64`
            const base64: string | undefined = docIndexState.attributes[attrName]
            if (base64 !== undefined) {
              const text = Buffer.from(base64, 'base64').toString()
              if (text !== '') {
                const markup: Markup = JSON.stringify({
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text, marks: [] }]
                    }
                  ]
                })
                console.log(doc._class, doc._id, attr.name, markup)
                if (command === 'restore') {
                  console.warn('restore not supported yet')
                  // TODO save to storage
                  // const ydoc = markupToYDoc(markup, attr.name)
                  // await saveCollaborativeDoc(ctx, storageAdapter, workspaceId, value, ydoc)
                }
              }
            }
          }
        }
      }
    }
  } finally {
    await connection.close()
  }
}
