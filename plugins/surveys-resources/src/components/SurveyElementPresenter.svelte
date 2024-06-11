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
  import { Asset } from '@hcengineering/platform'
  import { SurveyElement } from '@hcengineering/surveys'
  import { AnySvelteComponent, eventToHTMLElement, showPopup } from '@hcengineering/ui'
  import EditSurveyElement from './EditSurveyElement.svelte'
  import SurveyItem from './SurveyItem.svelte'

  export let value: SurveyElement
  export let action: Asset | AnySvelteComponent | undefined = undefined
  export let edit: boolean = false
  export let keyTitle: string = ''
</script>

{#if value}
  {#if edit}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="over-underline"
      on:click={(evt) => {
        showPopup(EditSurveyElement, { value, keyTitle }, eventToHTMLElement(evt))
      }}
    >
      <SurveyItem element={value} {action} on:action />
    </div>
  {:else}
    <SurveyItem element={value} {action} on:action />
  {/if}
{/if}
