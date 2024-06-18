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
  import { Ref } from '@hcengineering/core'
  import { SurveyElement } from '@hcengineering/surveys'
  import SurveyFilterPresenter from './SurveyFilterPresenter.svelte'
  import { createQuery } from '@hcengineering/presentation'
  import surveys from '../plugin'
  import CollapsedSurveys from './CollapsedSurveys.svelte'

  export let value: Ref<SurveyElement>[]

  let values: SurveyElement[] = []
  const query = createQuery()
  query.query(surveys.class.SurveyElement, { _id: { $in: value } }, (res) => {
    values = res
  })
</script>

{#if values.length < 4}
  <div class="flex flex-gap-1">
    {#each values as val}
      <SurveyFilterPresenter value={val} />
    {/each}
  </div>
{:else}
  <CollapsedSurveys {values} limit={4} />
{/if}
