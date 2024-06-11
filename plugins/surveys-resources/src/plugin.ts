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

import { type IntlString, mergeIds, type Resource } from '@hcengineering/platform'
import surveys, { surveysId } from '@hcengineering/surveys'
import { type FilterFunction } from '@hcengineering/view'

export default mergeIds(surveysId, surveys, {
  component: {
  },
  string: {
    NoSurveys: '' as IntlString,
    AddSurvey: '' as IntlString,
    EditSurvey: '' as IntlString,
    AddSurveyTooltip: '' as IntlString,
    AddNowTooltip: '' as IntlString,
    CancelLabel: '' as IntlString,
    SearchCreate: '' as IntlString,
    QuickAddItems: '' as IntlString,
    NoItems: '' as IntlString,
    SurveyDescriptionLabel: '' as IntlString,
    SurveyDescriptionPlaceholder: '' as IntlString,
    WeightPlaceholder: '' as IntlString,
    CategoryPlaceholder: '' as IntlString,
    SurveyTooltip: '' as IntlString,
    Survey: '' as IntlString,
    SurveyCreateLabel: '' as IntlString,
    SurveyName: '' as IntlString,
    SaveLabel: '' as IntlString,
    CategoryLabel: '' as IntlString,
    AllCategories: '' as IntlString,
    SelectAll: '' as IntlString,
    SelectNone: '' as IntlString,
    ApplySurveys: '' as IntlString,

    Weight: '' as IntlString,
    Expert: '' as IntlString,
    Meaningfull: '' as IntlString,
    Initial: '' as IntlString,
    NumberLabels: '' as IntlString
  },
  function: {
    FilterSurveysInResult: '' as FilterFunction,
    FilterSurveysNinResult: '' as FilterFunction,
    CreateSurveyElement: '' as Resource<(props?: Record<string, any>) => Promise<void>>
  }
})
