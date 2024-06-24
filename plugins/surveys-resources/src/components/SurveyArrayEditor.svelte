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
    import { onDestroy } from 'svelte'
    import surveys from '@hcengineering/surveys'
  import { IntlString } from '@hcengineering/platform'
  import { Account, Ref } from '@hcengineering/core'
  import { ButtonKind, ButtonSize } from '@hcengineering/ui'
  import { createQuery, getClient } from '@hcengineering/presentation'
  import SurveysList from './SurveysList.svelte'
  
    export let label: IntlString
    export let value: Ref<Account>[]
    export let onChange: ((refs: Ref<Account>[]) => void | Promise<void>) | undefined
    export let readonly = false
    export let kind: ButtonKind = 'link'
    export let size: ButtonSize = 'large'
    export let width: string | undefined = undefined
    export let includeItems: Ref<Account>[] | undefined = undefined
    export let excludeItems: Ref<Account>[] | undefined = undefined
    export let emptyLabel: IntlString | undefined = undefined
    export let allowGuests: boolean = false
  
    let timer: any = null
    const client = getClient()
    let update: (() => Promise<void>) | undefined
  
    function onUpdate (evt: any): void {
      console.log(evt);
    }
  
    onDestroy(() => {
      void update?.()
    })
  
    const excludedQuery = createQuery()
    let excluded: Account[] = []
    // $: if (excludeItems !== undefined && excludeItems.length > 0) {
    //   excludedQuery.query(core.class.Account, { _id: { $in: excludeItems } }, (res) => {
    //     excluded = res
    //   })
    // } else {
    //   excludedQuery.unsubscribe()
    //   excluded = []
    // }
  
    const includedQuery = createQuery()
    let included: Account[] = []
    // $: if (includeItems !== undefined && includeItems.length > 0) {
    //   includedQuery.query(core.class.Account, { _id: { $in: includeItems } }, (res) => {
    //     included = res
    //   })
    // } else {
    //   includedQuery.unsubscribe()
    //   included = []
    // }
  
    // $: employees = Array.from(
    //   (value ?? []).map((it) => $personAccountByIdStore.get(it as Ref<PersonAccount>)?.person)
    // ).filter((it) => it !== undefined) as Ref<Employee>[]
  
    // $: docQuery =
    //   excluded.length === 0 && included.length === 0
    //     ? {}
    //     : {
    //         _id: {
    //           ...(included.length > 0
    //             ? {
    //                 $in: included.map((p) => (p as PersonAccount).person as Ref<Employee>)
    //               }
    //             : {}),
    //           ...(excluded.length > 0
    //             ? {
    //                 $nin: excluded.map((p) => (p as PersonAccount).person as Ref<Employee>)
    //               }
    //             : {})
    //         }
    //       }
  
    // const hierarchy = client.getHierarchy()
    // const me = getCurrentAccount() as PersonAccount
  
    // function sort (a: Contact, b: Contact): number {
    //   if (me.person === a._id) {
    //     return -1
    //   }
    //   if (me.person === b._id) {
    //     return 1
    //   }
    //   const aIncludes = employees.includes(a._id as Ref<Employee>)
    //   const bIncludes = employees.includes(b._id as Ref<Employee>)
    //   if (aIncludes && !bIncludes) {
    //     return -1
    //   }
    //   if (!aIncludes && bIncludes) {
    //     return 1
    //   }
    //   const aName = getName(hierarchy, a)
    //   const bName = getName(hierarchy, b)
    //   return aName.localeCompare(bName)
    // }
  </script>
  
  <SurveysList
    _class={surveys.class.SurveyReference}
    items={[]}
    {label}
    {emptyLabel}
    {readonly}
    on:update={onUpdate}
    {size}
    justify={'left'}
    width={width ?? 'min-content'}
    {kind}
    create={allowGuests ? { component: surveys.component.SurveysPresenter, label: surveys.string.SurveyLabel } : undefined}
  />
  