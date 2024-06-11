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
  import type { IntlString } from '@hcengineering/platform'
  import presentation, { createQuery, getClient } from '@hcengineering/presentation'
  import { SurveyElement } from '@hcengineering/surveys'
  import {
    Button,
    EditWithIcon,
    IconAdd,
    IconSearch,
    Label,
    deviceOptionsStore,
    resizeObserver,
    showPopup,
  } from '@hcengineering/ui'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'
  import CreateSurveyElement from './CreateSurveyElement.svelte'
  import IconView from './icons/View.svelte'
  import IconViewHide from './icons/ViewHide.svelte'

  export let newElements: SurveyElement[] = []
  export let targetClass: Ref<Class<Doc>>
  export let placeholder: IntlString = presentation.string.Search
  export let placeholderParam: any | undefined = undefined
  export let selected: Ref<SurveyElement>[] = []
  export let keyLabel: string = ''
  export let hideAdd: boolean = false

  const surveyShowLimit = 50

  let search: string = ''
  let show: boolean = false
  let objects: SurveyElement[] = []
  let isSingleCategory = true
  let inProcess = false

  const dispatch = createEventDispatcher()
  const query = createQuery()

  // TODO: Add $not: {$in: []} query
  $: query.query(surveys.class.SurveyElement, { title: { $like: '%' + search + '%' }, targetClass }, (result) => {
    objects = newElements.concat(result)
  })

  async function onCreateSurveyElement(res: Ref<SurveyElement> | undefined | null): Promise<void> {
    if (res == null) return
    const survey = await getClient().findOne(surveys.class.SurveyElement, { _id: res })
    dispatch('update', { action: 'add', survey })
    selected = [...selected, res]
    inProcess = false
  }

  async function createSurveyElementPopup(): Promise<void> {
    showPopup(CreateSurveyElement, { targetClass, title: search }, 'top', onCreateSurveyElement)
  }

</script>

<div class="selectPopup maxHeight" use:resizeObserver={() => dispatch('changeContent')}>
  <div class="header flex-row-center gap-2">
    <EditWithIcon
      icon={IconSearch}
      size={'large'}
      width={'100%'}
      autoFocus={!$deviceOptionsStore.isMobile}
      bind:value={search}
      {placeholder}
      {placeholderParam}
      on:change
    />
    {#if !isSingleCategory}
      <Button
        kind={'ghost'}
        size={'large'}
        icon={show ? IconView : IconViewHide}
        on:click={() => {
          show = !show
        }}
      />
    {/if}
    {#if !hideAdd}<Button kind={'ghost'} size={'large'} icon={IconAdd} on:click={createSurveyElementPopup} />{/if}
  </div>
  <div class="scroll">
    <div class="box">
      {#if objects.length === 0}
        {#if !hideAdd && search !== ''}
          <button class="menu-item focus flex-row-center">
            <Label label={surveys.string.QuickAddItems} params={{ word: keyLabel, title: search }} />
          </button>
        {/if}
        <div class="empty">
          <Label label={surveys.string.NoItems} params={{ word: keyLabel }} />
        </div>
      {/if}
    </div>
  </div>
  <div class="menu-space" />
</div>

<style lang="scss">
  .counter {
    margin-top: -0.125rem;
    padding-right: 0.125rem;
    min-width: 1.5rem;
    text-align: right;
    font-size: 0.8125rem;
    color: var(--theme-caption-color);
  }
  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 0.75rem;
    color: var(--theme-dark-color);
  }
  .hidden {
    display: none;
  }
</style>
