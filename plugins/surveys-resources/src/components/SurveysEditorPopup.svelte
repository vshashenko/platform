<!--
// Copyright © 2023 Hardcore Engineering Inc.
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
-->
<script lang="ts">
  import { Class, Doc, Ref } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import surveys, { SurveyElement } from '@hcengineering/surveys'
  import SurveysPopup from './SurveysPopup.svelte'

  export let object: Doc
  export let targetClass: Ref<Class<Doc>> = object._class

  let selected: Ref<SurveyElement>[] = []
  const query = createQuery()
  $: query.query(surveys.class.SurveyReference, { attachedTo: object._id }, (result) => {
    selected = result.map(({ survey }) => survey)
  })
  const client = getClient()
  async function addRef({ title, color, _id: survey }: SurveyElement): Promise<void> {
    // check if survey already attached, could happen if 'add' clicked faster than ui updates
    const containsSurvey = selected.some((refElement) => refElement === survey)
    if (containsSurvey) {
      return
    }

    selected.push(survey)

    await client.addCollection(surveys.class.SurveyReference, object.space, object._id, object._class, 'labels', {
      title,
      color,
      survey
    })
  }

  async function removeSurvey(survey: SurveyElement): Promise<void> {
    const surveyRef = await client.findOne(surveys.class.SurveyReference, {
      survey: survey._id,
      attachedTo: object._id
    })
    if (surveyRef) {
      await client.remove(surveyRef)
      selected.splice(selected.indexOf(survey._id), 1)
    }
  }

  async function onUpdate(event: CustomEvent<{ action: string; survey: SurveyElement }>) {
    const result = event.detail
    if (result === undefined) return
    if (result.action === 'add') addRef(result.survey)
    else if (result.action === 'remove') removeSurvey(result.survey)
  }
</script>

<SurveysPopup {targetClass} {selected} on:update={onUpdate} />
