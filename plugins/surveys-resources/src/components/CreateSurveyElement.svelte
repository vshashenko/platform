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
  import { Class, Doc, Ref } from '@hcengineering/core'
  import { Card, createQuery } from '@hcengineering/presentation'
  import {
    Button,
    DropdownLabels,
    DropdownTextItem,
    EditBox,
    eventToHTMLElement,
    getColorNumberByText,
    getPlatformColorDef,
    IconFolder,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import { ColorsPopup } from '@hcengineering/view-resources'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'
  import { getSurveyStyle } from '../utils'
  import { log } from 'console'

  export let keyTitle: string = ''
  export let title: string = ''

  let color: number = getColorNumberByText(title)

  let colorSet = false

  $: if (!colorSet) {
    color = getColorNumberByText(title)
  }

  export function canClose(): boolean {
    return title === ''
  }

  const dispatch = createEventDispatcher()

  const query = createQuery()

  // async function createSurveyElementFnc(): Promise<void> {
  //   const res = await createSurveyElement(title, color, [])
  //   dispatch('close', res)
  // }

  const showColorPopup = (evt: MouseEvent): void => {
    showPopup(
      ColorsPopup,
      { selected: getPlatformColorDef(color, $themeStore.dark).name },
      eventToHTMLElement(evt),
      (col) => {
        if (col != null) {
          color = col
          colorSet = true
        }
      }
    )
  }
</script>

<Card
  label={surveys.string.AddSurvey}
  labelProps={{ word: keyTitle }}
  okAction={() => console.log('ok')}
  canSave={title.trim().length > 0}
  on:close={() => {
    dispatch('close')
  }}
  on:changeContent
>
  <div class="flex-row-top clear-mins">
    <div class="mr-3">
      <Button size={'medium'} kind={'link-bordered'} on:click={showColorPopup}>
        <svelte:fragment slot="content">
          <div class="color pointer-events-none" style={getSurveyStyle(getPlatformColorDef(color, $themeStore.dark))} />
        </svelte:fragment>
      </Button>
    </div>
    <div class="flex-col mt-0-5 w-full">
      <EditBox
        bind:value={title}
        placeholder={surveys.string.SurveyName}
        placeholderParam={{ word: keyTitle }}
        kind={'large-style'}
        autoFocus
      />
    </div>
    
  </div>
  <svelte:fragment slot="pool">
      <div class="ml-12">
        <DropdownLabels
          icon={IconFolder}
          label={surveys.string.SurveyCreateLabel}
          kind={'regular'}
          size={'large'}
          bind:selected={title}
          items={[
            { label: 'Category 1', value: '1' },
            { label: 'Category 2', value: '2' },
            { label: 'Category 3', value: '3' }]}
          on:selected={() => {
          }}
        />
      </div>
  </svelte:fragment>
</Card>

<style lang="scss">
  .color {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
  }
</style>
