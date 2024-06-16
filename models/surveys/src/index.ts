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

import { type Domain, IndexKind } from '@hcengineering/core'
import { type Builder, Index, Prop, TypeString, TypeAny, Model, UX } from '@hcengineering/model'
import core, { TDoc } from '@hcengineering/model-core'
import view from '@hcengineering/model-view'
import type {
  FormItem,
  SurveyElement
} from '@hcengineering/surveys'
import surveys from './plugin'

export { type SurveyElement, surveysId } from '@hcengineering/surveys'
export { surveysOperation } from './migration'
export { surveys as default }

export const DOMAIN_SURVEYS = 'surveys' as Domain

@Model(surveys.class.SurveyElement, core.class.Doc, DOMAIN_SURVEYS)
@UX(surveys.string.SurveyElementLabel)
export class TSurveyElement extends TDoc implements SurveyElement {
  @Prop(TypeString(), surveys.string.TitleLabel)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeString(), surveys.string.ColorLabel)
    color!: number

  @Prop(TypeAny(undefined, surveys.string.FormItemsLabel, undefined), surveys.string.FormItemsLabel)
    formItems!: FormItem[]
}

export function createModel (builder: Builder): void {
  builder.createModel(TSurveyElement)

  builder.mixin(surveys.class.SurveyElement, core.class.Class, view.mixin.ObjectFactory, {
    create: surveys.function.CreateSurveyElement
  })

  builder.mixin(surveys.class.SurveyElement, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: surveys.component.SurveyElementPresenter
  })
}
