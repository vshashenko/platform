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

import { type Resources } from '@hcengineering/platform'
import { type SurveyElement as SurveyElementType } from '@hcengineering/surveys'
import { eventToHTMLElement, showPopup } from '@hcengineering/ui'
import SurveyElementPresenter from './components/SurveyElementPresenter.svelte'
import SurveysDropdownEditor from './components/SurveysDropdownEditor.svelte'
import SurveysEditor from './components/SurveysEditor.svelte'
import SurveysView from './components/SurveysView.svelte'
import EditSurveyElement from './components/EditSurveyElement.svelte'
import SurveysEditorPopup from './components/SurveysEditorPopup.svelte'
import CreateSurveyElement from './components/CreateSurveyElement.svelte'
import SurveysItemPresenter from './components/SurveysItemPresenter.svelte'
import SurveysFilter from './components/SurveysFilter.svelte'
import SurveysPresenter from './components/SurveysPresenter.svelte'
import SurveyArrayEditor from './components/SurveyArrayEditor.svelte'
import SurveysList from './components/SurveysList.svelte'
import SurveyReferencePresenter from './components/SurveyReferencePresenter.svelte'
import SurveyElementCountPresenter from './components/SurveyElementCountPresenter.svelte'
import SurveysAttributeEditor from './components/SurveysAttributeEditor.svelte'
import LabelsPresenter from './components/LabelsPresenter.svelte'
import ObjectsSurveysEditorPopup from './components/ObjectsSurveysEditorPopup.svelte'
import SurveysFilterPresenter from './components/SurveysFilterPresenter.svelte'
import DocSurveysEditor from './components/DocSurveysEditor.svelte'
import SurveyElement from './components/SurveyElement.svelte'
import { getRefs, selectedSurveyElements } from './utils'
import type { Filter } from '@hcengineering/view'
import type { ObjQueryType } from '@hcengineering/core'

export { SurveyElement, selectedSurveyElements }

export async function surveysInResult (filter: Filter, onUpdate: () => void): Promise<ObjQueryType<any>> {
  const result = await getRefs(filter, onUpdate)
  return { $in: result }
}

export async function surveysNinResult (filter: Filter, onUpdate: () => void): Promise<ObjQueryType<any>> {
  const result = await getRefs(filter, onUpdate)
  return { $nin: result }
}

export async function createSurveyElement (props: Record<string, any> = {}): Promise<void> {
  showPopup(CreateSurveyElement, props, 'top')
}

export default async (): Promise<Resources> => ({
  component: {
    SurveyReferencePresenter,
    SurveyElementPresenter,
    SurveysPresenter,
    SurveysView,
    SurveysFilter,
    SurveysEditor,
    SurveysDropdownEditor,
    SurveysItemPresenter,
    SurveyElementCountPresenter,
    SurveysAttributeEditor,
    SurveysEditorPopup,
    EditSurveyElement,
    LabelsPresenter,
    ObjectsSurveysEditorPopup,
    SurveysFilterPresenter,
    DocSurveysEditor,
    SurveyArrayEditor,
    SurveysList
  },
  actionImpl: {
    Open: (value: SurveyElementType, evt: MouseEvent) => {
      showPopup(EditSurveyElement, { value, keyTitle: '' }, eventToHTMLElement(evt))
    }
  },
  function: {
    CreateSurveyElement: createSurveyElement,
    FilterSurveysInResult: surveysInResult,
    FilterSurveysNinResult: surveysNinResult
  }
})
