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

import { type Domain, IndexKind, type Ref } from '@hcengineering/core'
import { type Builder, Index, Prop, TypeString, TypeAny, Model, UX, TypeRef } from '@hcengineering/model'
import core, { TAttachedDoc, TDoc } from '@hcengineering/model-core'
import view from '@hcengineering/model-view'
import type {
  FormElementType,
  FormItem,
  SurveyElement,
  SurveyReference
} from '@hcengineering/surveys'
import surveys from './plugin'
import { IntlString } from '@hcengineering/platform'

export { type SurveyElement, type SurveyReference, surveysId } from '@hcengineering/surveys'
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

@Model(surveys.class.SurveyReference, core.class.AttachedDoc, DOMAIN_SURVEYS)
@UX(surveys.string.SurveyReferenceLabel)
export class TSurveyReference extends TAttachedDoc implements SurveyReference {
  @Prop(TypeString(), surveys.string.TitleLabel)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeRef(surveys.class.SurveyElement), surveys.string.SurveyLabel)
  @Index(IndexKind.Indexed)
    survey!: Ref<SurveyElement>

  @Prop(TypeRef(surveys.class.SurveyElement), surveys.string.SurveyLabel)
  @Index(IndexKind.Indexed)
    formItem!: FormItem[]

  @Prop(TypeString(), surveys.string.ColorLabel)
    color!: number
}

@Model(surveys.class.FormELement, core.class.Doc, DOMAIN_SURVEYS)
@UX(surveys.string.TargetFormItemsLabel)
export class TFormELement extends TDoc implements FormItem {
  @Prop(TypeString(), surveys.string.IdLabel)
    id!: number

  @Prop(TypeString(), surveys.string.TypeLabel)
    type!: FormElementType

  @Prop(TypeString(), surveys.string.QuestionLabel)
    question!: string

  @Prop(TypeString(), surveys.string.OptionsLabel)
    options?: string[]

  @Prop(TypeString(), surveys.string.DefaultLabel)
    defaultValue?: string
}

export function createModel (builder: Builder): void {
  builder.createModel(TSurveyElement, TSurveyReference, TFormELement)

  builder.mixin(surveys.class.SurveyElement, core.class.Class, view.mixin.ObjectFactory, {
    create: surveys.function.CreateSurveyElement
  })

  builder.mixin(surveys.class.SurveyReference, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: surveys.component.SurveyReferencePresenter
  })

  builder.mixin(surveys.class.SurveyElement, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: surveys.component.SurveyElementPresenter
  })

  builder.mixin(surveys.class.SurveyReference, core.class.Class, view.mixin.AttributeFilter, {
    component: surveys.component.SurveysFilter
  })

  builder.mixin(surveys.class.SurveyElement, core.class.Class, view.mixin.IgnoreActions, {
    actions: [view.action.Open]
  })

  builder.mixin(surveys.class.SurveyReference, core.class.Class, view.mixin.AttributeFilterPresenter, {
    presenter: surveys.component.SurveysFilterPresenter
  })

  builder.createDoc(
    view.class.FilterMode,
    core.space.Model,
    {
      label: view.string.FilterIsEither,
      selectedLabel: view.string.FilterIsEitherPlural,
      result: surveys.function.FilterSurveysInResult
    },
    surveys.filter.FilterSurveysIn
  )

  builder.createDoc(
    view.class.FilterMode,
    core.space.Model,
    {
      label: view.string.FilterIsNot,
      result: surveys.function.FilterSurveysNinResult
    },
    surveys.filter.FilterSurveysNin
  )
  builder.createDoc(core.class.DomainIndexConfiguration, core.space.Model, {
    domain: DOMAIN_SURVEYS,
    disabled: [
      { modifiedOn: 1 },
      { modifiedBy: 1 },
      { createdBy: 1 },
      { createdOn: 1 },
      { space: 1 },
      { attachedToClass: 1 },
      { createdOn: -1 }
    ]
  })
}
