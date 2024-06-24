<script lang="ts">
    import { Card, KeyedAttribute, createQuery, getClient } from '@hcengineering/presentation'
    import {
      DropdownTextItem,
      EditBox,
    } from '@hcengineering/ui'
    import { createEventDispatcher } from 'svelte'
    import surveys from '../plugin'
    import recruit from '@hcengineering/recruit'
    import { FormElementType, FormItem } from '@hcengineering/surveys'
    import { Class, Doc, Ref } from '@hcengineering/core'
  import { addFormItemType } from '../utils'
  
    export let keyTitle: string = ''
    export let type: FormElementType | ''
    export let targetClass: Ref<Class<Doc>>
    let formItemTypes: DropdownTextItem[] = []
  
    const client = getClient()
  
    async function createFormItemFnc(): Promise<void> {
      const res = await addFormItemType(formItemTypes, type)
      dispatch('close', res)
    }
  
    export function canClose(): boolean {
      return type === ''
    }

  
    // Form elements list
    let formElements: FormItem[] = []
    let selected: string | string[] = []
  
    const dispatch = createEventDispatcher()
  
    const query = createQuery()
  
    query.query(surveys.class.FormElement, { targetClass }, async (result) => {
      const newItems: DropdownTextItem[] = []
      console.log('result', result)
  
      for (const r of result) {
        newItems.push({
          id: r._id,
          label: 'yey'
        })
      }
    //   items = result
    //   formItems = newItems
    //   console.log('formItems', formItems);
    })
    const key: KeyedAttribute = {
      key: 'skills',
      attr: client.getHierarchy().getAttribute(recruit.mixin.Candidate, 'surveys')
    }
  </script>
  
  <Card
    label={surveys.string.AddFormItems}
    labelProps={{ word: keyTitle }}
    okAction={createFormItemFnc}
    canSave={type.trim().length > 0}
    on:close={() => {
      dispatch('close')
    }}
    on:changeContent
  >
  <div class="flex-row-top clear-mins">
    <div class="flex-col mt-0-5 w-full">
      <EditBox
        bind:value={type}
        placeholder={surveys.string.SurveyName}
        placeholderParam={{ word: "Form Item" }}
        kind={'large-style'}
        autoFocus
      />
    </div>
  </div>
  </Card>
  
  <style lang="scss">
    .color {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
    }
    .form-elements {
      margin-top: 1rem;
    }
    .form-element {
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .form-content {
      flex-grow: 1;
    }
    .remove-button {
      background: none;
      border: none;
      color: black;
      font-weight: bold;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin-left: 27px;
      margin-bottom: 110px;
      display: flex;
      align-items: start;
      justify-content: start;
    }
  </style>
  