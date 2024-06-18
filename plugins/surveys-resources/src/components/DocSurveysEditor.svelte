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
  import { createEventDispatcher } from 'svelte'
  import { Class, Doc, Ref } from '@hcengineering/core'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import surveys, { SurveyReference } from '@hcengineering/surveys'
  import { ButtonBase, ButtonKind, Icon, Label, getEventPopupPositionElement, showPopup } from '@hcengineering/ui'
  import surveysPlugin from '../plugin'
  import SurveyReferencePresenter from './SurveyReferencePresenter.svelte'
  import SurveysEditorPopup from './SurveysEditorPopup.svelte'
  import SurveyIcon from './icons/SurveyIcon.svelte'

  export let object: Doc
  export let targetClass: Ref<Class<Doc>>
  export let type: 'type-button-only' | 'type-content-only' = 'type-content-only'
  export let buttonParams: Record<string, any> = {}
  export let contentParams: Record<string, any> = {}

  const dispatch = createEventDispatcher()

  let items: SurveyReference[] = []
  let pressed: boolean = false
  const query = createQuery()
  const client = getClient()

  $: query.query(surveys.class.SurveyReference, { attachedTo: object._id }, (result) => {
    items = result
  })

  async function click (evt: MouseEvent): Promise<void> {
    pressed = true
    showPopup(
      SurveysEditorPopup,
      { object, targetClass },
      getEventPopupPositionElement(evt),
      () => {
        pressed = false
      },
      undefined,
      {
        refId: 'SurveysPopup',
        category: 'popup',
        overlay: true
      }
    )
  }

  async function removeSurvey (survey: SurveyReference): Promise<void> {
    if (survey !== undefined) await client.remove(survey)
  }

  let count: number = 0
  $: updated(items)

  const updated = (its: SurveyReference[]): void => {
    if (count === its.length) return
    count = its.length
    dispatch('change', count)
  }
</script>

{#if type === 'type-button-only'}
  <ButtonBase
    icon={SurveyIcon}
    type={'type-button-icon'}
    kind={'secondary'}
    size={'small'}
    {pressed}
    hasMenu
    {...buttonParams}
    on:click={click}
  />
{/if}
{#if type === 'type-content-only'}
  {#if items.length}
    <div class="flex-row-center flex-wrap flex-gap-1-5">
      {#each items as value}
        <SurveyReferencePresenter
          attr={undefined}
          isEditable
          {value}
          kind={'todo'}
          {...contentParams}
          on:remove={(res) => removeSurvey(res.detail)}
        />
      {/each}
    </div>
  {/if}
{/if}
