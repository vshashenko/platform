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
  import { Class, Doc, FindResult, Ref } from '@hcengineering/core'
  import presentation, { getClient } from '@hcengineering/presentation'
  import { SurveyElement } from '@hcengineering/surveys'
  import {
    Button,
    EditWithIcon,
    Icon,
    IconCheck,
    IconSearch,
    Label,
    Loading,
    deviceOptionsStore,
    getEventPopupPositionElement,
    getPlatformColorDef,
    resizeObserver,
    showPopup,
    themeStore
  } from '@hcengineering/ui'
  import { Filter } from '@hcengineering/view'
  import { FILTER_DEBOUNCE_MS, FilterQuery, sortFilterValues } from '@hcengineering/view-resources'
  import { createEventDispatcher } from 'svelte'
  import surveys from '../plugin'

  export let _class: Ref<Class<Doc>>
  export let filter: Filter
  export let onChange: (e: Filter) => void
  filter.onRemove = () => {
    FilterQuery.remove(filter.index)
  }
  const client = getClient()
  let selected: Ref<SurveyElement>[] = filter.value
  let level: number = filter.props?.level ?? 0

  filter.modes = [surveys.filter.FilterSurveysIn, surveys.filter.FilterSurveysNin]
  filter.mode = filter.mode === undefined ? filter.modes[0] : filter.mode

  let filterUpdateTimeout: any | undefined

  let objects: SurveyElement[] = []

  let catsSorted = false

  let objectsPromise: Promise<FindResult<SurveyElement>> | undefined
  let queryId = 0

  async function getValues (search: string): Promise<void> {
    const qid = ++queryId
    const resultQuery =
      search !== ''
        ? {
            title: { $like: search.replace('*', '%') + '%' },
            targetClass: _class
          }
        : { targetClass: _class }
    objectsPromise = client.findAll(surveys.class.SurveyElement, resultQuery)
    console.log('objectsPromise', objectsPromise);
    
    const _objects = sortFilterValues(await objectsPromise, isSelected)
    if (qid !== queryId) {
      return
    }
    objects = _objects
    objectsPromise = undefined
  }

  let search: string = ''

  const toggleGroup = (ev: MouseEvent): void => {
    const el: HTMLElement = ev.currentTarget as HTMLElement
    el.classList.toggle('show')
  }

  const getCount = (cat: any): string => {
    const count = objects.filter((el) => el.title === cat._id).filter((it) => selected.includes(it._id)).length
    if (count > 0) return count.toString()
    return ''
  }

  const isSelected = (element: SurveyElement): boolean => {
    if (selected.filter((p) => p === element._id).length > 0) return true
    return false
  }

  function handleFilterToggle (element: SurveyElement): void {
    if (isSelected(element)) {
      selected = selected.filter((p) => p !== element._id)
    } else {
      selected = [...selected, element._id]
    }
    objects = objects

    updateFilter(selected, level)
  }

  function updateFilter (newValues: Ref<SurveyElement>[], newLevel: number) {
    clearTimeout(filterUpdateTimeout)

    filterUpdateTimeout = setTimeout(() => {
      filter.value = [...newValues]
      // Replace last one with value with level
      filter.props = { level: newLevel }
      onChange(filter)
    }, FILTER_DEBOUNCE_MS)
  }

  $: schema = filter.key.attribute.schema ?? '0'

  const dispatch = createEventDispatcher()
  getValues(search)

  $: surveyLevelIcon = undefined
  $: surveyLevelLabel = [surveys.string.Initial][0]
</script>

<div class="selectPopup" use:resizeObserver={() => dispatch('changeContent')}>
  <div class="header">
    <EditWithIcon
      icon={IconSearch}
      size={'large'}
      width={'100%'}
      autoFocus={!$deviceOptionsStore.isMobile}
      bind:value={search}
      placeholder={presentation.string.Search}
      on:input={() => getValues(search)}
    />
  </div>
  <div class="scroll">
    <div class="box">
      {#if objectsPromise}
        <Loading />
      {/if}
    </div>
  </div>
  <div class="menu-space" />
</div>

<style>
  .hidden {
    display: none;
  }
</style>
