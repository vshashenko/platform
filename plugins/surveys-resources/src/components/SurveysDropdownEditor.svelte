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
  import { IntlString, translate } from '@hcengineering/platform'
  import { KeyedAttribute } from '@hcengineering/presentation'
  import { SurveyElement } from '@hcengineering/surveys'
  import type { ButtonKind, ButtonSize, TooltipAlignment } from '@hcengineering/ui'
  import { Button, showPopup, themeStore } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'
  import SurveysPopup from './SurveysPopup.svelte'

  export let items: any[] = []
  export let targetClass: Ref<Class<Doc>>
  export let key: KeyedAttribute
  export let newElements: SurveyElement[] = []
  export let countLabel: IntlString

  export let kind: ButtonKind = 'no-border'
  export let size: ButtonSize = 'small'
  export let justify: 'left' | 'center' = 'center'
  export let width: string | undefined = undefined
  export let labelDirection: TooltipAlignment | undefined = undefined
  export let focusIndex = -1

  export let disabled: boolean = false

  const dispatch = createEventDispatcher()

  let keyLabel: string = ''

  $: itemLabel = (key.attr.type as Collection<AttachedDoc>).itemLabel

  $: void translate(itemLabel ?? key.attr.label, {}, $themeStore.language).then((v) => {
    keyLabel = v
  })

  async function addRef(survey: SurveyElement): Promise<void> {
    dispatch('open', survey)
  }
  async function addSurvey(evt: Event): Promise<void> {
    showPopup(
      SurveysPopup,
      {
        newElements,
        targetClass,
        selected: items.map((it) => it.survey),
        keyLabel
      },
      evt.target as HTMLElement,
      () => {},
      (result) => {
        if (result !== undefined) {
          if (result.action === 'add') {
            void addRef(result.survey)
          } else if (result.action === 'remove') {
            const filtered = items.filter((it) => it.survey === result.survey._id)
            if (filtered.length > 0) {
              void removeSurvey(filtered[0]._id)
            }
          }
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

<Button
  {disabled}
  icon={key.attr.icon ?? surveys.icon.Surveys}
  label={items.length > 0 ? undefined : key.attr.label}
  notSelected={items.length === 0}
  width={width ?? 'min-content'}
  {kind}
  {size}
  {justify}
  {focusIndex}
  showTooltip={{ label: key.attr.label, direction: labelDirection }}
  on:click={addSurvey}
>
  <svelte:fragment slot="content">
    {#if items.length > 0}
      <span class="flex-row-center flex-nowrap overflow-label disabled">
        {#await translate(countLabel, { count: items.length }, $themeStore.language) then text}
          {text}
        {/await}
      </span>
    {/if}
  </svelte:fragment>
</Button>
