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
import EditSurveyElement from './components/EditSurveyElement.svelte'
import SurveyElementPresenter from './components/SurveyElementPresenter.svelte'
import Surveys from './components/Surveys.svelte'
import SurveysDropdownEditor from './components/SurveysDropdownEditor.svelte'
import SurveysEditor from './components/SurveysEditor.svelte'
import SurveysView from './components/SurveysView.svelte'
import SurveysEditorPopup from './components/SurveysEditorPopup.svelte'
import CreateSurveyElement from './components/CreateSurveyElement.svelte'
import SurveyElement from './components/SurveyElement.svelte'
import { selectedSurveyElements } from './utils'

export { SurveyElement, selectedSurveyElements }

export async function createSurveyElement (props: Record<string, any> = {}): Promise<void> {
  showPopup(CreateSurveyElement, props, 'top')
}

export default async (): Promise<Resources> => ({
  component: {
    Surveys,
    SurveyElementPresenter,
    SurveysView,
    SurveysEditor,
    SurveysDropdownEditor,
    SurveysEditorPopup,
    SurveyElement
  },
  actionImpl: {
    Open: (value: SurveyElementType, evt: MouseEvent) => {
      showPopup(EditSurveyElement, { value, keyTitle: '' }, eventToHTMLElement(evt))
    }
  },
  function: {
    CreateSurveyElement: createSurveyElement
  }
})
