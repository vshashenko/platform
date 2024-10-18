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

import { Blob, CollaborativeDoc, Markup, Ref, WorkspaceId, concatLink } from '@hcengineering/core'
import { encodeDocumentId } from './utils'

/** @public */
export interface GetContentRequest {
  source?: Ref<Blob>
}

/** @public */
export interface GetContentResponse {
  content: Record<string, Markup>
}

/** @public */
export interface UpdateContentRequest {
  content: Record<string, Markup>
}

/** @public */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UpdateContentResponse {}

/** @public */
export interface CollaboratorClient {
  getContent: (document: CollaborativeDoc, source: Ref<Blob> | null | undefined) => Promise<Markup>
  updateContent: (document: CollaborativeDoc, markup: Markup) => Promise<void>
  copyContent: (source: CollaborativeDoc, target: CollaborativeDoc) => Promise<void>
}

/** @public */
export function getClient (workspaceId: WorkspaceId, token: string, collaboratorUrl: string): CollaboratorClient {
  const url = collaboratorUrl.replaceAll('wss://', 'https://').replace('ws://', 'http://')
  return new CollaboratorClientImpl(workspaceId, token, url)
}

class CollaboratorClientImpl implements CollaboratorClient {
  constructor (
    private readonly workspace: WorkspaceId,
    private readonly token: string,
    private readonly collaboratorUrl: string
  ) {}

  private async rpc (document: CollaborativeDoc, method: string, payload: any): Promise<any> {
    const workspace = this.workspace.name
    const documentId = encodeDocumentId(workspace, document)

    const url = concatLink(this.collaboratorUrl, `/rpc/${encodeURIComponent(documentId)}`)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ method, payload })
    })

    if (!res.ok) {
      throw new Error('HTTP error ' + res.status)
    }

    const result = await res.json()

    if (result.error != null) {
      throw new Error(result.error)
    }

    return result
  }

  async getContent (document: CollaborativeDoc, source: Ref<Blob> | null | undefined): Promise<Markup> {
    const res = await retry(
      3,
      async () => {
        return (await this.rpc(document, 'getContent', { source })) as GetContentResponse
      },
      50
    )
    const content = res.content ?? {}
    return content[document.objectAttr] ?? ''
  }

  async updateContent (document: CollaborativeDoc, markup: Markup): Promise<void> {
    const content = {
      [document.objectAttr]: markup
    }

    await retry(
      3,
      async () => {
        await this.rpc(document, 'updateContent', { content })
      },
      50
    )
  }

  async copyContent (source: CollaborativeDoc, target: CollaborativeDoc, content?: Ref<Blob>): Promise<void> {
    const markup = await this.getContent(source, content)
    await this.updateContent(target, markup)
  }
}

async function retry<T> (retries: number, op: () => Promise<T>, delay: number = 100): Promise<T> {
  let error: any
  while (retries > 0) {
    retries--
    try {
      return await op()
    } catch (err: any) {
      error = err
      if (retries !== 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw error
}
