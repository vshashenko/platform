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
  import { Class, Doc, FindOptions, Ref } from '@hcengineering/core'
  import { IntlString, translate } from '@hcengineering/platform'
  import { Button, Label, showPopup, IconAdd, themeStore } from '@hcengineering/ui'
  import surveys from '../plugin'
  import CreateSurveyElement from './CreateSurveyElement.svelte'
  import { TableBrowser } from '@hcengineering/view-resources'
  import SurveyElementPresenter from './SurveyElementPresenter.svelte'
  export let title: IntlString = surveys.string.Surveys
  export let item: IntlString = surveys.string.Survey
  export let сreateItemLabel: IntlString = surveys.string.SurveyCreateLabel
  export let targetClass: Ref<Class<Doc>>

  let keyTitle: string
  $: translate(item, {}, $themeStore.language).then((t) => {
    keyTitle = t.toLowerCase()
  })

  function showCreateDialog() {
    showPopup(CreateSurveyElement, { targetClass, keyTitle }, 'top')
  }
  console.log(surveys.class);
  
</script>

<div class="ac-header full divide">
  <div class="ac-header__wrap-title mr-3">
    <span class="ac-header__title"><Label label={title} /></span>
  </div>

  <div class="ac-header-full medium-gap mb-1">
    <slot />
    <Button icon={IconAdd} label={сreateItemLabel} kind={'primary'} on:click={showCreateDialog} />
  </div>
</div>
<TableBrowser
  _class={surveys.class.SurveyElement}
  config={[
    {
      key: '',
      label: item,
      presenter: surveys.component.SurveyElementPresenter,
      props: { edit: true, keyTitle },
      sortingKey: 'title'
    }
  ]}
  query={[]}
  showNotification
/>