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
  import { SurveyReference } from '@hcengineering/surveys'
  import { Button, ButtonKind, Icon, Label, getEventPopupPositionElement, showPopup } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import surveysPlugin from '../plugin'
  import DraftSurveysPopup from './DraftSurveysPopup.svelte'
  import SurveyReferencePresenter from './SurveyReferencePresenter.svelte'
  import SurveyIcon from './icons/SurveyIcon.svelte'

  export let surveys: SurveyReference[] = []
  export let targetClass: Ref<Class<Doc>>
  export let kind: ButtonKind = 'ghost'

  const dispatch = createEventDispatcher()

  function removeSurvey (survey: SurveyReference) {
    surveys = surveys.filter((t) => t !== survey)
    dispatch('change', surveys)
  }

  function click (evt: MouseEvent) {
    showPopup(
      DraftSurveysPopup,
      { targetClass, surveys },
      getEventPopupPositionElement(evt),
      undefined,
      (res) => {
        surveys = res
        dispatch('change', surveys)
      },
      {
        refId: 'SurveysPopup',
        category: 'popup',
        overlay: true
      }
    )
  }
</script>

<div>
  <Button {kind} padding={'0rem;'} on:click={click}>
    <div slot="content" class="flex-row-center flex-gap-1">
      <Icon icon={SurveyIcon} size={'medium'} />
      <span class="overflow-label label"><Label label={surveysPlugin.string.AddLabel} /></span>
    </div>
  </Button>
  {#if surveys.length}
    <div class="flex-row-center flex-wrap">
      {#each surveys as value}
        <div class="step-container clear-mins">
          <SurveyReferencePresenter
            attr={undefined}
            isEditable
            {value}
            kind={'list'}
            on:remove={(res) => {
              removeSurvey(res.detail)
            }}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .step-container {
    margin: 0.375rem 0.375rem 0 0;
  }
</style>
