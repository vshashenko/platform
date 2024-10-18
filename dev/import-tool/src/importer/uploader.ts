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
import {
  type Ref,
  type Blob as PlatformBlob,
  type Doc,
  type CollaborativeDoc,
  concatLink,
  makeCollabJsonId
} from '@hcengineering/core'

export interface FileUploader {
  uploadFile: (id: Ref<Doc>, name: string, file: File, contentType?: string) => Promise<Ref<PlatformBlob>>
  uploadCollaborativeDoc: (id: Ref<Doc>, collabId: CollaborativeDoc, data: Buffer) => Promise<Ref<PlatformBlob>>
}

export class FrontFileUploader implements FileUploader {
  constructor (
    private readonly frontUrl: string,
    private readonly token: string
  ) {}

  public async uploadFile (id: Ref<Doc>, name: string, file: File, contentType?: string): Promise<Ref<PlatformBlob>> {
    const form = new FormData()
    form.append('file', file, name)
    form.append('type', contentType ?? file.type)
    form.append('size', file.size.toString())
    form.append('name', file.name)
    form.append('id', id)
    form.append('data', new Blob([file]))

    await fetch(concatLink(this.frontUrl, '/files'), {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.token
      },
      body: form
    })

    return name as Ref<PlatformBlob>
  }

  public async uploadCollaborativeDoc (id: Ref<Doc>, collabId: CollaborativeDoc, data: Buffer): Promise<Ref<PlatformBlob>> {
    const blobId = makeCollabJsonId(collabId)
    const file = new File([data], blobId)
    await this.uploadFile(id, blobId, file, 'application/json')
    return blobId
  }
}
