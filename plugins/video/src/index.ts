//
// Copyright © 2020, 2021 Anticrm Platform Contributors.
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
  Class,
  Doc,
  Ref,
  Space
} from '@hcengineering/core'
import type { Asset, IntlString, Metadata, Plugin, Resource } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import type { AnyComponent } from '@hcengineering/ui'

export interface Video extends Doc {
  name: string
  url: string
}

export interface VideoSpace extends Space {}

/**
 * @public
 */
export const videoId = 'video' as Plugin

export default plugin(videoId, {
  icon: {
    Video: '' as Asset,
    Record: '' as Asset,
    Stop: '' as Asset,
    Camera: '' as Asset,
    Settings: '' as Asset,
    Cancel: '' as Asset
  },
  function: {
    openRecordingOverlay: '' as Resource<() => void>
  },
  component: {
    NewRecordingButton: '' as AnyComponent
  },
  metadata: {
    TusURL: '' as Metadata<string>,
    Token: '' as Metadata<string>
  },
  class: {
    Video: '' as Ref<Class<Video>>
  },
  string: {
    Video: '' as IntlString,
    Name: '' as IntlString,
    URL: '' as IntlString,
    ConfigLabel: '' as IntlString,
    ConfigDescription: '' as IntlString,
    NewRecording: '' as IntlString,
    VideoSettings: '' as IntlString,
    Camera: '' as IntlString,
    Microphone: '' as IntlString,
    ShareType: '' as IntlString
  }
})
