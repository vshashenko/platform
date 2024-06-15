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

import { type IntlString, mergeIds } from '@hcengineering/platform'
import { surveysId } from '@hcengineering/surveys'
import surveys from '@hcengineering/surveys-resources/src/plugin'
import type { AnyComponent } from '@hcengineering/ui/src/types'
import { type ViewAction } from '@hcengineering/model-view'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default mergeIds(surveysId, surveys, {
  // Without it, CLI version is failed with some svelte dependency exception.
  component: {
    Surveys: '' as AnyComponent,
    SurveyElementPresenter: '' as AnyComponent,
    SurveysView: '' as AnyComponent,
    SurveyElement: '' as AnyComponent
  },
  string: {
    SurveyElementLabel: '' as IntlString,
    TitleLabel: '' as IntlString,
    DescriptionLabel: '' as IntlString,
    ColorLabel: '' as IntlString,
    WeightLabel: '' as IntlString,
    TargetClassLabel: '' as IntlString,
    TargetCategoryLabel: '' as IntlString,
    AssetLabel: '' as IntlString,
    CategoryTargetClass: '' as IntlString,
    CategorySurveysLabel: '' as IntlString,
    DefaultLabel: '' as IntlString,
    FormItemsLabel: '' as IntlString
  },
  actionImpl: {
    Open: '' as ViewAction
  }
})
