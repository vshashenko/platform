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
  import { Doc, Ref } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import surveys, { SurveyElement, SurveyReference } from '@hcengineering/surveys'
  import SurveysPopup from './SurveysPopup.svelte'

  export let value: Doc | Doc[]
  $: objects = Array.isArray(value) ? value : [value]

  let selected: Ref<SurveyElement>[] = []
  let surveyRefs: SurveyReference[] = []
  const query = createQuery()
  $: query.query(surveys.class.SurveyReference, { attachedTo: { $in: objects.map((p) => p._id) } }, (result) => {
    surveyRefs = result
    const res: Record<Ref<SurveyElement>, SurveyReference> = {}
    for (const value of result) {
      const arr = (res as any)[value.survey] ?? []
      arr.push(value)
      ;(res as any)[value.survey] = arr
    }
    const sel: Ref<SurveyElement>[] = []
    for (const value in res) {
      if ((res as any)[value].length === objects.length) {
        sel.push(value as Ref<SurveyElement>)
      }
    }
    selected = sel
  })

  const client = getClient()
  async function addRef({ title, color, _id: survey }: SurveyElement): Promise<void> {
    await Promise.all(
      objects.map(async (object) => {
        if (surveyRefs.findIndex((p) => p.attachedTo === object._id && p.survey === survey) !== -1) return

        await client.addCollection(surveys.class.SurveyReference, object.space, object._id, object._class, 'labels', {
          title,
          color,
          survey
        })
      })
    )
  }
  async function removeSurvey(survey: SurveyElement): Promise<void> {
    await Promise.all(
      objects.map(async (object) => {
        const surveyRef = await client.findOne(surveys.class.SurveyReference, {
          attachedTo: object._id,
          survey: survey._id
        })
        if (surveyRef) await client.remove(surveyRef)
      })
    )
  }
  async function onUpdate(event: CustomEvent<{ action: string; survey: SurveyElement }>) {
    const result = event.detail
    if (result === undefined) return
    if (result.action === 'add') addRef(result.survey)
    else if (result.action === 'remove') removeSurvey(result.survey)
  }
</script>

<SurveysPopup targetClass={objects[0]._class} {selected} on:update={onUpdate} />
