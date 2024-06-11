<!--
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
-->
<script lang="ts">
  import type { AttachedDoc, Class, Collection, Doc, Ref } from '@hcengineering/core'
  import { translate } from '@hcengineering/platform'
  import { KeyedAttribute } from '@hcengineering/presentation'
  import { SurveyElement } from '@hcengineering/surveys'
  import {
    Button,
    IconAdd,
    Label,
    ShowMore,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'
  import SurveysPopup from './SurveysPopup.svelte'

  export let items: any[] = []
  export let targetClass: Ref<Class<Doc>>
  export let key: KeyedAttribute
  export let showTitle = true

  const dispatch = createEventDispatcher()

  let keyLabel: string = ''

  $: itemLabel = (key.attr.type as Collection<AttachedDoc>).itemLabel

  $: translate(itemLabel ?? key.attr.label, {}, $themeStore.language).then((v) => {
    keyLabel = v
  })

  async function addRef(survey: SurveyElement): Promise<void> {
    dispatch('open', survey)
  }
  async function addSurvey(evt: Event): Promise<void> {
    showPopup(
      SurveysPopup,
      {
        targetClass,
        selected: items.map((it) => it.survey),
        keyLabel,
        hideAdd: false
      },
      evt.target as HTMLElement,
      () => {},
      (result) => {
        if (result !== undefined) {
          if (result.action === 'add') addRef(result.survey)
          else if (result.action === 'remove')
            removeSurvey(items.filter((it) => it.survey === result.survey._id)[0]._id)
        }
      },
      {
        refId: 'SurveysPopup',
        category: 'popup',
        overlay: true
      }
    )
  }

  async function removeSurvey(id: Ref<any>): Promise<void> {
    dispatch('delete', id)
  }
</script>

<div class="antiSection">
  {#if showTitle}
    <div class="antiSection-header">
      <span class="antiSection-header__title">
        <Label label={key.attr.label} />
      </span>
      <div class="buttons-group x-small">
        <Button
          icon={IconAdd}
          kind={'ghost'}
          showTooltip={{ label: surveys.string.AddSurveyTooltip, props: { word: keyLabel } }}
          id={'add-survey'}
          on:click={addSurvey}
        />
      </div>
    </div>
  {/if}
  <ShowMore ignore={!showTitle}>
    <div
      class:surveys-container={showTitle}
      class:antiComponent={showTitle}
      class:antiEmphasized={showTitle}
      class:mt-3={showTitle}
      class:empty={items.length === 0}
    >
      <div class="flex flex-grow flex-col" class:survey-items-scroll={!showTitle}>
        {#if items.length === 0}
          {#if keyLabel}
            <div class="text-sm content-dark-color w-full flex-center">
              <Label label={surveys.string.NoItems} params={{ word: keyLabel }} />
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </ShowMore>
</div>

<style lang="scss">
  .surveys-container {
    &.empty {
      background-color: transparent;
    }
  }
  .survey-items-scroll {
    overflow-y: scroll;
    max-height: 20rem;
  }
</style>
