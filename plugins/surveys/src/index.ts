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

import type { AttachedDoc, Class, Doc, Ref, Space } from '@hcengineering/core'
import type { Asset, IntlString, Plugin } from '@hcengineering/platform'
import { plugin } from '@hcengineering/platform'
import { AnyComponent } from '@hcengineering/ui'
import { FilterMode } from '@hcengineering/view'

/**
 * @public
 */
export interface SurveyElement extends Doc {
  title: string
  color: number
  formItems: FormItem[]
}

/**
 * @public
 */
export interface SurveyReference extends AttachedDoc {
  title: string
  formItem: FormItem[]
  survey: SurveyElement
  color: number
}

/**
 * @public
 */
export type FormElementType = 'long-text' | 'short-text' | 'select' | 'checkbox' | 'range'

/**
 * @public
 */

export interface FormItem {
  id: number
  type: FormElementType
  question: string
  options?: string[] | undefined
  defaultValue?: string
}

/**
 * @public
 */
export const surveysId = 'surveys' as Plugin

/**
 * @public
 */
const surveysPlugin = plugin(surveysId, {
  class: {
    SurveyElement: '' as Ref<Class<SurveyElement>>,
    SurveyReference: '' as Ref<Class<SurveyReference>>,
    FormElement: '' as Ref<Class<any>>
  },
  space: {
    Surveys: '' as Ref<Space>
  },
  icon: {
    Surveys: '' as Asset
  },
  component: {
    SurveysView: '' as AnyComponent,
    SurveysEditor: '' as AnyComponent,
    SurveysDropdownEditor: '' as AnyComponent,
    SurveysPresenter: '' as AnyComponent,
    SurveysAttributeEditor: '' as AnyComponent,
    LabelsPresenter: '' as AnyComponent,
    SurveysEditorPopup: '' as AnyComponent
  },
  string: {
    Surveys: '' as IntlString,
    AddLabel: '' as IntlString,
    SurveyLabel: '' as IntlString
  },
  filter: {
    FilterSurveysIn: '' as Ref<FilterMode>,
    FilterSurveysNin: '' as Ref<FilterMode>
  }
})

/**
 * @public
 */
export default surveysPlugin
