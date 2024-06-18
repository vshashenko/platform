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
  import { Class, Doc, IdMap, Ref, toIdMap } from '@hcengineering/core'
  import { createQuery } from '@hcengineering/presentation'
  import { SurveyElement, SurveyReference } from '@hcengineering/surveys'
  import surveys from '../plugin'
  import SurveyItem from './SurveyItem.svelte'
  import { selectedSurveyElements } from '../utils'
  import { Label } from '@hcengineering/ui'

  export let object: Doc
  export let _class: Ref<Class<Doc>>

  let elements: IdMap<SurveyElement> = new Map()
  const elementQuery = createQuery()

  $: elementQuery.query(surveys.class.SurveyElement, { _id: { $in: items.map((it) => it.survey) } }, (result) => {
    elements = toIdMap(result)
  })

  let items: SurveyReference[] = []

  const query = createQuery()
  $: query.query(
    surveys.class.SurveyReference,
    { attachedTo: object._id, attachedToClass: _class },
    (res) => {
      items = res
    },
    { sort: { weight: -1, title: 1 } }
  )

</script>

<p>SURVEYSS PRESSENTATION</p>