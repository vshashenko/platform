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
  import { AttachedData, Class, Doc, Ref } from '@hcengineering/core'
  import { SurveyElement, SurveyReference } from '@hcengineering/surveys'
  import { createEventDispatcher } from 'svelte'
  import SurveysPopup from './SurveysPopup.svelte'

  export let targetClass: Ref<Class<Doc>>
  export let surveys: AttachedData<SurveyReference>[] = []

  $: selected = surveys.map((p) => p.survey)

  const dispatch = createEventDispatcher()
  async function addRef ({ title, color, _id: survey }: SurveyElement): Promise<void> {
    surveys = [
      ...surveys,
      {
        survey,
        title,
        color
      }
    ]
    dispatch('update', surveys)
  }

  async function removeSurvey (survey: SurveyElement): Promise<void> {
    surveys = surveys.filter((t) => t.survey !== survey._id)
    dispatch('update', surveys)
  }

  async function onUpdate (event: CustomEvent<{ action: string, survey: SurveyElement }>) {
    const result = event.detail
    if (result === undefined) return
    if (result.action === 'add') addRef(result.survey)
    else if (result.action === 'remove') removeSurvey(result.survey)
  }
</script>

<SurveysPopup {targetClass} {selected} on:update={onUpdate} />
