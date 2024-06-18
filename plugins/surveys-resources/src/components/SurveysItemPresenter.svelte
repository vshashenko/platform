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
  import { SurveyReference } from '@hcengineering/surveys'
  import SurveyReferencePresenter from './SurveyReferencePresenter.svelte'
  import SurveyItem from './SurveyItem.svelte'

  export let value: SurveyReference[] | SurveyReference
  export let kind: 'survey' | 'list' | 'link' = 'survey'

  $: values = Array.isArray(value) ? value : [value]
</script>

{#if kind === 'list' || kind === 'link'}
  <div class="flex-center flex-wrap">
    {#each values as v}
      <div class="m-0-5">
        <SurveyReferencePresenter attr={undefined} value={v} {kind} />
      </div>
    {/each}
  </div>
{:else}
  {#each values as v}
    <SurveyItem survey={v} />
  {/each}
{/if}
